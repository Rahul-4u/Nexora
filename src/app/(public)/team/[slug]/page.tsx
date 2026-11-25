import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Award, Briefcase, Linkedin, Globe, Share2 } from "lucide-react";
import { getPublicSiteData } from "@/lib/services/public-cms";
import { PageTitleBanner } from "@/components/public/page-title-banner";
import { ContactForm } from "@/components/public/contact-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicSiteData();
  const member = data.team.find((m) => m.slug === slug);
  if (!member) return { title: "Team Member Not Found" };

  return {
    title: `${member.fullName} — ${member.designation}`,
    description: member.bio || `${member.fullName}, ${member.designation} at Nexora.`,
  };
}

export default async function TeamDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPublicSiteData();
  const member = data.team.find((m) => m.slug === slug);

  if (!member) notFound();

  const links = Object.entries(member.socialLinks || {});

  return (
    <>
      <PageTitleBanner
        title="Team Details"
        breadcrumbs={[
          { label: "Team", href: "/team" },
          { label: member.fullName },
        ]}
      />

      <section className="bg-[var(--webtec-surface)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1290px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-[28px] shadow-2xl">
                <img
                  src={
                    member.avatarUrl ||
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85"
                  }
                  alt={member.fullName}
                  className="h-[460px] w-full object-cover object-top"
                />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-7">
              <div>
                <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
                  {member.departmentName}
                </span>
                <h2 className="mt-2 font-heading text-4xl font-bold text-[var(--webtec-heading)]">
                  {member.fullName}
                </h2>
                <p className="mt-1 font-heading text-lg font-medium text-[var(--webtec-body)]">
                  {member.designation}
                </p>
              </div>

              <p className="text-base leading-[1.9] text-[var(--webtec-body)]">
                {member.bio ||
                  "Dedicated digital specialist partnering with ambitious brands to deliver high-impact product design, scalable architecture, and measurable revenue outcomes."}
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--webtec-accent)]/10 text-[var(--webtec-accent)]">
                    <Briefcase className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs text-[var(--webtec-body)]">Experience</p>
                    <p className="font-heading text-base font-bold text-[var(--webtec-heading)]">
                      {member.experienceYears}+ Years
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--webtec-accent)]/10 text-[var(--webtec-accent)]">
                    <Award className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs text-[var(--webtec-body)]">Department</p>
                    <p className="font-heading text-base font-bold text-[var(--webtec-heading)]">
                      {member.departmentName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills & Proficiency Bars */}
              {member.skills.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h3 className="font-heading text-xl font-bold text-[var(--webtec-heading)]">
                    Core Expertise
                  </h3>
                  <div className="space-y-3">
                    {member.skills.map((skill, idx) => {
                      const pct = Math.max(78, 95 - idx * 5);
                      return (
                        <div key={skill}>
                          <div className="mb-1.5 flex justify-between text-sm font-semibold text-[var(--webtec-heading)]">
                            <span>{skill}</span>
                            <span className="text-[var(--webtec-accent)]">{pct}%</span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#DFDFDF] dark:bg-white/10">
                            <div
                              className="h-full rounded-full bg-[var(--webtec-accent)]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-2">
                {(links.length > 0
                  ? links
                  : [["linkedin", "https://linkedin.com"]]
                ).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--webtec-border)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--webtec-heading)] transition hover:border-[var(--webtec-accent)] hover:bg-[var(--webtec-accent)] hover:text-white"
                  >
                    {platform === "linkedin" ? (
                      <Linkedin className="h-3.5 w-3.5" />
                    ) : platform === "website" ? (
                      <Globe className="h-3.5 w-3.5" />
                    ) : (
                      <Share2 className="h-3.5 w-3.5" />
                    )}
                    <span>{platform}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Webtec Team Contact Form */}
          <div className="mt-20 rounded-[32px] bg-[var(--webtec-surface-alt)] p-8 sm:p-12 lg:p-16">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
                CONTACT WITH US
              </span>
              <h3 className="mt-2 font-heading text-3xl font-bold text-[var(--webtec-heading)]">
                Feel Free To Write Our Technology Experts
              </h3>
            </div>
            <div className="mx-auto mt-10 max-w-3xl">
              <ContactForm
                defaultSubject={`Consultation with ${member.fullName}`}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
