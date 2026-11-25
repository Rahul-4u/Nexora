import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { jobListingSchema } from "@/lib/validations/modules";
import { createAuditLog } from "@/lib/services/audit";
import { slugify } from "@/lib/utils";
import type { ApplicationStatus, PublishStatus } from "@prisma/client";

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.RECRUITMENT_READ);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const [jobs, applications] = await Promise.all([
    prisma.jobListing.findMany({
      where: { organizationId: orgId },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.jobApplication.findMany({
      where: { organizationId: orgId },
      include: { jobListing: { select: { id: true, title: true, department: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ jobs, applications });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.RECRUITMENT_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();
  const parsed = jobListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid job listing" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const job = await prisma.jobListing.create({
    data: {
      organizationId: orgId,
      title: d.title,
      slug: `${slugify(d.title)}-${Date.now().toString().slice(-4)}`,
      department: d.department,
      location: d.location,
      employmentType: d.employmentType,
      salaryRange: d.salaryRange || null,
      description: d.description,
      requirements: d.requirements,
      benefits: d.benefits,
      status: d.status,
      publishedAt: d.status === "PUBLISHED" ? new Date() : null,
    },
  });

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: "CREATE_JOB_LISTING",
    entity: "JobListing",
    entityId: job.id,
  });

  return NextResponse.json({ job }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.RECRUITMENT_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();

  if (body.jobId) {
    await prisma.jobListing.updateMany({
      where: { id: String(body.jobId), organizationId: orgId },
      data: {
        status: body.status as PublishStatus,
        publishedAt: body.status === "PUBLISHED" ? new Date() : undefined,
      },
    });
    return NextResponse.json({ success: true });
  }

  if (body.applicationId) {
    await prisma.jobApplication.updateMany({
      where: { id: String(body.applicationId), organizationId: orgId },
      data: {
        ...(body.status !== undefined ? { status: body.status as ApplicationStatus } : {}),
        ...(body.interviewDate !== undefined
          ? { interviewDate: body.interviewDate ? new Date(body.interviewDate) : null }
          : {}),
        ...(body.notes !== undefined ? { notes: String(body.notes) } : {}),
      },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid recruitment update" }, { status: 400 });
}
