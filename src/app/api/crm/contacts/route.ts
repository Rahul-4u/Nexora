import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { contactSchema } from "@/lib/validations/modules";
import { createAuditLog } from "@/lib/services/audit";

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_READ);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const search = req.nextUrl.searchParams.get("search")?.trim() || "";
  const isClient = req.nextUrl.searchParams.get("isClient");

  const contacts = await prisma.contact.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      ...(isClient === "true" ? { isClient: true } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      company: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
      _count: { select: { deals: true, activities: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ contacts });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid contact data" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const contact = await prisma.contact.create({
    data: {
      organizationId: orgId,
      companyId: d.companyId || null,
      ownerId: d.ownerId || auth.session.userId,
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone || null,
      jobTitle: d.jobTitle || null,
      isClient: d.isClient,
      notes: d.notes || null,
    },
    include: { company: { select: { id: true, name: true } } },
  });

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: "CREATE_CONTACT",
    entity: "Contact",
    entityId: contact.id,
  });

  return NextResponse.json({ contact }, { status: 201 });
}
