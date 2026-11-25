import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getServerSession, setSessionCookie } from "@/lib/auth/session";
import { ROLE_DEFAULT_PERMISSIONS } from "@/lib/permissions/rbac";

const switchOrgSchema = z.object({
  organizationId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = switchOrgSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid organizationId" }, { status: 400 });
  }

  const membership = await prisma.membership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: parsed.data.organizationId,
        userId: session.userId,
      },
    },
    include: {
      organization: true,
      role: {
        include: { permissions: { include: { permission: true } } },
      },
    },
  });

  if (!membership || membership.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Access denied for target organization" },
      { status: 403 }
    );
  }

  const dbPerms = membership.role.permissions.map((rp) => rp.permission.key);
  const permissions =
    dbPerms.length > 0
      ? dbPerms
      : ROLE_DEFAULT_PERMISSIONS[membership.role.code] ?? [];

  await setSessionCookie({
    ...session,
    organizationId: membership.organization.id,
    organizationName: membership.organization.name,
    organizationSlug: membership.organization.slug,
    role: membership.role.code,
    permissions,
  });

  return NextResponse.json({ success: true });
}
