import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { agencyStore } from "@/lib/db/agency-store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.PROJECTS_WRITE);
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const orgId = auth.session.organizationId;
  const body = await req.json();

  try {
    const existing = await prisma.project.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
    });

    if (existing) {
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
  } catch (e) {
    console.warn("DB offline for project PATCH, updating in agency store:", e);
  }

  // Fallback to agency store
  if (body.addMilestone) {
    const milestone = agencyStore.addMilestone(
      id,
      String(body.addMilestone.title),
      body.addMilestone.dueDate
    );
    return NextResponse.json({ milestone });
  }

  if (body.toggleMilestoneId) {
    const ok = agencyStore.toggleMilestone(id, String(body.toggleMilestoneId));
    return NextResponse.json({ success: ok });
  }

  const updated = agencyStore.updateProject(id, {
    status: body.status,
    progress: body.progress !== undefined ? Number(body.progress) : undefined,
  });

  if (!updated) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project: updated });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.PROJECTS_WRITE);
  if (auth.error) return auth.error;
  const { id } = await context.params;

  try {
    const existing = await prisma.project.findFirst({
      where: { id, organizationId: auth.session.organizationId, deletedAt: null },
    });
    if (existing) {
      await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
      return NextResponse.json({ success: true });
    }
  } catch (e) {
    console.warn("DB offline for project DELETE, deleting from agency store:", e);
  }

  const deleted = agencyStore.deleteProject(id);
  if (!deleted) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
