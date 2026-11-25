"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Linkedin, Globe, Share2 } from "lucide-react";

interface TeamMemberItem {
  id: string;
  fullName: string;
  slug: string;
  designation: string;
  avatarUrl: string | null;
  socialLinks: Record<string, string> | null;
}

interface TeamPreviewSectionProps {
  team: TeamMemberItem[];
}

export function TeamPreviewSection({ team }: TeamPreviewSectionProps) {
  const [openSocialId, setOpenSocialId] = React.useState<string | null>(null);
  const members = team.slice(0, 3);

  return (
    <section className="px-3 py-8 sm:px-4">
      <div className="relative mx-auto max-w-[1844px] overflow-hidden rounded-[30px] bg-[var(--webtec-navy)] py-20 text-white lg:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 left-1/3 h-[380px] w-[380px] rounded-full bg-[var(--webtec-accent)]/25 blur-[130px]"
        />

        <div className="relative z-10 mx-auto max-w-[1290px] px-5 sm:px-8">
          <div className="text-center">
            <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
              OUR TEAM
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl lg:text-[50px]">
              The Geniuses Behind The Scenes
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {members.map((member) => {
              const isOpen = openSocialId === member.id;
              const links = Object.entries(member.socialLinks || {});

              return (
                <div
                  key={member.id}
                  className="group relative rounded-[20px] bg-[#222222] p-4 transition-colors duration-300 hover:bg-[var(--webtec-accent)]"
                >
                  <div className="relative overflow-hidden rounded-[18px]">
                    <Link href={`/team/${member.slug}`}>
                      <img
                        src={
                          member.avatarUrl ||
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={member.fullName}
                        className="h-[340px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Expandable Social Drawer */}
                    {isOpen && (
                      <div className="absolute right-4 bottom-16 flex flex-col gap-2">
                        {(links.length > 0
                          ? links
                          : [["linkedin", "https://linkedin.com"]]
                        ).map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${member.fullName} ${platform}`}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#222222] text-white shadow-lg transition hover:bg-black"
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
                    )}

                    {/* Webtec + Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setOpenSocialId(isOpen ? null : member.id)
                      }
                      aria-label={`Toggle social links for ${member.fullName}`}
                      className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#222222] shadow-md transition-transform duration-300 hover:bg-[#222222] hover:text-white cursor-pointer"
                    >
                      <Plus
                        className={`h-4 w-4 transition-transform duration-300 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="px-2 pt-5 pb-2">
                    <Link
                      href={`/team/${member.slug}`}
                      className="font-heading text-2xl font-bold text-white"
                    >
                      {member.fullName}
                    </Link>
                    <p className="mt-1 text-sm text-white/75 group-hover:text-white/95">
                      {member.designation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
