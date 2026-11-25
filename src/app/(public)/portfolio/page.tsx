import type { Metadata } from "next";
import { getPublicSiteData } from "@/lib/services/public-cms";
import { PageTitleBanner } from "@/components/public/page-title-banner";
import { PortfolioGridClient } from "@/components/public/portfolio-grid-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Explore Nexora's selected client engagements across full-stack engineering, UX/UI systems, and digital growth.",
};

export default async function PortfolioPage() {
  const data = await getPublicSiteData();

  return (
    <>
      <PageTitleBanner
        title="Project Grid"
        breadcrumbs={[{ label: "Project" }, { label: "Project Grid" }]}
      />

      <section className="bg-[var(--webtec-surface)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
              SELECTED WORKS
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-[var(--webtec-heading)] sm:text-4xl lg:text-[48px]">
              Showcasing Your Projects
            </h2>
          </div>

          <PortfolioGridClient projects={data.portfolio} />
        </div>
      </section>
    </>
  );
}
