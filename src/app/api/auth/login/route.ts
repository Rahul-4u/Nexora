import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validations/schemas";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { ROLE_DEFAULT_PERMISSIONS, ALL_PERMISSIONS } from "@/lib/permissions/rbac";
import { checkRateLimit } from "@/lib/utilities/rate-limit";
import { createAuditLog } from "@/lib/services/audit";
import type { RoleCode } from "@prisma/client";

const DEMO_USERS: Record<
  string,
  {
    name: string;
    role: RoleCode;
    orgId: string;
    orgName: string;
    orgSlug: string;
    password?: string;
  }
> = {
  "admin@nexora.agency": {
    name: "Alex Rivera",
    role: "SUPER_ADMIN",
    orgId: "org-nexora-default",
    orgName: "Nexora Agency",
    orgSlug: "nexora-agency",
    password: "Nexora@2026!",
  },
  "sales@nexora.agency": {
    name: "Marcus Vance",
    role: "SALES_MANAGER",
    orgId: "org-nexora-default",
    orgName: "Nexora Agency",
    orgSlug: "nexora-agency",
    password: "Nexora@2026!",
  },
  "hr@nexora.agency": {
    name: "Elena Rostova",
    role: "HR_MANAGER",
    orgId: "org-nexora-default",
    orgName: "Nexora Agency",
    orgSlug: "nexora-agency",
    password: "Nexora@2026!",
  },
  "finance@nexora.agency": {
    name: "David Chen",
    role: "FINANCE_MANAGER",
    orgId: "org-nexora-default",
    orgName: "Nexora Agency",
    orgSlug: "nexora-agency",
    password: "Nexora@2026!",
  },
  "pm@nexora.agency": {
    name: "Sarah Jenkins",
    role: "PROJECT_MANAGER",
    orgId: "org-nexora-default",
    orgName: "Nexora Agency",
    orgSlug: "nexora-agency",
    password: "Nexora@2026!",
  },
  "marketing@nexora.agency": {
    name: "Liam O'Connor",
    role: "MARKETING",
    orgId: "org-nexora-default",
    orgName: "Nexora Agency",
    orgSlug: "nexora-agency",
    password: "Nexora@2026!",
  },
  "client@brightlabs.io": {
    name: "Sophia Martinez",
    role: "CLIENT",
    orgId: "org-nexora-default",
    orgName: "BrightLabs",
    orgSlug: "brightlabs",
    password: "Nexora@2026!",
  },
};

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
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Try querying real database if connected
    let user = null;
    let dbConnected = true;

    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
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
    } catch {
      dbConnected = false;
    }

    // 2. If DB user was found, authenticate against database
    if (dbConnected && user && user.isActive && !user.deletedAt) {
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
      }).catch(() => {});

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
    }

    // 3. Graceful offline fallback: Check demo accounts or offline dev mode
    const demo = DEMO_USERS[normalizedEmail];
    if (demo) {
      if (demo.password && password !== demo.password && password !== "Nexora@2026!") {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const payload = {
        userId: `demo-${normalizedEmail.replace(/[^a-z0-9]/g, "-")}`,
        email: normalizedEmail,
        name: demo.name,
        organizationId: demo.orgId,
        organizationName: demo.orgName,
        organizationSlug: demo.orgSlug,
        role: demo.role,
        permissions: ROLE_DEFAULT_PERMISSIONS[demo.role] ?? ALL_PERMISSIONS,
      };

      await setSessionCookie(payload);

      return NextResponse.json({
        user: {
          id: payload.userId,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          organizationName: payload.organizationName,
        },
      });
    }

    // 4. If database is offline, allow dev user login
    if (!dbConnected) {
      const fallbackName = normalizedEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const payload = {
        userId: `offline-${normalizedEmail.replace(/[^a-z0-9]/g, "-")}`,
        email: normalizedEmail,
        name: fallbackName,
        organizationId: "org-nexora-default",
        organizationName: "Nexora Workspace",
        organizationSlug: "nexora-workspace",
        role: "ORG_ADMIN" as RoleCode,
        permissions: ROLE_DEFAULT_PERMISSIONS.ORG_ADMIN ?? ALL_PERMISSIONS,
      };

      await setSessionCookie(payload);

      return NextResponse.json({
        user: {
          id: payload.userId,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          organizationName: payload.organizationName,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Unable to sign in right now. Please try again." },
      { status: 500 }
    );
  }
}
