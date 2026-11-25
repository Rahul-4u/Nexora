import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/utilities/rate-limit";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const rate = checkRateLimit(`public-newsletter:${ip}`, 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const org = await prisma.organization.findFirst({
      where: { isDefault: true, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });

    if (org) {
      const source = await prisma.leadSource.upsert({
        where: {
          organizationId_name: {
            organizationId: org.id,
            name: "Newsletter",
          },
        },
        update: {},
        create: {
          organizationId: org.id,
          name: "Newsletter",
          color: "#6366f1",
        },
      });

      const existingLead = await prisma.lead.findFirst({
        where: { organizationId: org.id, email: parsed.data.email, deletedAt: null },
      });

      if (!existingLead) {
        await prisma.lead.create({
          data: {
            organizationId: org.id,
            sourceId: source.id,
            name: parsed.data.email.split("@")[0] || "Newsletter Subscriber",
            email: parsed.data.email,
            status: "NEW",
            score: 45,
            notes: "Subscribed via website footer newsletter form.",
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Unable to process subscription right now." },
      { status: 500 }
    );
  }
}
