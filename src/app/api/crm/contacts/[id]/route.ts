import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { contactSchema } from "@/lib/validations/modules";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_READ);
  if (auth.error) return auth.error;
  const { id } = await context.params;

  const contact = await prisma.contact.findFirst({
    where: { id, organizationId: auth.session.organizationId, deletedAt: null },
    include: {
      company: true,
      owner: { select: { id: true, name: true } },
      deals: { include: { stage: true } },
      activities: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  return NextResponse.json({ contact });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (auth.error) return auth.error;
  const { id } = await context.params;

  const existing = await prisma.contact.findFirst({
    where: { id, organizationId: auth.session.organizationId, deletedAt: null },
  });
  if (!existing) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

  const body = await req.json();
  const parsed = contactSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact update" }, { status: 400 });
  }

  const { tags: _tags, ...scalarData } = parsed.data;
  void _tags;
  const contact = await prisma.contact.update({
    where: { id },
    data: scalarData,
  });

  return NextResponse.json({ contact });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_DELETE);
  if (auth.error) return auth.error;
  const { id } = await context.params;

  const existing = await prisma.contact.findFirst({
    where: { id, organizationId: auth.session.organizationId, deletedAt: null },
  });
  if (!existing) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

  await prisma.contact.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
