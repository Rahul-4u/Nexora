import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { companySchema } from "@/lib/validations/modules";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_READ);
  if (auth.error) return auth.error;
  const { id } = await context.params;

  const company = await prisma.company.findFirst({
    where: { id, organizationId: auth.session.organizationId, deletedAt: null },
    include: {
      contacts: { where: { deletedAt: null } },
      deals: { where: { deletedAt: null }, include: { stage: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });
  return NextResponse.json({ company });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (auth.error) return auth.error;
  const { id } = await context.params;

  const existing = await prisma.company.findFirst({
    where: { id, organizationId: auth.session.organizationId, deletedAt: null },
  });
  if (!existing) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const body = await req.json();
  const parsed = companySchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const company = await prisma.company.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ company });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_DELETE);
  if (auth.error) return auth.error;
  const { id } = await context.params;

  const existing = await prisma.company.findFirst({
    where: { id, organizationId: auth.session.organizationId, deletedAt: null },
  });
  if (!existing) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  await prisma.company.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
