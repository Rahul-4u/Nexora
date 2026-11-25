"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/shared/pagination";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  clientName: string | null;
  summary: string;
  featuredImage: string | null;
  isFeatured: boolean;
}

export function PortfolioExplorer({ items }: { items: PortfolioItem[] }) {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("All");
  const [page, setPage] = React.useState(1);
  const pageSize = 6;

  const categories = React.useMemo(() => {
    const unique = Array.from(new Set(items.map((p) => p.category)));
    return ["All", ...unique];
  }, [items]);

  const filtered = React.useMemo(() => {
    return items.filter((item) => {
      const matchesCat = category === "All" || item.category === category;
      const q = search.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        (item.clientName ?? "").toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [items, category, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                category === cat
                  ? "bg-[var(--webtec-accent)] text-white"
                  : "border border-[var(--webtec-border)] bg-[var(--webtec-surface)] text-[var(--webtec-heading)] hover:border-[var(--webtec-accent)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--webtec-body)]" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search projects..."
            className="pl-9"
          />
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--webtec-border)] p-12 text-center text-[var(--webtec-body)]">
          No portfolio projects match your filters.
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((project) => (
            <Link
              key={project.id}
              href={`/portfolio/${project.slug}`}
              className="group overflow-hidden rounded-3xl border border-[var(--webtec-border)] bg-[var(--webtec-surface)] shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={
                    project.featuredImage ||
                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80"
                  }
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {project.isFeatured ? (
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-[var(--webtec-accent)] px-3 py-1 text-[11px] font-bold uppercase text-white">
                    <Sparkles className="h-3 w-3" />
                    Featured
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-4 p-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--webtec-accent)]">
                    {project.category}
                  </span>
                  <h3 className="mt-1 font-heading text-lg font-bold text-[var(--webtec-heading)] group-hover:text-[var(--webtec-accent)]">
                    {project.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-[var(--webtec-body)]">
                    {project.summary}
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--webtec-border)] text-[var(--webtec-heading)] group-hover:bg-[var(--webtec-accent)] group-hover:text-white">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
