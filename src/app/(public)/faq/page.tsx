import type { Metadata } from "next";
import { getPublicSiteData } from "@/lib/services/public-cms";
import { PageTitleBanner } from "@/components/public/page-title-banner";
import { FaqClient } from "@/components/public/faq-client";
import { WebtecButton } from "@/components/public/webtec-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about Nexora's agency services, timelines, pricing, and multi-tenant CRM security.",
};

export default async function FaqPage() {
  const data = await getPublicSiteData();

  return (
    <>
      <PageTitleBanner
        title="FAQ"
        breadcrumbs={[{ label: "Pages" }, { label: "Faq" }]}
      />

      <section className="bg-[var(--webtec-surface)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1290px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
              KNOWLEDGE BASE
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-[var(--webtec-heading)] sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <FaqClient faqs={data.faqs} />

          <div className="mt-16 rounded-[28px] bg-[var(--webtec-navy)] p-10 text-center text-white">
            <h3 className="font-heading text-2xl font-bold sm:text-3xl">
              Still Have Questions?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/75">
              Our client solutions team is happy to answer technical, pricing, or
              architecture questions directly.
            </p>
            <div className="mt-6">
              <WebtecButton href="/contact">GET IN TOUCH</WebtecButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
