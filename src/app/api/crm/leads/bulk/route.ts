import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { recordAuditLog } from "@/lib/services/audit";

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["STATUS", "ASSIGN", "DELETE"]),
  status: z
    .enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "CONVERTED", "LOST"])
    .optional(),
  ownerId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireApiAuth(PERMISSIONS.CRM_WRITE);
  if (error) return error;

  const body = await req.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bulk payload" }, { status: 400 });
  }

  const { ids, action, status, ownerId } = parsed.data;

  if (action === "DELETE") {
    const delAuth = await requireApiAuth(PERMISSIONS.CRM_DELETE);
    if (delAuth.error) return delAuth.error;
    await prisma.lead.updateMany({
      where: {
        id: { in: ids },
        organizationId: session.organizationId,
      },
      data: { deletedAt: new Date() },
    });
  } else if (action === "STATUS" && status) {
    await prisma.lead.updateMany({
      where: {
        id: { in: ids },
        organizationId: session.organizationId,
      },
      data: { status },
    });
  } else if (action === "ASSIGN" && ownerId) {
    await prisma.lead.updateMany({
      where: {
        id: { in: ids },
        organizationId: session.organizationId,
      },
      data: { ownerId },
    });
  }

  await recordAuditLog({
    organizationId: session.organizationId,
    userId: session.userId,
    action: `BULK_LEAD_${action}`,
    entity: "Lead",
    metadata: { count: ids.length },
  });

  return NextResponse.json({ success: true, count: ids.length });
}
