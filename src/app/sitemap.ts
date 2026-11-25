import type { MetadataRoute } from "next";
import { getPublicSiteData } from "@/lib/services/public-cms";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const data = await getPublicSiteData();

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/portfolio",
    "/team",
    "/blog",
    "/contact",
    "/faq",
    "/careers",
    "/privacy-policy",
    "/terms-and-conditions",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  const serviceRoutes = data.services.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: new Date(),
  }));

  const portfolioRoutes = data.portfolio.map((p) => ({
    url: `${baseUrl}/portfolio/${p.slug}`,
    lastModified: new Date(),
  }));

  const teamRoutes = data.team.map((m) => ({
    url: `${baseUrl}/team/${m.slug}`,
    lastModified: new Date(),
  }));

  const blogRoutes = data.blogPosts.map((b) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: b.publishedAt ? new Date(b.publishedAt) : new Date(),
  }));

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...portfolioRoutes,
    ...teamRoutes,
    ...blogRoutes,
  ];
}
