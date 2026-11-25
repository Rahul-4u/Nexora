import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validations/schemas";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { ALL_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from "@/lib/permissions/rbac";
import { checkRateLimit } from "@/lib/utilities/rate-limit";
import { createAuditLog } from "@/lib/services/audit";
import { sendEmail } from "@/lib/services/email";
import { slugify } from "@/lib/utils";
import type { RoleCode } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const rate = checkRateLimit(`auth-register:${ip}`, 8, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid registration details" },
        { status: 400 }
      );
    }

    const { name, email, password, organizationName } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const orgLabel = organizationName?.trim() || `${name}'s Workspace`;
    const baseSlug = slugify(orgLabel) || "workspace";
    const uniqueSlug = `${baseSlug}-${crypto.randomBytes(2).toString("hex")}`;
    const verifyToken = crypto.randomBytes(24).toString("hex");

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: orgLabel,
          slug: uniqueSlug,
          isDefault: false,
        },
      });

      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
        },
      });

      const adminRole = await tx.role.create({
        data: {
          organizationId: organization.id,
          code: "ORG_ADMIN" as RoleCode,
          name: "Organization Admin",
          description: "Full administrative access to the organization",
        },
      });

      await tx.membership.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          roleId: adminRole.id,
          status: "ACTIVE",
        },
      });

      const pipeline = await tx.pipeline.create({
        data: {
          organizationId: organization.id,
          name: "Default Sales Pipeline",
          isDefault: true,
        },
      });

      const defaultStages = [
        { name: "New", color: "#3b82f6", probability: 15, position: 1 },
        { name: "Qualified", color: "#6366f1", probability: 35, position: 2 },
        { name: "Proposal", color: "#8b5cf6", probability: 60, position: 3 },
        { name: "Negotiation", color: "#f59e0b", probability: 80, position: 4 },
        { name: "Closed Won", color: "#10b981", probability: 100, position: 5, isWonStage: true },
        { name: "Closed Lost", color: "#ef4444", probability: 0, position: 6, isLostStage: true },
      ];

      await tx.pipelineStage.createMany({
        data: defaultStages.map((s) => ({ ...s, pipelineId: pipeline.id })),
      });

      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          token: verifyToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      return { organization, user };
    });

    await setSessionCookie({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      organizationId: result.organization.id,
      organizationName: result.organization.name,
      organizationSlug: result.organization.slug,
      role: "ORG_ADMIN",
      permissions: ROLE_DEFAULT_PERMISSIONS.ORG_ADMIN ?? ALL_PERMISSIONS,
    });

    await createAuditLog({
      organizationId: result.organization.id,
      userId: result.user.id,
      action: "USER_REGISTER",
      entity: "Organization",
      entityId: result.organization.id,
      ipAddress: ip,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await sendEmail({
      to: result.user.email,
      subject: "Verify your Nexora workspace email",
      html: `<p>Welcome to Nexora, ${result.user.name}!</p><p>Verify your email: <a href="${appUrl}/api/auth/verify-email?token=${verifyToken}">Verify Email</a></p>`,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          organizationName: result.organization.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Unable to create workspace right now." },
      { status: 500 }
    );
  }
}
