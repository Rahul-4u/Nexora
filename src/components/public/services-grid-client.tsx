"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Code2, Layout, Palette, TrendingUp, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  iconName: string | null;
  benefits: string[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  Layout,
  Code2,
  TrendingUp,
};

export function ServicesGridClient({ services }: { services: ServiceItem[] }) {
  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(services.map((s) => s.category)))],
    [services]
  );
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filtered = React.useMemo(
    () =>
      selectedCategory === "All"
        ? services
        : services.filter((s) => s.category === selectedCategory),
    [services, selectedCategory]
  );

  return (
    <div>
      {/* Category Filter Pills */}
      <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "rounded-full px-6 py-2.5 font-heading text-sm font-semibold transition cursor-pointer",
              selectedCategory === cat
                ? "bg-[var(--webtec-accent)] text-white shadow-md"
                : "border border-[var(--webtec-border)] bg-[var(--webtec-surface)] text-[var(--webtec-heading)] hover:border-[var(--webtec-accent)] hover:text-[var(--webtec-accent)]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Webtec ks-service-style-2 Cards */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((service) => {
          const Icon = (service.iconName && iconMap[service.iconName]) || Layers;

          return (
            <div
              key={service.id}
              className="group flex flex-col justify-between rounded-[24px] border border-[var(--webtec-border)] bg-[var(--webtec-surface)] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--webtec-accent)]/40 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff3838]/10 text-[var(--webtec-accent)] transition-colors group-hover:bg-[var(--webtec-accent)] group-hover:text-white">
                    <Icon className="h-7 w-7" />
                  </span>
                  <span className="rounded-full bg-[var(--webtec-surface-alt)] px-3.5 py-1 text-xs font-semibold text-[var(--webtec-body)]">
                    {service.category}
                  </span>
                </div>

                <h3 className="mt-7 font-heading text-2xl font-bold text-[var(--webtec-heading)]">
                  <Link
                    href={`/services/${service.slug}`}
                    className="transition-colors hover:text-[var(--webtec-accent)]"
                  >
                    {service.title}
                  </Link>
                </h3>

                <p className="mt-3 text-sm leading-[1.8] text-[var(--webtec-body)]">
                  {service.shortDescription}
                </p>

                <ul className="mt-6 space-y-2.5 border-t border-[var(--webtec-border)] pt-5">
                  {service.benefits.slice(0, 4).map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2.5 text-sm font-medium text-[var(--webtec-heading)]"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--webtec-accent)]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-2">
                <Link
                  href={`/services/${service.slug}`}
                  className="inline-flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-[var(--webtec-accent)] transition hover:gap-3"
                >
                  <span>Explore Service</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
