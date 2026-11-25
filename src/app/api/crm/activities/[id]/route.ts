import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (auth.error) return auth.error;
  const { id } = await context.params;

  const existing = await prisma.activity.findFirst({
    where: { id, organizationId: auth.session.organizationId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const activity = await prisma.activity.update({
    where: { id },
    data: {
      status: body.status ?? existing.status,
      completedAt: body.status === "COMPLETED" ? new Date() : existing.completedAt,
    },
  });

  return NextResponse.json({ activity });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (auth.error) return auth.error;
  const { id } = await context.params;

  const existing = await prisma.activity.findFirst({
    where: { id, organizationId: auth.session.organizationId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.activity.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
