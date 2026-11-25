import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/services/audit";

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.SETTINGS_MANAGE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const [organization, memberships, roles, auditLogs] = await Promise.all([
    prisma.organization.findUnique({ where: { id: orgId } }),
    prisma.membership.findMany({
      where: { organizationId: orgId },
      include: {
        user: { select: { id: true, name: true, email: true, lastLoginAt: true } },
        role: { select: { id: true, code: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.role.findMany({
      where: { organizationId: orgId },
      orderBy: { name: "asc" },
    }),
    prisma.auditLog.findMany({
      where: { organizationId: orgId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  return NextResponse.json({ organization, memberships, roles, auditLogs });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.SETTINGS_MANAGE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();

  if (body.membershipId && body.roleId) {
    await prisma.membership.updateMany({
      where: { id: String(body.membershipId), organizationId: orgId },
      data: { roleId: String(body.roleId) },
    });
    await createAuditLog({
      organizationId: orgId,
      userId: auth.session.userId,
      action: "UPDATE_MEMBER_ROLE",
      entity: "Membership",
      entityId: String(body.membershipId),
    });
    return NextResponse.json({ success: true });
  }

  const organization = await prisma.organization.update({
    where: { id: orgId },
    data: {
      name: body.name ? String(body.name) : undefined,
      domain: body.domain !== undefined ? String(body.domain) : undefined,
      industry: body.industry !== undefined ? String(body.industry) : undefined,
      timezone: body.timezone ? String(body.timezone) : undefined,
      currency: body.currency ? String(body.currency) : undefined,
    },
  });

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: "UPDATE_ORGANIZATION_SETTINGS",
    entity: "Organization",
    entityId: orgId,
  });

  return NextResponse.json({ organization });
}
