import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/services/audit";
import { calculateReadingTime, slugify } from "@/lib/utils";
import type { PublishStatus } from "@prisma/client";

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.CMS_READ);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const [
    services,
    portfolio,
    blogPosts,
    blogCategories,
    testimonials,
    faqs,
    pages,
    media,
    contactSubmissions,
    siteSettings,
  ] = await Promise.all([
    prisma.service.findMany({
      where: { organizationId: orgId },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.portfolioProject.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.blogPost.findMany({
      where: { organizationId: orgId },
      include: { category: true, author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.blogCategory.findMany({
      where: { organizationId: orgId },
      orderBy: { name: "asc" },
    }),
    prisma.testimonial.findMany({
      where: { organizationId: orgId },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.faq.findMany({
      where: { organizationId: orgId },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.page.findMany({
      where: { organizationId: orgId },
      include: { sections: { orderBy: { position: "asc" } } },
      orderBy: { slug: "asc" },
    }),
    prisma.media.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactSubmission.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.siteSetting.findMany({
      where: { organizationId: orgId },
    }),
  ]);

  return NextResponse.json({
    services,
    portfolio,
    blogPosts,
    blogCategories,
    testimonials,
    faqs,
    pages,
    media,
    contactSubmissions,
    siteSettings,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CMS_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();
  const { entity, data } = body as { entity: string; data: Record<string, unknown> };

  if (data.status === "PUBLISHED") {
    const pubAuth = await requireApiAuth(PERMISSIONS.CMS_PUBLISH);
    if (pubAuth.error) return pubAuth.error;
  }

  let created: unknown = null;

  if (entity === "service") {
    const title = String(data.title || "");
    created = await prisma.service.create({
      data: {
        organizationId: orgId,
        title,
        slug: slugify(String(data.slug || title)) || `service-${Date.now()}`,
        category: String(data.category || "Digital"),
        shortDescription: String(data.shortDescription || ""),
        description: String(data.description || ""),
        featuredImage: data.featuredImage ? String(data.featuredImage) : null,
        benefits: Array.isArray(data.benefits) ? data.benefits.map(String) : [],
        status: (data.status as PublishStatus) || "DRAFT",
        seoTitle: data.seoTitle ? String(data.seoTitle) : null,
        seoDescription: data.seoDescription ? String(data.seoDescription) : null,
      },
    });
  } else if (entity === "portfolio") {
    const title = String(data.title || "");
    created = await prisma.portfolioProject.create({
      data: {
        organizationId: orgId,
        title,
        slug: slugify(String(data.slug || title)) || `project-${Date.now()}`,
        category: String(data.category || "Development"),
        clientName: data.clientName ? String(data.clientName) : null,
        industry: data.industry ? String(data.industry) : null,
        summary: String(data.summary || ""),
        challenge: data.challenge ? String(data.challenge) : null,
        solution: data.solution ? String(data.solution) : null,
        results: data.results ? String(data.results) : null,
        technologies: Array.isArray(data.technologies)
          ? data.technologies.map(String)
          : [],
        featuredImage: data.featuredImage ? String(data.featuredImage) : null,
        isFeatured: Boolean(data.isFeatured),
        status: (data.status as PublishStatus) || "DRAFT",
      },
    });
  } else if (entity === "blogPost") {
    const title = String(data.title || "");
    const content = String(data.content || "");
    const status = (data.status as PublishStatus) || "DRAFT";
    created = await prisma.blogPost.create({
      data: {
        organizationId: orgId,
        authorId: auth.session.userId,
        categoryId: data.categoryId ? String(data.categoryId) : null,
        title,
        slug: slugify(String(data.slug || title)) || `post-${Date.now()}`,
        excerpt: String(data.excerpt || ""),
        content,
        featuredImage: data.featuredImage ? String(data.featuredImage) : null,
        readingTime: calculateReadingTime(content),
        isFeatured: Boolean(data.isFeatured),
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        seoTitle: data.seoTitle ? String(data.seoTitle) : null,
        seoDescription: data.seoDescription ? String(data.seoDescription) : null,
      },
    });
  } else if (entity === "testimonial") {
    created = await prisma.testimonial.create({
      data: {
        organizationId: orgId,
        authorName: String(data.authorName || ""),
        authorRole: String(data.authorRole || ""),
        companyName: data.companyName ? String(data.companyName) : null,
        quote: String(data.quote || ""),
        rating: Number(data.rating || 5),
        status: (data.status as PublishStatus) || "PUBLISHED",
      },
    });
  } else if (entity === "faq") {
    created = await prisma.faq.create({
      data: {
        organizationId: orgId,
        category: String(data.category || "General"),
        question: String(data.question || ""),
        answer: String(data.answer || ""),
        status: (data.status as PublishStatus) || "PUBLISHED",
      },
    });
  } else if (entity === "siteSetting") {
    const key = String(data.key || "general");
    created = await prisma.siteSetting.upsert({
      where: { organizationId_key: { organizationId: orgId, key } },
      update: { value: (data.value ?? {}) as object },
      create: { organizationId: orgId, key, value: (data.value ?? {}) as object },
    });
  } else {
    return NextResponse.json({ error: "Unsupported CMS entity" }, { status: 400 });
  }

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: `CMS_CREATE_${entity.toUpperCase()}`,
    entity,
  });

  return NextResponse.json({ item: created }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CMS_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const { entity, id, data } = (await req.json()) as {
    entity: string;
    id: string;
    data: Record<string, unknown>;
  };

  if (data.status === "PUBLISHED") {
    const pubAuth = await requireApiAuth(PERMISSIONS.CMS_PUBLISH);
    if (pubAuth.error) return pubAuth.error;
  }

  if (entity === "service") {
    await prisma.service.updateMany({
      where: { id, organizationId: orgId },
      data: {
        ...(data.title !== undefined ? { title: String(data.title) } : {}),
        ...(data.status !== undefined ? { status: data.status as PublishStatus } : {}),
        ...(data.shortDescription !== undefined
          ? { shortDescription: String(data.shortDescription) }
          : {}),
      },
    });
  } else if (entity === "portfolio") {
    await prisma.portfolioProject.updateMany({
      where: { id, organizationId: orgId },
      data: {
        ...(data.status !== undefined ? { status: data.status as PublishStatus } : {}),
        ...(data.isFeatured !== undefined ? { isFeatured: Boolean(data.isFeatured) } : {}),
      },
    });
  } else if (entity === "blogPost") {
    await prisma.blogPost.updateMany({
      where: { id, organizationId: orgId },
      data: {
        ...(data.status !== undefined
          ? {
              status: data.status as PublishStatus,
              publishedAt: data.status === "PUBLISHED" ? new Date() : undefined,
            }
          : {}),
        ...(data.isFeatured !== undefined ? { isFeatured: Boolean(data.isFeatured) } : {}),
      },
    });
  } else if (entity === "testimonial") {
    await prisma.testimonial.updateMany({
      where: { id, organizationId: orgId },
      data: { status: data.status as PublishStatus },
    });
  } else if (entity === "faq") {
    await prisma.faq.updateMany({
      where: { id, organizationId: orgId },
      data: { status: data.status as PublishStatus },
    });
  } else if (entity === "contactSubmission") {
    await prisma.contactSubmission.updateMany({
      where: { id, organizationId: orgId },
      data: { isRead: Boolean(data.isRead) },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.CMS_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const sp = req.nextUrl.searchParams;
  const entity = sp.get("entity");
  const id = sp.get("id");
  if (!entity || !id) {
    return NextResponse.json({ error: "Missing entity or id" }, { status: 400 });
  }

  if (entity === "service") {
    await prisma.service.deleteMany({ where: { id, organizationId: orgId } });
  } else if (entity === "portfolio") {
    await prisma.portfolioProject.deleteMany({ where: { id, organizationId: orgId } });
  } else if (entity === "blogPost") {
    await prisma.blogPost.deleteMany({ where: { id, organizationId: orgId } });
  } else if (entity === "testimonial") {
    await prisma.testimonial.deleteMany({ where: { id, organizationId: orgId } });
  } else if (entity === "faq") {
    await prisma.faq.deleteMany({ where: { id, organizationId: orgId } });
  }

  return NextResponse.json({ success: true });
}
