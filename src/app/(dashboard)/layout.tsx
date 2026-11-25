import { requirePageSession } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePageSession();

  let unreadCount = 0;
  try {
    unreadCount = await prisma.notification.count({
      where: {
        organizationId: session.organizationId,
        userId: session.userId,
        isRead: false,
      },
    });
  } catch {
    unreadCount = 0;
  }

  return (
    <DashboardShell session={session} unreadCount={unreadCount}>
      {children}
    </DashboardShell>
  );
}
