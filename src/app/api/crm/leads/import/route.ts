import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/services/audit";

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const { csvText } = (await req.json()) as { csvText?: string };
  if (!csvText || !csvText.trim()) {
    return NextResponse.json({ error: "CSV content is required" }, { status: 400 });
  }

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return NextResponse.json(
      { error: "CSV must include a header row and at least one data row" },
      { status: 400 }
    );
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const nameIdx = headers.findIndex((h) => h.includes("name") && !h.includes("company"));
  const emailIdx = headers.findIndex((h) => h.includes("email"));
  const phoneIdx = headers.findIndex((h) => h.includes("phone"));
  const companyIdx = headers.findIndex((h) => h.includes("company"));
  const valueIdx = headers.findIndex((h) => h.includes("value") || h.includes("amount"));

  if (nameIdx === -1 || emailIdx === -1) {
    return NextResponse.json(
      { error: "CSV must include 'name' and 'email' columns" },
      { status: 400 }
    );
  }

  let imported = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const name = cols[nameIdx];
    const email = cols[emailIdx];
    if (!name || !email || !email.includes("@")) continue;

    await prisma.lead.create({
      data: {
        organizationId: orgId,
        ownerId: auth.session.userId,
        name,
        email,
        phone: phoneIdx >= 0 ? cols[phoneIdx] || null : null,
        companyName: companyIdx >= 0 ? cols[companyIdx] || null : null,
        estimatedValue:
          valueIdx >= 0 && !Number.isNaN(Number(cols[valueIdx]))
            ? Number(cols[valueIdx])
            : null,
        status: "NEW",
      },
    });
    imported++;
  }

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: "IMPORT_LEADS_CSV",
    entity: "Lead",
    metadata: { imported },
  });

  return NextResponse.json({ imported });
}
