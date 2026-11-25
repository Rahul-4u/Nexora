import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { companySchema } from "@/lib/validations/modules";
import { createAuditLog } from "@/lib/services/audit";

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_READ);
  if (auth.error) return auth.error;
  const search = req.nextUrl.searchParams.get("search")?.trim() || "";

  const companies = await prisma.company.findMany({
    where: {
      organizationId: auth.session.organizationId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { industry: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { contacts: true, deals: true, projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ companies });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();
  const parsed = companySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid company data" },
      { status: 400 }
    );
  }

  const company = await prisma.company.create({
    data: {
      organizationId: orgId,
      ...parsed.data,
      email: parsed.data.email || null,
    },
  });

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: "CREATE_COMPANY",
    entity: "Company",
    entityId: company.id,
  });

  return NextResponse.json({ company }, { status: 201 });
}
