import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { dealSchema } from "@/lib/validations/schemas";
import { createAuditLog } from "@/lib/services/audit";

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.CRM_READ);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const [pipeline, deals, companies, contacts] = await Promise.all([
    prisma.pipeline.findFirst({
      where: { organizationId: orgId },
      include: { stages: { orderBy: { position: "asc" } } },
      orderBy: { isDefault: "desc" },
    }),
    prisma.deal.findMany({
      where: { organizationId: orgId, deletedAt: null },
      include: {
        stage: true,
        owner: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        history: { orderBy: { createdAt: "desc" }, take: 5 },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.company.findMany({
      where: { organizationId: orgId, deletedAt: null },
      select: { id: true, name: true },
    }),
    prisma.contact.findMany({
      where: { organizationId: orgId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  return NextResponse.json({
    pipeline,
    stages: pipeline?.stages ?? [],
    deals,
    companies,
    contacts,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();
  if (body.action === "CREATE_STAGE" && body.name) {
    const pipeline = await prisma.pipeline.findFirst({
      where: { organizationId: orgId },
      include: { stages: true },
      orderBy: { isDefault: "desc" },
    });
    if (!pipeline) {
      return NextResponse.json({ error: "No pipeline found" }, { status: 404 });
    }
    const maxPos = pipeline.stages.reduce((m, s) => Math.max(m, s.position), 0);
    const stage = await prisma.pipelineStage.create({
      data: {
        pipelineId: pipeline.id,
        name: String(body.name).trim(),
        color: "#6366f1",
        probability: 50,
        position: maxPos + 1,
      },
    });
    return NextResponse.json({ stage }, { status: 201 });
  }

  const parsed = dealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid deal data" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const stage = await prisma.pipelineStage.findFirst({
    where: {
      id: d.stageId,
      pipeline: { organizationId: orgId },
    },
  });

  if (!stage) {
    return NextResponse.json({ error: "Invalid pipeline stage" }, { status: 400 });
  }

  const status = stage.isWonStage ? "WON" : stage.isLostStage ? "LOST" : "OPEN";

  const deal = await prisma.deal.create({
    data: {
      organizationId: orgId,
      pipelineId: stage.pipelineId,
      stageId: stage.id,
      ownerId: d.ownerId || auth.session.userId,
      leadId: d.leadId || null,
      contactId: d.contactId || null,
      companyId: d.companyId || null,
      title: d.title,
      amount: d.amount,
      probability: d.probability ?? stage.probability,
      expectedCloseDate: d.expectedCloseDate ? new Date(d.expectedCloseDate) : null,
      status,
      closedAt: status !== "OPEN" ? new Date() : null,
      description: d.description || null,
      history: {
        create: {
          toStage: stage.name,
          changedBy: auth.session.name,
          note: "Deal created",
        },
      },
    },
    include: {
      stage: true,
      company: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
    },
  });

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: "CREATE_DEAL",
    entity: "Deal",
    entityId: deal.id,
  });

  return NextResponse.json({ deal }, { status: 201 });
}
