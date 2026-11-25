import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { contactFormSchema } from "@/lib/validations/schemas";
import { checkRateLimit } from "@/lib/utilities/rate-limit";
import { recordAuditLog } from "@/lib/services/audit";
import { sendEmail } from "@/lib/services/email";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const rate = checkRateLimit(`public-contact:${ip}`, 12, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "Invalid contact form input",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const org = await prisma.organization.findFirst({
      where: { isDefault: true, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });

    if (!org) {
      return NextResponse.json({
        success: true,
        message: "Thank you! Your message has been received.",
        persisted: false,
      });
    }

    const sourceName =
      data.subject === "Newsletter Subscription"
        ? "Newsletter"
        : "Website Contact Form";

    const leadSource = await prisma.leadSource.upsert({
      where: {
        organizationId_name: {
          organizationId: org.id,
          name: sourceName,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        name: sourceName,
        color: "#ff3838",
      },
    });

    const defaultOwner = await prisma.membership.findFirst({
      where: {
        organizationId: org.id,
        status: "ACTIVE",
        role: { code: { in: ["SALES_MANAGER", "ORG_ADMIN", "SUPER_ADMIN"] } },
      },
      orderBy: { createdAt: "asc" },
    });

    const result = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          organizationId: org.id,
          sourceId: leadSource.id,
          ownerId: defaultOwner?.userId ?? null,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          serviceInterest: data.service || null,
          status: "NEW",
          score: data.service ? 78 : 65,
          notes: `Subject: ${data.subject}\n\n${data.message}`,
        },
      });

      const submission = await tx.contactSubmission.create({
        data: {
          organizationId: org.id,
          leadId: lead.id,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject,
          service: data.service || null,
          message: data.message,
        },
      });

      await tx.activity.create({
        data: {
          organizationId: org.id,
          userId: defaultOwner?.userId ?? null,
          leadId: lead.id,
          type: "EMAIL",
          status: "COMPLETED",
          subject: `Inbound inquiry: ${data.subject}`,
          description: data.message,
          completedAt: new Date(),
        },
      });

      if (defaultOwner?.userId) {
        await tx.notification.create({
          data: {
            organizationId: org.id,
            userId: defaultOwner.userId,
            title: "New Website Lead",
            message: `${data.name} (${data.email}) submitted an inquiry: ${data.subject}`,
            type: "lead",
            link: `/leads/${lead.id}`,
          },
        });
      }

      return { lead, submission };
    });

    await recordAuditLog({
      organizationId: org.id,
      action: "CREATE_PUBLIC_CONTACT_LEAD",
      entity: "Lead",
      entityId: result.lead.id,
      metadata: {
        email: data.email,
        subject: data.subject,
        service: data.service,
      },
      ipAddress: ip,
    });

    await sendEmail({
      to: data.email,
      subject: `We received your inquiry — ${org.name}`,
      html: `<p>Hi ${data.name},</p><p>Thank you for reaching out to ${org.name}. Our team has received your message regarding <strong>${data.subject}</strong> and will respond shortly.</p>`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your message has been sent and logged with our team.",
        leadId: result.lead.id,
        submissionId: result.submission.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Public contact submission error:", error);
    return NextResponse.json(
      { error: "Unable to process your inquiry right now. Please try again." },
      { status: 500 }
    );
  }
}
