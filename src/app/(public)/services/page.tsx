import type { Metadata } from "next";
import { getPublicSiteData } from "@/lib/services/public-cms";
import { PageTitleBanner } from "@/components/public/page-title-banner";
import { ServicesGridClient } from "@/components/public/services-grid-client";
import { WebtecButton } from "@/components/public/webtec-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore Nexora's full-stack digital agency services: Brand Identity, UX/UI Design, App Engineering, and Digital Marketing.",
};

export default async function ServicesPage() {
  const data = await getPublicSiteData();

  return (
    <>
      <PageTitleBanner
        title="Service Grid"
        breadcrumbs={[{ label: "Service" }, { label: "Service Grid" }]}
      />

      <section className="bg-[var(--webtec-surface)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1290px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
              WHAT WE DO
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-[var(--webtec-heading)] sm:text-4xl lg:text-[48px]">
              Empower Your Business With Innovative Digital Services
            </h2>
          </div>

          <ServicesGridClient services={data.services} />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[var(--webtec-surface-alt)] py-20">
        <div className="mx-auto max-w-[960px] px-4 sm:px-6">
          <div className="mb-10 text-center">
            <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
              COMMON QUESTIONS
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-[var(--webtec-heading)]">
              Service Delivery &amp; Engagement FAQs
            </h2>
          </div>

          <Accordion
            type="single"
            collapsible
            className="rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface)] px-6 py-2 shadow-sm"
          >
            {data.faqs.slice(0, 4).map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-[var(--webtec-heading)]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[var(--webtec-body)]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-14 rounded-[28px] bg-[var(--webtec-navy)] p-10 text-center text-white">
            <h3 className="font-heading text-2xl font-bold sm:text-3xl">
              Need A Tailored Agency Retainer Or Custom Build?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/75">
              Share your timeline and objectives—our senior team will prepare a
              scoped technical and creative proposal.
            </p>
            <div className="mt-7">
              <WebtecButton href="/contact">GET IN TOUCH</WebtecButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
