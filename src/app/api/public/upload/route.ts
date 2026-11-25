import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/utilities/rate-limit";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const MAX_SIZE_BYTES = Number(process.env.MAX_UPLOAD_SIZE_MB || 10) * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const rate = checkRateLimit(`public-upload:${ip}`, 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Upload rate limit exceeded. Please try again shortly." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, DOC, DOCX, PNG, JPG, or WEBP files are permitted." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds the 10MB maximum upload size." },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name).toLowerCase() || ".pdf";
    const safeFilename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, safeFilename), buffer);

    return NextResponse.json(
      {
        url: `/uploads/resumes/${safeFilename}`,
        filename: safeFilename,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Public upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
