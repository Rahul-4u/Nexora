import { NextRequest, NextResponse } from "next/server";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function GET(req: NextRequest) {
  const { session, error } = await requireApiAuth(PERMISSIONS.CMS_READ);
  if (error) return error;

  const search = req.nextUrl.searchParams.get("search")?.trim() || "";
  const media = await prisma.media.findMany({
    where: {
      organizationId: session.organizationId,
      ...(search
        ? {
            OR: [
              { originalName: { contains: search, mode: "insensitive" } },
              { altText: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ media });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireApiAuth(PERMISSIONS.CMS_WRITE);
  if (error) return error;

  const formData = await req.formData();
  const file = formData.get("file");
  const altText = String(formData.get("altText") || "");
  const folder = String(formData.get("folder") || "general").replace(/[^a-z0-9_-]/gi, "");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Max upload size is 10MB" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase() || ".bin";
  const safeName = `${Date.now()}-${crypto.randomBytes(5).toString("hex")}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder || "general");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeName), Buffer.from(await file.arrayBuffer()));

  const record = await prisma.media.create({
    data: {
      organizationId: session.organizationId,
      uploadedById: session.userId,
      filename: safeName,
      originalName: file.name,
      url: `/uploads/${folder || "general"}/${safeName}`,
      mimeType: file.type,
      sizeBytes: file.size,
      altText: altText || null,
      folder: folder || "general",
    },
  });

  return NextResponse.json({ media: record }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { session, error } = await requireApiAuth(PERMISSIONS.CMS_WRITE);
  if (error) return error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const media = await prisma.media.findFirst({
    where: { id, organizationId: session.organizationId },
  });
  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const filePath = path.join(process.cwd(), "public", media.url.replace(/^\//, ""));
    await unlink(filePath);
  } catch {
    // Ignore missing physical file
  }

  await prisma.media.delete({ where: { id: media.id } });
  return NextResponse.json({ success: true });
}
