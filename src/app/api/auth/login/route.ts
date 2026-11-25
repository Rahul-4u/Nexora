import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validations/schemas";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { ROLE_DEFAULT_PERMISSIONS } from "@/lib/permissions/rbac";
import { checkRateLimit } from "@/lib/utilities/rate-limit";
import { createAuditLog } from "@/lib/services/audit";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const rate = checkRateLimit(`auth-login:${ip}`, 15, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid credentials" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          include: {
            organization: true,
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!user || !user.isActive || user.deletedAt) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const membership = user.memberships[0];
    if (!membership || membership.organization.deletedAt) {
      return NextResponse.json(
        { error: "No active organization membership found for this account." },
        { status: 403 }
      );
    }

    const dbPerms = membership.role.permissions.map((rp) => rp.permission.key);
    const permissions =
      dbPerms.length > 0
        ? dbPerms
        : ROLE_DEFAULT_PERMISSIONS[membership.role.code] ?? [];

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      organizationId: membership.organization.id,
      organizationName: membership.organization.name,
      organizationSlug: membership.organization.slug,
      role: membership.role.code,
      permissions,
    };

    await setSessionCookie(payload);

    await createAuditLog({
      organizationId: membership.organization.id,
      userId: user.id,
      action: "USER_LOGIN",
      entity: "User",
      entityId: user.id,
      ipAddress: ip,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: membership.role.code,
        organizationName: membership.organization.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Unable to sign in right now. Verify database connection." },
      { status: 500 }
    );
  }
}
