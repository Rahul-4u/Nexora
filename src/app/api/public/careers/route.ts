import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { jobApplicationSchema } from "@/lib/validations/modules";
import { checkRateLimit } from "@/lib/utilities/rate-limit";
import { recordAuditLog } from "@/lib/services/audit";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const rate = checkRateLimit(`public-careers:${ip}`, 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many applications submitted. Please wait and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = jobApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "Invalid application details",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const job = await prisma.jobListing.findFirst({
      where: {
        id: data.jobListingId,
        status: "PUBLISHED",
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Selected position is no longer accepting applications." },
        { status: 404 }
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        organizationId: job.organizationId,
        jobListingId: job.id,
        applicantName: data.applicantName,
        email: data.email,
        phone: data.phone || null,
        portfolioUrl: data.portfolioUrl || null,
        resumeUrl: data.resumeUrl || null,
        coverLetter: data.coverLetter || null,
        status: "APPLIED",
      },
    });

    const hrMembers = await prisma.membership.findMany({
      where: {
        organizationId: job.organizationId,
        status: "ACTIVE",
        role: { code: { in: ["HR_MANAGER", "ORG_ADMIN", "SUPER_ADMIN"] } },
      },
      take: 3,
    });

    if (hrMembers.length > 0) {
      await prisma.notification.createMany({
        data: hrMembers.map((m) => ({
          organizationId: job.organizationId,
          userId: m.userId,
          title: "New Job Application",
          message: `${data.applicantName} applied for ${job.title}`,
          type: "recruitment",
          link: "/recruitment",
        })),
      });
    }

    await recordAuditLog({
      organizationId: job.organizationId,
      action: "SUBMIT_JOB_APPLICATION",
      entity: "JobApplication",
      entityId: application.id,
      metadata: { jobListingId: job.id, email: data.email },
      ipAddress: ip,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully! Our talent team will be in touch.",
        applicationId: application.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Public job application error:", error);
    return NextResponse.json(
      { error: "Failed to submit application. Please try again." },
      { status: 500 }
    );
  }
}
