import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.PROJECTS_WRITE);
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const orgId = auth.session.organizationId;

  const existing = await prisma.project.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  });
  if (!existing) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const body = await req.json();

  if (body.addMilestone) {
    const milestone = await prisma.milestone.create({
      data: {
        projectId: id,
        title: String(body.addMilestone.title),
        dueDate: body.addMilestone.dueDate ? new Date(body.addMilestone.dueDate) : null,
      },
    });
    return NextResponse.json({ milestone });
  }

  if (body.toggleMilestoneId) {
    const ms = await prisma.milestone.findFirst({
      where: { id: body.toggleMilestoneId, projectId: id },
    });
    if (ms) {
      await prisma.milestone.update({
        where: { id: ms.id },
        data: { isCompleted: !ms.isCompleted },
      });
    }
    return NextResponse.json({ success: true });
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      status: body.status ?? existing.status,
      progress:
        body.progress !== undefined ? Number(body.progress) : existing.progress,
    },
  });

  return NextResponse.json({ project });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.PROJECTS_WRITE);
  if (auth.error) return auth.error;
  const { id } = await context.params;

  const existing = await prisma.project.findFirst({
    where: { id, organizationId: auth.session.organizationId, deletedAt: null },
  });
  if (!existing) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
