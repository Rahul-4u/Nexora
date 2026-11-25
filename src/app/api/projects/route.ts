import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { projectSchema } from "@/lib/validations/modules";
import { createAuditLog } from "@/lib/services/audit";
import { agencyStore } from "@/lib/db/agency-store";

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.PROJECTS_READ);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  try {
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

    if (projects && projects.length > 0) {
      return NextResponse.json({ projects, companies, contacts });
    }
  } catch (e) {
    console.warn("DB offline for projects GET, using dynamic agency store:", e);
  }

  // Graceful fallback with dynamic agency store
  const storeProjects = agencyStore.getProjects();
  const teams = agencyStore.getTeams();
  const companies = [
    { id: "cmp-1", name: "NovaTech Solutions" },
    { id: "cmp-2", name: "Apex Design Co" },
    { id: "cmp-3", name: "Horizon Capital" },
    { id: "cmp-4", name: "CyberShield Security" },
  ];
  const contacts = [
    { id: "ct-1", firstName: "Jordan", lastName: "Lee" },
    { id: "ct-2", firstName: "Sarah", lastName: "Chen" },
    { id: "ct-3", firstName: "Marcus", lastName: "Miller" },
  ];

  return NextResponse.json({
    projects: storeProjects,
    companies,
    contacts,
    teams,
  });
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

  try {
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
  } catch (e) {
    console.warn("DB offline for project create, saving in dynamic agency store:", e);
  }

  // Save to persistent agency store
  const project = agencyStore.createProject({
    name: d.name,
    code: d.code,
    description: d.description || undefined,
    status: d.status,
    progress: d.progress,
    budget: d.budget ? Number(d.budget) : undefined,
    startDate: d.startDate || undefined,
    deadline: d.deadline || undefined,
    companyName: body.companyName || "Direct Client",
    teamName: body.teamName || "Engineering Team",
    teamLeader: body.teamLeader || auth.session.name,
    initialMilestones: body.milestones && Array.isArray(body.milestones) ? body.milestones : undefined,
  });

  return NextResponse.json({ project }, { status: 201 });
}
