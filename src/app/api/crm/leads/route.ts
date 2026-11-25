import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { leadSchema } from "@/lib/validations/schemas";
import { createAuditLog } from "@/lib/services/audit";
import { z } from "zod";
import type { LeadStatus, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_READ);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const sp = req.nextUrl.searchParams;
  const search = sp.get("search")?.trim() || "";
  const status = sp.get("status")?.trim() || "";
  const sourceId = sp.get("sourceId")?.trim() || "";
  const ownerId = sp.get("ownerId")?.trim() || "";
  const sortBy = sp.get("sortBy") || "createdAt";
  const sortDir = sp.get("sortDir") === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(sp.get("page") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(sp.get("pageSize") || 10)));

  const where: Prisma.LeadWhereInput = {
    organizationId: orgId,
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { companyName: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status && status !== "ALL") {
    where.status = status as LeadStatus;
  }
  if (sourceId && sourceId !== "ALL") {
    where.sourceId = sourceId;
  }
  if (ownerId && ownerId !== "ALL") {
    where.ownerId = ownerId;
  }

  const orderBy: Prisma.LeadOrderByWithRelationInput =
    sortBy === "score"
      ? { score: sortDir }
      : sortBy === "name"
        ? { name: sortDir }
        : sortBy === "estimatedValue"
          ? { estimatedValue: sortDir }
          : { createdAt: sortDir };

  const [total, leads, statusCounts, sources, owners] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      include: {
        source: true,
        owner: { select: { id: true, name: true, email: true } },
        tags: { include: { tag: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: { organizationId: orgId, deletedAt: null },
      _count: { status: true },
    }),
    prisma.leadSource.findMany({
      where: { organizationId: orgId },
      orderBy: { name: "asc" },
    }),
    prisma.membership.findMany({
      where: { organizationId: orgId, status: "ACTIVE" },
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  return NextResponse.json({
    leads,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    statusCounts: Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count.status])
    ),
    sources,
    owners: owners.map((m) => m.user),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid lead data" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  let sourceId: string | null = null;
  if (d.sourceName?.trim()) {
    const src = await prisma.leadSource.upsert({
      where: {
        organizationId_name: {
          organizationId: orgId,
          name: d.sourceName.trim(),
        },
      },
      update: {},
      create: {
        organizationId: orgId,
        name: d.sourceName.trim(),
        color: "#3b82f6",
      },
    });
    sourceId = src.id;
  }

  const lead = await prisma.lead.create({
    data: {
      organizationId: orgId,
      sourceId,
      ownerId: d.ownerId || auth.session.userId,
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      companyName: d.companyName || null,
      serviceInterest: d.serviceInterest || null,
      status: d.status,
      score: d.score,
      estimatedValue: d.estimatedValue ?? null,
      followUpDate: d.followUpDate ? new Date(d.followUpDate) : null,
      notes: d.notes || null,
    },
    include: { source: true, owner: { select: { id: true, name: true } } },
  });

  if (d.tags.length > 0) {
    for (const tagName of d.tags) {
      const clean = tagName.trim();
      if (!clean) continue;
      const tag = await prisma.tag.upsert({
        where: { organizationId_name: { organizationId: orgId, name: clean } },
        update: {},
        create: { organizationId: orgId, name: clean },
      });
      await prisma.leadTag.create({ data: { leadId: lead.id, tagId: tag.id } });
    }
  }

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: "CREATE_LEAD",
    entity: "Lead",
    entityId: lead.id,
    metadata: { name: lead.name, email: lead.email },
  });

  return NextResponse.json({ lead }, { status: 201 });
}

const bulkActionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  action: z.enum(["status", "owner", "delete"]),
  value: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();
  const parsed = bulkActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bulk request" }, { status: 400 });
  }

  const { ids, action, value } = parsed.data;

  if (action === "delete") {
    const delAuth = await requireApiAuth(PERMISSIONS.CRM_DELETE);
    if (delAuth.error) return delAuth.error;
    await prisma.lead.updateMany({
      where: { organizationId: orgId, id: { in: ids } },
      data: { deletedAt: new Date() },
    });
  } else if (action === "status" && value) {
    await prisma.lead.updateMany({
      where: { organizationId: orgId, id: { in: ids } },
      data: { status: value as LeadStatus },
    });
  } else if (action === "owner" && value) {
    await prisma.lead.updateMany({
      where: { organizationId: orgId, id: { in: ids } },
      data: { ownerId: value },
    });
  }

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: `BULK_LEAD_${action.toUpperCase()}`,
    entity: "Lead",
    metadata: { ids, value },
  });

  return NextResponse.json({ success: true });
}
