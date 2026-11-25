import type { Metadata } from "next";
import Link from "next/link";
import { Linkedin, Globe, Share2 } from "lucide-react";
import { getPublicSiteData } from "@/lib/services/public-cms";
import { PageTitleBanner } from "@/components/public/page-title-banner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the strategists, designers, and full-stack engineers behind Nexora.",
};

export default async function TeamPage() {
  const data = await getPublicSiteData();

  return (
    <>
      <PageTitleBanner
        title="Team List"
        breadcrumbs={[{ label: "Pages" }, { label: "Team" }]}
      />

      <section className="bg-[var(--webtec-surface)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1290px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
              OUR TEAM
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-[var(--webtec-heading)] sm:text-4xl lg:text-[48px]">
              The Geniuses Behind The Scenes
            </h2>
            <p className="mt-4 text-sm text-[var(--webtec-body)]">
              Publicly featured leadership and specialists across design,
              engineering, and growth.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.team.map((member) => {
              const links = Object.entries(member.socialLinks || {});

              return (
                <div
                  key={member.id}
                  className="group rounded-[22px] bg-[#222222] p-4 text-white shadow-lg transition-colors duration-300 hover:bg-[var(--webtec-accent)]"
                >
                  <div className="relative overflow-hidden rounded-[18px]">
                    <Link href={`/team/${member.slug}`}>
                      <img
                        src={
                          member.avatarUrl ||
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={member.fullName}
                        className="h-[340px] w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </Link>

                    <div className="absolute right-4 bottom-4 flex gap-2">
                      {(links.length > 0
                        ? links.slice(0, 2)
                        : [["linkedin", "https://linkedin.com"]]
                      ).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${member.fullName} ${platform}`}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#222222] shadow transition hover:bg-[#13132E] hover:text-white"
                        >
                          {platform === "linkedin" ? (
                            <Linkedin className="h-4 w-4" />
                          ) : platform === "website" ? (
                            <Globe className="h-4 w-4" />
                          ) : (
                            <Share2 className="h-4 w-4" />
                          )}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="px-2 pt-5 pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                      {member.departmentName}
                    </span>
                    <h3 className="mt-1 font-heading text-2xl font-bold text-white">
                      <Link href={`/team/${member.slug}`}>{member.fullName}</Link>
                    </h3>
                    <p className="mt-1 text-sm text-white/80">
                      {member.designation}
                    </p>
                    {member.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {member.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/90"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
