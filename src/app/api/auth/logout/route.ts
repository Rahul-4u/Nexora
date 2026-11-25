import { NextResponse } from "next/server";
import { clearSessionCookie, getServerSession } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/services/audit";

export async function POST() {
  const session = await getServerSession();
  if (session) {
    await createAuditLog({
      organizationId: session.organizationId,
      userId: session.userId,
      action: "USER_LOGOUT",
      entity: "User",
      entityId: session.userId,
    });
  }
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
