import type { Metadata } from "next";
import { Compass, Eye, HeartHandshake, Award, Users, Briefcase, Sparkles } from "lucide-react";
import { getPublicSiteData } from "@/lib/services/public-cms";
import { PageTitleBanner } from "@/components/public/page-title-banner";
import { AboutSection } from "@/components/public/home/about-section";
import { ServicesAndProcessSection } from "@/components/public/home/services-process-section";
import { TeamPreviewSection } from "@/components/public/home/team-preview-section";
import { WebtecButton } from "@/components/public/webtec-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Discover Nexora's mission, vision, values, engineering leadership, and digital transformation methodology.",
};

export default async function AboutPage() {
  const data = await getPublicSiteData();

  const pillars = [
    {
      title: "Our Mission",
      description:
        "Empower ambitious organizations with cohesive brand storytelling, high-converting digital products, and unified CRM revenue operations.",
      icon: Compass,
    },
    {
      title: "Our Vision",
      description:
        "Eliminate the disconnect between marketing websites and internal business systems through one intelligent, measurable platform.",
      icon: Eye,
    },
    {
      title: "Our Values",
      description:
        "Craftsmanship without compromise, transparent accountability to client ROI, and resilient engineering built for long-term scale.",
      icon: HeartHandshake,
    },
  ];

  const stats = [
    { label: "Enterprise Projects Shipped", value: "320+", icon: Briefcase },
    { label: "Client Satisfaction Rating", value: "98%", icon: Award },
    { label: "Active Global Clients", value: "1,000+", icon: Users },
    { label: "Average Conversion Lift", value: "+68%", icon: Sparkles },
  ];

  return (
    <>
      <PageTitleBanner
        title="About Us"
        breadcrumbs={[{ label: "Pages" }, { label: "About" }]}
      />

      <AboutSection />

      {/* Mission, Vision, Values & Company Story */}
      <section className="bg-[var(--webtec-surface-alt)] py-20 lg:py-24">
        <div className="mx-auto max-w-[1290px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
              OUR STORY &amp; PURPOSE
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-[var(--webtec-heading)] sm:text-4xl lg:text-[46px]">
              Built At The Intersection Of Agency Craft &amp; SaaS Engineering
            </h2>
            <p className="mt-4 text-base leading-[1.85] text-[var(--webtec-body)]">
              Founded by product designers and full-stack architects, Nexora bridges
              strategic brand execution with the operational backbone modern
              companies need to capture, nurture, and deliver client work.
            </p>
          </div>

          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-[24px] border border-[var(--webtec-border)] bg-[var(--webtec-surface)] p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--webtec-accent)]/10 text-[var(--webtec-accent)]">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 font-heading text-2xl font-bold text-[var(--webtec-heading)]">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.85] text-[var(--webtec-body)]">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Statistics Bar */}
          <div className="mt-14 grid gap-6 rounded-[28px] bg-[var(--webtec-navy)] p-8 text-white sm:grid-cols-2 lg:grid-cols-4 lg:p-10">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--webtec-accent)] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-heading text-3xl font-extrabold text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs font-medium text-white/75">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ServicesAndProcessSection services={data.services} />
      <TeamPreviewSection team={data.team} />

      {/* Bottom CTA */}
      <section className="bg-[var(--webtec-surface)] py-20">
        <div className="mx-auto max-w-[1290px] px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-[var(--webtec-heading)] sm:text-4xl">
            Ready To Accelerate Your Next Digital Initiative?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[var(--webtec-body)]">
            Speak directly with our product strategists to map your brand, web
            platform, or integrated CRM roadmap.
          </p>
          <div className="mt-8">
            <WebtecButton href="/contact">GET IN TOUCH</WebtecButton>
          </div>
        </div>
      </section>
    </>
  );
}
