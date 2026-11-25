import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

function escapeCsv(val: string | number | null | undefined): string {
  const str = String(val ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.CRM_READ);
  if (auth.error) return auth.error;

  const leads = await prisma.lead.findMany({
    where: { organizationId: auth.session.organizationId, deletedAt: null },
    include: { source: true, owner: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    ["Name", "Email", "Phone", "Company", "Status", "Score", "Estimated Value", "Source", "Owner"].join(","),
    ...leads.map((l) =>
      [
        escapeCsv(l.name),
        escapeCsv(l.email),
        escapeCsv(l.phone),
        escapeCsv(l.companyName),
        escapeCsv(l.status),
        escapeCsv(l.score),
        escapeCsv(l.estimatedValue?.toString()),
        escapeCsv(l.source?.name),
        escapeCsv(l.owner?.name),
      ].join(",")
    ),
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="nexora-leads.csv"',
    },
  });
}
