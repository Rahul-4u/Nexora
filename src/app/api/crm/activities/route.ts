import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { activitySchema } from "@/lib/validations/modules";

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.CRM_READ);
  if (auth.error) return auth.error;

  const activities = await prisma.activity.findMany({
    where: { organizationId: auth.session.organizationId },
    include: {
      user: { select: { id: true, name: true } },
      lead: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
      company: { select: { id: true, name: true } },
      deal: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ activities });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();
  const parsed = activitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid activity" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const activity = await prisma.activity.create({
    data: {
      organizationId: orgId,
      userId: auth.session.userId,
      type: d.type,
      status: d.status,
      subject: d.subject,
      description: d.description || null,
      scheduledAt: d.scheduledAt ? new Date(d.scheduledAt) : null,
      completedAt: d.status === "COMPLETED" ? new Date() : null,
      leadId: d.leadId || null,
      contactId: d.contactId || null,
      companyId: d.companyId || null,
      dealId: d.dealId || null,
    },
  });

  return NextResponse.json({ activity }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (auth.error) return auth.error;

  const { id, status } = (await req.json()) as { id?: string; status?: "PENDING" | "COMPLETED" | "CANCELLED" };
  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }

  await prisma.activity.updateMany({
    where: { id, organizationId: auth.session.organizationId },
    data: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  return NextResponse.json({ success: true });
}
