import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export async function recordAuditLog(params: {
  organizationId: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        metadata: params.metadata,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

export const createAuditLog = recordAuditLog;

export async function createNotification(params: {
  organizationId: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type ?? "info",
        link: params.link ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}
