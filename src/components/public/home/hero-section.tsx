import Link from "next/link";
import { Star, TrendingUp, Send } from "lucide-react";
import { WebtecButton } from "@/components/public/webtec-button";

interface HeroSectionProps {
  tagline?: string;
}

export function HeroSection({ tagline }: HeroSectionProps) {
  return (
    <section
      className="relative overflow-hidden bg-[#13132E] pt-36 pb-16 sm:pt-44 lg:pt-48 lg:pb-0"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Webtec exact 90deg navy-to-crimson overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-92"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #13132E 58%, rgba(255, 56, 56, 0.72) 86%)",
        }}
      />

      {/* Subtle geometric line curves */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-15"
        viewBox="0 0 1440 820"
        fill="none"
      >
        <path
          d="M-80 620C220 420 520 760 880 460C1140 245 1340 340 1540 160"
          stroke="white"
          strokeWidth="1.5"
        />
        <path
          d="M-40 720C280 510 610 810 960 520C1220 305 1400 390 1560 220"
          stroke="white"
          strokeWidth="1"
          strokeDasharray="6 6"
        />
      </svg>

      {/* Giant rotated vertical watermark (Webtec .tm-text-editor) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/2 hidden -translate-y-1/2 -rotate-90 select-none font-heading text-[160px] font-extrabold tracking-[12px] uppercase text-white/10 xl:block"
      >
        NEXORA
      </div>

      <div className="relative z-10 mx-auto max-w-[1630px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-7 lg:pb-24">
            <h1 className="font-heading text-5xl leading-[1.08] tracking-tight text-white sm:text-7xl xl:text-[104px] xl:leading-[1.08]">
              <span className="font-light">Your </span>
              <span className="font-bold">Ultimate</span>
              <br />
              <span className="font-bold">Digital </span>
              <span className="font-light">Agency</span>
            </h1>

            <p className="mt-7 max-w-[580px] text-base leading-[1.85] text-white/80 sm:text-[17px]">
              {tagline ||
                "Highlights the partnership between the client's vision and the agency's technical and creative skills. We engineer conversion-first websites, scalable SaaS products, and unified CRM growth engines."}
            </p>

            {/* CTA + Social Proof Row */}
            <div className="mt-10 flex flex-wrap items-center gap-8">
              <WebtecButton href="/contact">GET IN TOUCH</WebtecButton>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
                  ].map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt={`Satisfied Nexora client ${i + 1}`}
                      className="h-12 w-12 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[var(--webtec-accent)] font-heading text-xs font-bold text-white">
                    30k
                  </span>
                </div>
                <div className="text-sm leading-snug text-white">
                  <span className="block font-semibold">Our 30k Satisfaction</span>
                  <span className="text-white/75">Clients Worldwide</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Portrait + Floating Sales Trend + 5 Stars Cards */}
          <div className="relative lg:col-span-5 lg:self-end">
            <div className="relative mx-auto max-w-[490px]">
              {/* Main Portrait */}
              <div className="relative overflow-hidden rounded-t-[36px] lg:rounded-t-[48px]">
                <img
                  src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=900&q=85"
                  alt="Nexora Lead Digital Strategist"
                  className="h-[440px] w-full object-cover object-top sm:h-[540px] lg:h-[610px]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#13132E]/50 via-transparent to-transparent"
                />
              </div>

              {/* Floating Sales Trend Card */}
              <div className="absolute -left-3 top-20 z-20 rounded-2xl bg-white p-4 text-[#24201F] shadow-2xl sm:-left-10 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Sales trend
                    </p>
                    <p className="font-heading text-2xl font-extrabold text-[#13132E]">
                      68%
                    </p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff3838]/10 text-[var(--webtec-accent)]">
                    <TrendingUp className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-3 flex items-end gap-1.5">
                  {[35, 52, 44, 72, 60, 88, 100].map((h, idx) => (
                    <span
                      key={idx}
                      style={{ height: `${Math.round(h * 0.28)}px` }}
                      className={
                        idx >= 5
                          ? "w-2 rounded-full bg-[var(--webtec-accent)]"
                          : "w-2 rounded-full bg-indigo-100"
                      }
                    />
                  ))}
                </div>
                <div className="absolute -top-6 -right-5 hidden h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--webtec-accent)] shadow-md sm:flex">
                  <Send className="h-4 w-4" />
                </div>
              </div>

              {/* Floating Glassmorphic 5 Stars Card */}
              <div className="absolute bottom-8 right-3 left-3 z-20 flex items-center gap-4 rounded-2xl border border-white/30 bg-white/85 px-5 py-3.5 text-[#24201F] shadow-2xl backdrop-blur-md sm:left-auto sm:right-4 sm:min-w-[280px]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--webtec-accent)] text-white shadow">
                  <Star className="h-5 w-5 fill-current" />
                </span>
                <div>
                  <p className="font-heading text-sm font-bold text-[#13132E]">
                    5 Stars
                  </p>
                  <Link
                    href="/portfolio"
                    className="text-xs font-medium text-slate-700 underline underline-offset-2 hover:text-[var(--webtec-accent)]"
                  >
                    Read Our Success Stories
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
