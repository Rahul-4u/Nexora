import { NextRequest, NextResponse } from "next/server";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.CMS_READ);
  if (auth.error) return auth.error;

  const media = await prisma.media.findMany({
    where: { organizationId: auth.session.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ media });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CMS_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const formData = await req.formData();
  const file = formData.get("file");
  const altText = String(formData.get("altText") || "");
  const folder = String(formData.get("folder") || "general");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase() || ".bin";
  const safeFilename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "media");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeFilename), Buffer.from(await file.arrayBuffer()));

  const media = await prisma.media.create({
    data: {
      organizationId: orgId,
      uploadedById: auth.session.userId,
      filename: safeFilename,
      originalName: file.name,
      url: `/uploads/media/${safeFilename}`,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      altText: altText || file.name,
      folder,
    },
  });

  return NextResponse.json({ media }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CMS_WRITE);
  if (auth.error) return auth.error;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing media id" }, { status: 400 });

  const media = await prisma.media.findFirst({
    where: { id, organizationId: auth.session.organizationId },
  });
  if (!media) return NextResponse.json({ error: "Media not found" }, { status: 404 });

  try {
    const filePath = path.join(process.cwd(), "public", media.url.replace(/^\//, ""));
    await unlink(filePath);
  } catch {
    // Ignore missing physical file
  }

  await prisma.media.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
