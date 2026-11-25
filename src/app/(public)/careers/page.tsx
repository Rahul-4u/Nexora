import type { Metadata } from "next";
import { getPublicSiteData } from "@/lib/services/public-cms";
import { PageTitleBanner } from "@/components/public/page-title-banner";
import { CareersClient } from "@/components/public/careers-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Explore open engineering, design, and growth roles at Nexora and submit your application directly.",
};

export default async function CareersPage() {
  const data = await getPublicSiteData();

  return (
    <>
      <PageTitleBanner
        title="Careers"
        breadcrumbs={[{ label: "Pages" }, { label: "Careers" }]}
      />

      <section className="bg-[var(--webtec-surface)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1290px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
              JOIN OUR TEAM
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-[var(--webtec-heading)] sm:text-4xl lg:text-[46px]">
              Build Flagship Digital Experiences With Us
            </h2>
          </div>

          <CareersClient jobs={data.jobs} />
        </div>
      </section>
    </>
  );
}
