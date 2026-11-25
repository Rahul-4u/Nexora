import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";

export async function GET() {
  const { session, error } = await requireApiAuth(PERMISSIONS.CRM_READ);
  if (error) return error;

  const leads = await prisma.lead.findMany({
    where: { organizationId: session.organizationId, deletedAt: null },
    include: { source: true, owner: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "Name",
    "Email",
    "Phone",
    "Company",
    "Service",
    "Status",
    "Score",
    "EstimatedValue",
    "Source",
    "Owner",
  ];

  const escapeCsv = (val: unknown) =>
    `"${String(val ?? "").replace(/"/g, '""')}"`;

  const rows = leads.map((l) =>
    [
      l.name,
      l.email,
      l.phone,
      l.companyName,
      l.serviceInterest,
      l.status,
      l.score,
      l.estimatedValue ? Number(l.estimatedValue) : "",
      l.source?.name ?? "",
      l.owner?.name ?? "",
    ]
      .map(escapeCsv)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="nexora-leads.csv"',
    },
  });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (error) return error;

  const { csvText } = (await req.json()) as { csvText?: string };
  if (!csvText || !csvText.trim()) {
    return NextResponse.json({ error: "CSV content is empty" }, { status: 400 });
  }

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return NextResponse.json(
      { error: "CSV must include header row and at least one data row" },
      { status: 400 }
    );
  }

  const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
  const nameIdx = headers.indexOf("name");
  const emailIdx = headers.indexOf("email");
  const companyIdx = headers.indexOf("company");
  const phoneIdx = headers.indexOf("phone");

  if (nameIdx === -1 || emailIdx === -1) {
    return NextResponse.json(
      { error: "CSV header must contain at least Name and Email columns" },
      { status: 400 }
    );
  }

  let imported = 0;
  for (const row of lines.slice(1)) {
    const cols = row.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
    const name = cols[nameIdx];
    const email = cols[emailIdx];
    if (!name || !email || !email.includes("@")) continue;

    await prisma.lead.create({
      data: {
        organizationId: session.organizationId,
        ownerId: session.userId,
        name,
        email,
        phone: phoneIdx >= 0 ? cols[phoneIdx] || null : null,
        companyName: companyIdx >= 0 ? cols[companyIdx] || null : null,
        status: "NEW",
        score: 60,
      },
    });
    imported += 1;
  }

  return NextResponse.json({ imported });
}
