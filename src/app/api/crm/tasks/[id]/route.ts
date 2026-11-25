import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.DASHBOARD_VIEW);
  if (auth.error) return auth.error;
  const { id } = await context.params;

  const existing = await prisma.task.findFirst({
    where: { id, organizationId: auth.session.organizationId },
  });
  if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const body = await req.json();
  const commentText = body.comment || body.commentBody;
  if (commentText) {
    const comment = await prisma.taskComment.create({
      data: {
        taskId: id,
        userId: auth.session.userId,
        body: String(commentText),
      },
      include: { user: { select: { name: true } } },
    });
    return NextResponse.json({ comment });
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      status: body.status ?? existing.status,
      priority: body.priority ?? existing.priority,
      completedAt: body.status === "DONE" ? new Date() : null,
    },
  });

  return NextResponse.json({ task });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.DASHBOARD_VIEW);
  if (auth.error) return auth.error;
  const { id } = await context.params;

  const existing = await prisma.task.findFirst({
    where: { id, organizationId: auth.session.organizationId },
  });
  if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
