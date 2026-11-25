import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/services/audit";
import { z } from "zod";

const convertSchema = z.object({
  createDeal: z.boolean().default(true),
  dealTitle: z.string().optional(),
  dealAmount: z.coerce.number().min(0).optional(),
  companyName: z.string().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const orgId = auth.session.organizationId;

  const lead = await prisma.lead.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
  });
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }
  if (lead.status === "CONVERTED") {
    return NextResponse.json(
      { error: "Lead is already converted" },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = convertSchema.safeParse(body);
  const opts = parsed.success ? parsed.data : { createDeal: true };

  const result = await prisma.$transaction(async (tx) => {
    let companyId: string | null = null;
    const compName = (opts.companyName || lead.companyName || "").trim();
    if (compName) {
      const existingCompany = await tx.company.findFirst({
        where: {
          organizationId: orgId,
          name: { equals: compName, mode: "insensitive" },
          deletedAt: null,
        },
      });
      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const createdCompany = await tx.company.create({
          data: {
            organizationId: orgId,
            name: compName,
          },
        });
        companyId = createdCompany.id;
      }
    }

    const parts = lead.name.trim().split(/\s+/);
    const firstName = parts[0] || lead.name;
    const lastName = parts.slice(1).join(" ") || "Client";

    const contact = await tx.contact.create({
      data: {
        organizationId: orgId,
        companyId,
        ownerId: lead.ownerId ?? auth.session.userId,
        firstName,
        lastName,
        email: lead.email,
        phone: lead.phone,
        isClient: true,
        notes: lead.notes,
      },
    });

    let deal = null;
    if (opts.createDeal) {
      const pipeline = await tx.pipeline.findFirst({
        where: { organizationId: orgId },
        include: { stages: { orderBy: { position: "asc" } } },
        orderBy: { isDefault: "desc" },
      });

      const firstStage = pipeline?.stages[0];
      if (pipeline && firstStage) {
        deal = await tx.deal.create({
          data: {
            organizationId: orgId,
            pipelineId: pipeline.id,
            stageId: firstStage.id,
            ownerId: lead.ownerId ?? auth.session.userId,
            leadId: lead.id,
            contactId: contact.id,
            companyId,
            title:
              opts.dealTitle?.trim() ||
              `${compName || lead.name} — ${lead.serviceInterest || "Agency Engagement"}`,
            amount: opts.dealAmount ?? Number(lead.estimatedValue || 10000),
            probability: firstStage.probability,
            status: "OPEN",
          },
        });
      }
    }

    const updatedLead = await tx.lead.update({
      where: { id: lead.id },
      data: {
        status: "CONVERTED",
        convertedAt: new Date(),
        convertedContactId: contact.id,
        convertedCompanyId: companyId,
      },
    });

    await tx.activity.create({
      data: {
        organizationId: orgId,
        userId: auth.session.userId,
        leadId: lead.id,
        contactId: contact.id,
        companyId,
        dealId: deal?.id ?? null,
        type: "NOTE",
        status: "COMPLETED",
        subject: "Lead converted to Contact & Deal",
        description: `Converted ${lead.name} into Contact${companyId ? " + Company" : ""}${deal ? ` + Deal (${deal.title})` : ""}.`,
        completedAt: new Date(),
      },
    });

    return { lead: updatedLead, contact, companyId, deal };
  });

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: "CONVERT_LEAD",
    entity: "Lead",
    entityId: lead.id,
    metadata: {
      contactId: result.contact.id,
      companyId: result.companyId,
      dealId: result.deal?.id ?? null,
    },
  });

  return NextResponse.json(result);
}
