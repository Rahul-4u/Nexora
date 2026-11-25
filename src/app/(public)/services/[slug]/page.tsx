import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, PhoneCall, FileText } from "lucide-react";
import { getPublicSiteData } from "@/lib/services/public-cms";
import { PageTitleBanner } from "@/components/public/page-title-banner";
import { WebtecButton } from "@/components/public/webtec-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicSiteData();
  const service = data.services.find((s) => s.slug === slug);
  if (!service) return { title: "Service Not Found" };

  return {
    title: service.seoTitle || service.title,
    description: service.seoDescription || service.shortDescription,
    openGraph: {
      title: service.seoTitle || service.title,
      description: service.seoDescription || service.shortDescription,
      images: service.featuredImage ? [service.featuredImage] : [],
    },
  };
}

export default async function ServiceDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPublicSiteData();
  const service = data.services.find((s) => s.slug === slug);

  if (!service) notFound();

  const processSteps = Array.isArray(service.processSteps)
    ? (service.processSteps as Array<{ step: string; title: string; detail: string }>)
    : [
        { step: "01", title: "Discovery & Audit", detail: "Deep dive into business goals and user insights." },
        { step: "02", title: "Execution & Build", detail: "Iterative design and engineering milestones." },
        { step: "03", title: "Launch & Scale", detail: "QA validation, deployment, and ongoing optimization." },
      ];

  const serviceFaqs = Array.isArray(service.faqs)
    ? (service.faqs as Array<{ q: string; a: string }>)
    : data.faqs.slice(0, 3).map((f) => ({ q: f.question, a: f.answer }));

  const relatedServices = data.services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <PageTitleBanner
        title={service.title}
        breadcrumbs={[
          { label: "Service", href: "/services" },
          { label: "Service Details" },
        ]}
      />

      <section className="bg-[var(--webtec-surface)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1290px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Left Sidebar (Webtec service-details sidebar) */}
            <aside className="space-y-8 lg:col-span-4">
              {/* All Services List */}
              <div className="rounded-[24px] border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-6">
                <h3 className="mb-4 font-heading text-lg font-bold text-[var(--webtec-heading)]">
                  Our Services
                </h3>
                <div className="space-y-2">
                  {data.services.map((item) => {
                    const active = item.slug === service.slug;
                    return (
                      <Link
                        key={item.id}
                        href={`/services/${item.slug}`}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-4 py-3.5 font-heading text-sm font-semibold transition",
                          active
                            ? "bg-[var(--webtec-accent)] text-white shadow-md"
                            : "bg-[var(--webtec-surface)] text-[var(--webtec-heading)] hover:bg-[var(--webtec-accent)]/10 hover:text-[var(--webtec-accent)]"
                        )}
                      >
                        <span>{item.title}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Contact For Any Advice Dark Card */}
              <div className="relative overflow-hidden rounded-[24px] bg-[var(--webtec-navy)] p-8 text-center text-white">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--webtec-accent)] text-white shadow-lg">
                  <PhoneCall className="h-7 w-7" />
                </span>
                <h3 className="mt-5 font-heading text-2xl font-bold">
                  Contact With Us For Any Advice
                </h3>
                <p className="mt-3 text-sm text-white/75">
                  Speak with a senior {service.title} specialist today.
                </p>
                <a
                  href={`tel:${data.phone.replace(/[^+\d]/g, "")}`}
                  className="mt-4 block font-heading text-xl font-extrabold text-[var(--webtec-accent)]"
                >
                  {data.phone}
                </a>
                <div className="mt-6">
                  <WebtecButton href="/contact">REQUEST CONSULTATION</WebtecButton>
                </div>
              </div>

              {/* Brochure Card */}
              <div className="rounded-[24px] border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--webtec-accent)] text-white">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-heading text-base font-bold text-[var(--webtec-heading)]">
                      Agency Capability Deck
                    </p>
                    <p className="text-xs text-[var(--webtec-body)]">
                      Scope, timelines &amp; delivery benchmarks
                    </p>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--webtec-border)] bg-[var(--webtec-surface)] py-3 font-heading text-xs font-bold uppercase tracking-wider text-[var(--webtec-heading)] transition hover:border-[var(--webtec-accent)] hover:text-[var(--webtec-accent)]"
                >
                  Request Scope Guide
                </Link>
              </div>
            </aside>

            {/* Main Content */}
            <div className="space-y-10 lg:col-span-8">
              <div className="overflow-hidden rounded-[28px] shadow-xl">
                <img
                  src={
                    service.featuredImage ||
                    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=85"
                  }
                  alt={service.title}
                  className="h-[340px] w-full object-cover sm:h-[440px]"
                />
              </div>

              <div>
                <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
                  {service.category}
                </span>
                <h2 className="mt-2 font-heading text-3xl font-bold text-[var(--webtec-heading)] sm:text-4xl">
                  Service Overview
                </h2>
                <p className="mt-4 text-base leading-[1.9] text-[var(--webtec-body)]">
                  {service.description}
                </p>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="font-heading text-2xl font-bold text-[var(--webtec-heading)]">
                  Key Capabilities &amp; Outcomes
                </h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {service.benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-start gap-3 rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-5"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--webtec-accent)]" />
                      <span className="font-heading text-sm font-semibold text-[var(--webtec-heading)]">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Process */}
              <div>
                <h3 className="font-heading text-2xl font-bold text-[var(--webtec-heading)]">
                  Our Execution Process
                </h3>
                <div className="mt-5 grid gap-5 sm:grid-cols-3">
                  {processSteps.map((st) => (
                    <div
                      key={st.step}
                      className="rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface)] p-6 shadow-sm"
                    >
                      <span className="font-accent text-2xl font-bold text-[var(--webtec-accent)]">
                        {st.step}
                      </span>
                      <h4 className="mt-3 font-heading text-lg font-bold text-[var(--webtec-heading)]">
                        {st.title}
                      </h4>
                      <p className="mt-2 text-sm text-[var(--webtec-body)]">
                        {st.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service FAQs */}
              <div>
                <h3 className="mb-4 font-heading text-2xl font-bold text-[var(--webtec-heading)]">
                  Frequently Asked Questions
                </h3>
                <Accordion
                  type="single"
                  collapsible
                  className="rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface)] px-6"
                >
                  {serviceFaqs.map((item, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`}>
                      <AccordionTrigger className="text-[var(--webtec-heading)]">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-[var(--webtec-body)]">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Related Services */}
              {relatedServices.length > 0 && (
                <div className="border-t border-[var(--webtec-border)] pt-10">
                  <h3 className="font-heading text-2xl font-bold text-[var(--webtec-heading)]">
                    Related Services
                  </h3>
                  <div className="mt-5 grid gap-5 sm:grid-cols-3">
                    {relatedServices.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/services/${rel.slug}`}
                        className="group rounded-2xl border border-[var(--webtec-border)] p-5 transition hover:border-[var(--webtec-accent)]"
                      >
                        <span className="text-xs font-semibold uppercase text-[var(--webtec-accent)]">
                          {rel.category}
                        </span>
                        <h4 className="mt-2 font-heading text-lg font-bold text-[var(--webtec-heading)] group-hover:text-[var(--webtec-accent)]">
                          {rel.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
