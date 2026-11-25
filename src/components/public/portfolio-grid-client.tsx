"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  clientName: string | null;
  industry: string | null;
  summary: string;
  featuredImage: string | null;
  isFeatured: boolean;
}

const PAGE_SIZE = 6;

export function PortfolioGridClient({
  projects,
}: {
  projects: PortfolioItem[];
}) {
  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(projects.map((p) => p.category)))],
    [projects]
  );
  const [category, setCategory] = React.useState("All");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const matchCat = category === "All" || p.category === category;
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        (p.clientName || "").toLowerCase().includes(q) ||
        (p.industry || "").toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [projects, category, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  React.useEffect(() => {
    setPage(1);
  }, [category, search]);

  return (
    <div>
      {/* Filter & Search Bar */}
      <div className="mb-12 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full px-5 py-2.5 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer",
                category === cat
                  ? "bg-[var(--webtec-accent)] text-white shadow-md"
                  : "border border-[var(--webtec-border)] bg-[var(--webtec-surface)] text-[var(--webtec-heading)] hover:border-[var(--webtec-accent)]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, clients..."
            className="h-11 w-full rounded-full border border-[var(--webtec-border)] bg-[var(--webtec-surface)] pl-11 pr-4 text-sm text-[var(--webtec-heading)] outline-none focus:border-[var(--webtec-accent)]"
          />
        </div>
      </div>

      {paged.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--webtec-border)] py-16 text-center">
          <p className="font-heading text-lg font-semibold text-[var(--webtec-heading)]">
            No matching portfolio projects found.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((project) => (
            <Link
              key={project.id}
              href={`/portfolio/${project.slug}`}
              className="group relative block overflow-hidden rounded-[22px] bg-slate-900 shadow-lg"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={
                    project.featuredImage ||
                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80"
                  }
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {project.isFeatured && (
                <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 rounded-full bg-[var(--webtec-accent)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow">
                  <Sparkles className="h-3 w-3" />
                  Featured
                </span>
              )}

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#13132E]/90 via-[#13132E]/25 to-transparent transition-all duration-300 group-hover:from-[var(--webtec-accent)] group-hover:via-[var(--webtec-accent)]/75"
              />

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-7">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                    {project.category}
                  </span>
                  <h3 className="mt-1 font-heading text-2xl font-semibold text-white">
                    {project.title}
                  </h3>
                  {project.clientName && (
                    <p className="mt-1 text-xs text-white/80">
                      Client: {project.clientName}
                    </p>
                  )}
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full font-heading text-sm font-bold transition cursor-pointer",
                  p === currentPage
                    ? "bg-[var(--webtec-accent)] text-white"
                    : "border border-[var(--webtec-border)] text-[var(--webtec-heading)] hover:border-[var(--webtec-accent)]"
                )}
              >
                {p}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
