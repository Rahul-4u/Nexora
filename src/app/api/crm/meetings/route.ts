import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { meetingSchema } from "@/lib/validations/modules";

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.DASHBOARD_VIEW);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const [meetings, tasks, followUps] = await Promise.all([
    prisma.meeting.findMany({
      where: { organizationId: orgId },
      include: { organizer: { select: { name: true } } },
      orderBy: { startTime: "asc" },
    }),
    prisma.task.findMany({
      where: { organizationId: orgId, dueDate: { not: null } },
      select: { id: true, title: true, dueDate: true, status: true, priority: true },
    }),
    prisma.lead.findMany({
      where: { organizationId: orgId, deletedAt: null, followUpDate: { not: null } },
      select: { id: true, name: true, followUpDate: true, status: true },
    }),
  ]);

  return NextResponse.json({ meetings, tasks, followUps });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.DASHBOARD_VIEW);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();
  const parsed = meetingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid meeting details" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const meeting = await prisma.meeting.create({
    data: {
      organizationId: orgId,
      organizerId: auth.session.userId,
      title: d.title,
      description: d.description || null,
      startTime: new Date(d.startTime),
      endTime: new Date(d.endTime),
      location: d.location || null,
      meetingUrl: d.meetingUrl || null,
      participants: d.participants,
      leadId: d.leadId || null,
      dealId: d.dealId || null,
    },
  });

  return NextResponse.json({ meeting }, { status: 201 });
}
