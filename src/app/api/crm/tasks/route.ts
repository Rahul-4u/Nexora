import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { taskSchema } from "@/lib/validations/modules";

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.DASHBOARD_VIEW);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const [tasks, users] = await Promise.all([
    prisma.task.findMany({
      where: { organizationId: orgId },
      include: {
        assignee: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true } },
        deal: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
        comments: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    prisma.membership.findMany({
      where: { organizationId: orgId, status: "ACTIVE" },
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  return NextResponse.json({
    tasks,
    users: users.map((u) => u.user),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.DASHBOARD_VIEW);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid task data" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const task = await prisma.task.create({
    data: {
      organizationId: orgId,
      creatorId: auth.session.userId,
      assigneeId: d.assigneeId || auth.session.userId,
      title: d.title,
      description: d.description || null,
      priority: d.priority,
      status: d.status,
      dueDate: d.dueDate ? new Date(d.dueDate) : null,
      leadId: d.leadId || null,
      dealId: d.dealId || null,
      projectId: d.projectId || null,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
