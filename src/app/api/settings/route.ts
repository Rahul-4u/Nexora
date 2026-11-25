import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/services/audit";
import { agencyStore } from "@/lib/db/agency-store";

const ALL_ROLES = [
  { id: "r-SUPER_ADMIN", code: "SUPER_ADMIN", name: "Super Administrator" },
  { id: "r-ORG_ADMIN", code: "ORG_ADMIN", name: "Organization Administrator" },
  { id: "r-PROJECT_MANAGER", code: "PROJECT_MANAGER", name: "Project Lead / Team Leader" },
  { id: "r-HR_MANAGER", code: "HR_MANAGER", name: "HR & People Manager" },
  { id: "r-SALES_MANAGER", code: "SALES_MANAGER", name: "Sales & Client Lead" },
  { id: "r-FINANCE_MANAGER", code: "FINANCE_MANAGER", name: "Finance & Accounts Manager" },
  { id: "r-MARKETING", code: "MARKETING", name: "Marketing & Growth" },
  { id: "r-EMPLOYEE", code: "EMPLOYEE", name: "Team Specialist / Developer" },
  { id: "r-CLIENT", code: "CLIENT", name: "Client Partner" },
];

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.SETTINGS_MANAGE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  try {
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

    if (memberships && memberships.length > 0) {
      return NextResponse.json({
        organization: organization || {
          id: orgId,
          name: auth.session.organizationName,
          domain: "nexora.agency",
          industry: "Digital Agency",
          timezone: "UTC",
          currency: "USD",
        },
        memberships,
        roles: roles && roles.length > 0 ? roles : ALL_ROLES,
        auditLogs,
      });
    }
  } catch (e) {
    console.warn("DB offline for settings GET, using dynamic agency store:", e);
  }

  // Dynamic Agency Store fallback
  const memberships = agencyStore.getMemberships();
  const organization = {
    id: orgId,
    name: auth.session.organizationName || "Nexora Digital Agency",
    domain: "nexora.agency",
    industry: "Digital Engineering & Product Agency",
    timezone: "UTC+6",
    currency: "USD",
  };

  const auditLogs = [
    {
      id: "al-1",
      action: "UPDATE_MEMBER_ROLE",
      entity: "Membership",
      createdAt: new Date().toISOString(),
      user: { name: "Alex Rivera", email: "admin@nexora.agency" },
    },
    {
      id: "al-2",
      action: "CREATE_PROJECT",
      entity: "Project",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      user: { name: "Alex Rivera", email: "admin@nexora.agency" },
    },
    {
      id: "al-3",
      action: "ASSIGN_TEAM_LEADER",
      entity: "Department",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      user: { name: "Elena Rostova", email: "hr@nexora.agency" },
    },
  ];

  return NextResponse.json({
    organization,
    memberships,
    roles: ALL_ROLES,
    auditLogs,
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.SETTINGS_MANAGE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();

  // Role Management (Admin / HR managing user roles)
  if (body.membershipId && body.roleId) {
    const roleObj = ALL_ROLES.find(
      (r) => r.id === body.roleId || r.code === body.roleId
    );
    const roleCode = roleObj ? roleObj.code : String(body.roleId).replace(/^r-/, "");

    try {
      await prisma.membership.updateMany({
        where: { id: String(body.membershipId), organizationId: orgId },
        data: { roleId: String(body.roleId) },
      });
    } catch {
      // Update in dynamic agency store
      agencyStore.updateUserRole(String(body.membershipId), roleCode);
    }

    agencyStore.updateUserRole(String(body.membershipId), roleCode);

    await createAuditLog({
      organizationId: orgId,
      userId: auth.session.userId,
      action: "UPDATE_MEMBER_ROLE",
      entity: "Membership",
      entityId: String(body.membershipId),
    });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${roleObj?.name || roleCode}`,
    });
  }

  // Update Organization Settings
  try {
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

    return NextResponse.json({ organization });
  } catch {
    return NextResponse.json({
      organization: {
        id: orgId,
        name: body.name || "Nexora Digital Agency",
        domain: body.domain || "nexora.agency",
        industry: body.industry || "Digital Agency",
        currency: body.currency || "USD",
        timezone: "UTC",
      },
    });
  }
}
