import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { leadSchema } from "@/lib/validations/schemas";
import { createAuditLog } from "@/lib/services/audit";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_READ);
  if (auth.error) return auth.error;
  const { id } = await context.params;

  const lead = await prisma.lead.findFirst({
    where: {
      id,
      organizationId: auth.session.organizationId,
      deletedAt: null,
    },
    include: {
      source: true,
      owner: { select: { id: true, name: true, email: true } },
      tags: { include: { tag: true } },
      activities: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      tasks: {
        include: { assignee: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      deals: {
        include: { stage: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ lead });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const orgId = auth.session.organizationId;

  const existing = await prisma.lead.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = leadSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid update payload" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  let sourceId = existing.sourceId;
  if (d.sourceName !== undefined) {
    if (d.sourceName?.trim()) {
      const src = await prisma.leadSource.upsert({
        where: {
          organizationId_name: { organizationId: orgId, name: d.sourceName.trim() },
        },
        update: {},
        create: { organizationId: orgId, name: d.sourceName.trim(), color: "#3b82f6" },
      });
      sourceId = src.id;
    } else {
      sourceId = null;
    }
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      name: d.name ?? existing.name,
      email: d.email ?? existing.email,
      phone: d.phone !== undefined ? d.phone : existing.phone,
      companyName: d.companyName !== undefined ? d.companyName : existing.companyName,
      serviceInterest:
        d.serviceInterest !== undefined ? d.serviceInterest : existing.serviceInterest,
      status: d.status ?? existing.status,
      score: d.score ?? existing.score,
      estimatedValue:
        d.estimatedValue !== undefined ? d.estimatedValue : existing.estimatedValue,
      followUpDate:
        d.followUpDate !== undefined
          ? d.followUpDate
            ? new Date(d.followUpDate)
            : null
          : existing.followUpDate,
      notes: d.notes !== undefined ? d.notes : existing.notes,
      ownerId: d.ownerId !== undefined ? d.ownerId : existing.ownerId,
      sourceId,
    },
    include: { source: true, owner: { select: { id: true, name: true } } },
  });

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: "UPDATE_LEAD",
    entity: "Lead",
    entityId: lead.id,
  });

  return NextResponse.json({ lead });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_DELETE);
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const orgId = auth.session.organizationId;

  const existing = await prisma.lead.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  await prisma.lead.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: "DELETE_LEAD",
    entity: "Lead",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
