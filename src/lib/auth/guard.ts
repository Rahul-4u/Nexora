import { NextResponse } from "next/server";
import { getServerSession, type SessionPayload } from "@/lib/auth/session";
import { hasPermission, type PermissionKey } from "@/lib/permissions/rbac";

export async function requireApiAuth(
  permission?: PermissionKey
): Promise<
  | { session: SessionPayload; error?: never }
  | { session?: never; error: NextResponse }
> {
  const session = await getServerSession();
  if (!session) {
    return {
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  if (permission && !hasPermission(session, permission)) {
    return {
      error: NextResponse.json(
        { error: "Insufficient permissions for this action" },
        { status: 403 }
      ),
    };
  }

  return { session };
}

export async function requirePageSession(): Promise<SessionPayload> {
  const session = await getServerSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return session!;
}
