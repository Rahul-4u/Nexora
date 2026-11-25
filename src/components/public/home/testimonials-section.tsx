"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialItem {
  id: string;
  authorName: string;
  authorRole: string;
  companyName: string | null;
  avatarUrl: string | null;
  quote: string;
  rating: number;
}

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
}

export function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const items = testimonials.length > 0 ? testimonials : [];
  const active = items[activeIndex] ?? items[0];

  if (!active) return null;

  const prev = () =>
    setActiveIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setActiveIndex((i) => (i + 1) % items.length);

  return (
    <section className="overflow-hidden bg-[var(--webtec-surface)] pt-20 pb-12 lg:pt-28">
      <div className="mx-auto max-w-[1290px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Column */}
          <div className="lg:col-span-6">
            <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
              TESTIMONIALS
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-[1.2] text-[var(--webtec-heading)] sm:text-4xl lg:text-[48px]">
              What They&apos;re Talking About Us?
            </h2>

            <div className="mt-8 border-t border-[#e6e0fa] pt-8 dark:border-white/10">
              <div className="flex items-center justify-between">
                <Quote className="h-10 w-10 fill-[var(--webtec-accent)] text-[var(--webtec-accent)]" />
                <div className="flex gap-1">
                  {Array.from({ length: active.rating }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="h-4 w-4 fill-[var(--webtec-review)] text-[var(--webtec-review)]"
                    />
                  ))}
                </div>
              </div>

              <p className="mt-5 text-lg leading-[1.85] text-[var(--webtec-body)] sm:text-xl">
                &ldquo;{active.quote}&rdquo;
              </p>

              <div className="mt-6">
                <h3 className="font-heading text-xl font-bold text-[var(--webtec-heading)]">
                  {active.authorName}
                </h3>
                <p className="text-sm text-[var(--webtec-body)]">
                  {active.authorRole}
                  {active.companyName ? ` — ${active.companyName}` : ""}
                </p>
              </div>

              {/* Avatar Thumbs + Arrow Controls */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  {items.slice(0, 3).map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`View testimonial from ${item.authorName}`}
                      className={cn(
                        "relative h-16 w-16 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer",
                        idx === activeIndex
                          ? "scale-105 border-[var(--webtec-accent)] shadow-lg"
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img
                        src={
                          item.avatarUrl ||
                          "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
                        }
                        alt={item.authorName}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous testimonial"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e6e0fa] text-[#13132E] transition hover:bg-[var(--webtec-accent)] hover:text-white dark:bg-white/10 dark:text-white cursor-pointer"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next testimonial"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e6e0fa] text-[#13132E] transition hover:bg-[var(--webtec-accent)] hover:text-white dark:bg-white/10 dark:text-white cursor-pointer"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Webtec Red-Outline Arch + Lavender Arch + Portrait */}
          <div className="relative flex justify-center lg:col-span-6">
            <div className="relative h-[460px] w-full max-w-[440px]">
              {/* Solid Lavender Arch */}
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-1/2 h-[420px] w-[300px] -translate-x-1/2 rounded-t-[200px] bg-[#EAE3FB] dark:bg-indigo-950/60"
              />
              {/* Red Outline Arch */}
              <div
                aria-hidden="true"
                className="absolute top-12 right-6 h-[320px] w-[320px] rounded-t-[200px] border-[5px] border-[var(--webtec-accent)]"
              />
              {/* Portrait */}
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=85"
                alt="Client success story portrait"
                className="relative z-10 mx-auto h-full w-[330px] rounded-t-[180px] object-cover object-top"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
