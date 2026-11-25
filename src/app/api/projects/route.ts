import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { projectSchema } from "@/lib/validations/modules";
import { createAuditLog } from "@/lib/services/audit";

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.PROJECTS_READ);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const [projects, companies, contacts] = await Promise.all([
    prisma.project.findMany({
      where: { organizationId: orgId, deletedAt: null },
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        members: { include: { user: { select: { id: true, name: true } } } },
        milestones: { orderBy: { position: "asc" } },
        _count: { select: { tasks: true, invoices: true } },
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

  return NextResponse.json({ projects, companies, contacts });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.PROJECTS_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid project data" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const project = await prisma.project.create({
    data: {
      organizationId: orgId,
      name: d.name,
      code: d.code,
      description: d.description || null,
      status: d.status,
      progress: d.progress,
      budget: d.budget ?? null,
      startDate: d.startDate ? new Date(d.startDate) : null,
      deadline: d.deadline ? new Date(d.deadline) : null,
      companyId: d.companyId || null,
      contactId: d.contactId || null,
      members: {
        create: {
          userId: auth.session.userId,
          role: "Project Lead",
        },
      },
    },
  });

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: "CREATE_PROJECT",
    entity: "Project",
    entityId: project.id,
  });

  return NextResponse.json({ project }, { status: 201 });
}
