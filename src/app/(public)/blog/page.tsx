import type { Metadata } from "next";
import { getPublicSiteData } from "@/lib/services/public-cms";
import { PageTitleBanner } from "@/components/public/page-title-banner";
import { BlogGridClient } from "@/components/public/blog-grid-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog & Insights",
  description:
    "Read Nexora's latest insights on digital branding, SaaS engineering, UX/UI systems, and CRM growth.",
};

export default async function BlogPage() {
  const data = await getPublicSiteData();

  return (
    <>
      <PageTitleBanner
        title="News Grid"
        breadcrumbs={[{ label: "News" }, { label: "News Grid" }]}
      />

      <section className="bg-[var(--webtec-surface)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1290px] px-4 sm:px-6 lg:px-8">
          <BlogGridClient
            posts={data.blogPosts.map((p) => ({
              ...p,
              publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
            }))}
          />
        </div>
      </section>
    </>
  );
}
