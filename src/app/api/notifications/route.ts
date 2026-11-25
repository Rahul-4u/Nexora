import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/guard";

export async function GET() {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const notifications = await prisma.notification.findMany({
    where: {
      organizationId: session.organizationId,
      userId: session.userId,
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const body = (await req.json().catch(() => ({}))) as { id?: string };

  if (body.id) {
    await prisma.notification.updateMany({
      where: {
        id: body.id,
        organizationId: session.organizationId,
        userId: session.userId,
      },
      data: { isRead: true, readAt: new Date() },
    });
  } else {
    await prisma.notification.updateMany({
      where: {
        organizationId: session.organizationId,
        userId: session.userId,
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });
  }

  return NextResponse.json({ success: true });
}
