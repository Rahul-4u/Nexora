import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const unreadNotifications = await prisma.notification.count({
    where: {
      organizationId: session.organizationId,
      userId: session.userId,
      isRead: false,
    },
  });

  return NextResponse.json({
    user: session,
    unreadNotifications,
  });
}
