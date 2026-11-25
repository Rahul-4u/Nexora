import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/services/audit";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const orgId = auth.session.organizationId;

  const existing = await prisma.deal.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    include: { stage: true },
  });
  if (!existing) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

  const body = await req.json();

  let nextStage = existing.stage;
  if (body.stageId && body.stageId !== existing.stageId) {
    const foundStage = await prisma.pipelineStage.findFirst({
      where: { id: body.stageId, pipeline: { organizationId: orgId } },
    });
    if (!foundStage) {
      return NextResponse.json({ error: "Invalid target stage" }, { status: 400 });
    }
    nextStage = foundStage;
  }

  const nextStatus = nextStage.isWonStage
    ? "WON"
    : nextStage.isLostStage
      ? "LOST"
      : "OPEN";

  const deal = await prisma.deal.update({
    where: { id },
    data: {
      title: body.title ?? existing.title,
      amount: body.amount !== undefined ? Number(body.amount) : existing.amount,
      stageId: nextStage.id,
      probability:
        body.probability !== undefined
          ? Number(body.probability)
          : nextStage.id !== existing.stageId
            ? nextStage.probability
            : existing.probability,
      status: nextStatus,
      closedAt: nextStatus !== "OPEN" ? new Date() : null,
      description: body.description !== undefined ? body.description : existing.description,
    },
    include: {
      stage: true,
      company: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
    },
  });

  if (nextStage.id !== existing.stageId) {
    await prisma.dealHistory.create({
      data: {
        dealId: id,
        fromStage: existing.stage.name,
        toStage: nextStage.name,
        changedBy: auth.session.name,
        note: `Moved from ${existing.stage.name} to ${nextStage.name}`,
      },
    });
  }

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: "UPDATE_DEAL",
    entity: "Deal",
    entityId: id,
    metadata: { stage: nextStage.name, status: nextStatus },
  });

  return NextResponse.json({ deal });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_DELETE);
  if (auth.error) return auth.error;
  const { id } = await context.params;

  const existing = await prisma.deal.findFirst({
    where: { id, organizationId: auth.session.organizationId, deletedAt: null },
  });
  if (!existing) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

  await prisma.deal.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
