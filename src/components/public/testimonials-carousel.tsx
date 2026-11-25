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

export function TestimonialsCarousel({
  items,
}: {
  items: TestimonialItem[];
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (!items.length) return null;
  const current = items[activeIndex % items.length];

  function prev() {
    setActiveIndex((i) => (i - 1 + items.length) % items.length);
  }

  function next() {
    setActiveIndex((i) => (i + 1) % items.length);
  }

  return (
    <div className="grid items-center gap-12 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <span className="font-accent text-xs font-semibold uppercase tracking-[0.2em] text-[var(--webtec-accent)]">
          TESTIMONIALS
        </span>
        <h2 className="mt-3 font-heading text-3xl font-bold leading-tight text-[var(--webtec-heading)] sm:text-4xl lg:text-[46px]">
          What They&apos;re Talking About Us?
        </h2>
        <div className="my-6 h-px w-full bg-[var(--webtec-border)]" />

        <div className="mb-4 flex items-center gap-2 text-[var(--webtec-accent)]">
          <Quote className="h-9 w-9 fill-current opacity-85" />
          <div className="ml-2 flex items-center gap-0.5 text-[var(--webtec-review)]">
            {Array.from({ length: current.rating }).map((_, idx) => (
              <Star key={idx} className="h-4 w-4 fill-current" />
            ))}
          </div>
        </div>

        <p className="min-h-[108px] text-lg leading-relaxed text-[var(--webtec-heading)]/90">
          &ldquo;{current.quote}&rdquo;
        </p>

        <div className="mt-6">
          <p className="font-heading text-xl font-bold text-[var(--webtec-heading)]">
            {current.authorName}
          </p>
          <p className="text-sm text-[var(--webtec-body)]">
            {current.authorRole}
            {current.companyName ? ` — ${current.companyName}` : ""}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {items.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`View testimonial from ${item.authorName}`}
                className={cn(
                  "h-14 w-14 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer",
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous testimonial"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--webtec-surface-rose)] text-[var(--webtec-heading)] transition-colors hover:bg-[var(--webtec-accent)] hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--webtec-surface-rose)] text-[var(--webtec-heading)] transition-colors hover:bg-[var(--webtec-accent)] hover:text-white cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Webtec Rounded Arch Visual */}
      <div className="relative flex justify-center lg:col-span-6">
        <div className="relative w-full max-w-md">
          <div
            className="absolute -right-4 top-8 h-[88%] w-[88%] rounded-t-full border-2 border-[var(--webtec-accent)]/70"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-t-full rounded-b-3xl bg-[var(--webtec-surface-rose)] pt-8 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
              alt="Client success story"
              className="h-[440px] w-full object-cover object-top"
            />
          </div>
          <div className="absolute -left-4 bottom-10 rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface)] px-5 py-3.5 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--webtec-accent)] text-white">
                <Star className="h-4 w-4 fill-current" />
              </span>
              <div>
                <p className="font-heading text-sm font-bold text-[var(--webtec-heading)]">
                  4.9 / 5.0 Rating
                </p>
                <p className="text-xs text-[var(--webtec-body)]">
                  Verified B2B Clients
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
