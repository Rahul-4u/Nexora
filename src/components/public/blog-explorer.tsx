"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/shared/pagination";
import { formatDate } from "@/lib/utils";

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  readingTime: number;
  isFeatured: boolean;
  publishedAt: Date | string | null;
  categoryName: string;
  categorySlug: string;
  authorName: string;
  tags: Array<{ name: string; slug: string }>;
}

export function BlogExplorer({
  posts,
  initialQuery = "",
}: {
  posts: BlogItem[];
  initialQuery?: string;
}) {
  const [search, setSearch] = React.useState(initialQuery);
  const [category, setCategory] = React.useState("All");
  const [tag, setTag] = React.useState("All");
  const [page, setPage] = React.useState(1);
  const pageSize = 6;

  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.categoryName)))],
    [posts]
  );

  const tags = React.useMemo(
    () => [
      "All",
      ...Array.from(new Set(posts.flatMap((p) => p.tags.map((t) => t.name)))),
    ],
    [posts]
  );

  const featured = posts.find((p) => p.isFeatured) ?? posts[0];

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      const catMatch = category === "All" || p.categoryName === category;
      const tagMatch = tag === "All" || p.tags.some((t) => t.name === tag);
      const queryMatch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q);
      return catMatch && tagMatch && queryMatch;
    });
  }, [posts, category, tag, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-12">
      {/* Featured Blog Highlight */}
      {featured && !search && category === "All" && tag === "All" && page === 1 ? (
        <div className="grid overflow-hidden rounded-3xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] shadow-md lg:grid-cols-12">
          <div className="lg:col-span-6">
            <img
              src={
                featured.featuredImage ||
                "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80"
              }
              alt={featured.title}
              className="h-full min-h-[300px] w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-8 lg:col-span-6 lg:p-12">
            <span className="inline-block w-fit rounded-full bg-[var(--webtec-accent)] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Featured • {featured.categoryName}
            </span>
            <h2 className="mt-4 font-heading text-2xl font-bold text-[var(--webtec-heading)] sm:text-3xl">
              <Link href={`/blog/${featured.slug}`} className="hover:text-[var(--webtec-accent)]">
                {featured.title}
              </Link>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--webtec-body)]">
              {featured.excerpt}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-[var(--webtec-body)]">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[var(--webtec-accent)]" />
                {featured.authorName}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[var(--webtec-accent)]" />
                {featured.readingTime} min read
              </span>
              <span>{formatDate(featured.publishedAt)}</span>
            </div>
            <Link
              href={`/blog/${featured.slug}`}
              className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-bold text-[var(--webtec-accent)]"
            >
              <span>Read Full Article</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}

      {/* Search & Filters */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                category === cat
                  ? "bg-[var(--webtec-accent)] text-white"
                  : "bg-[var(--webtec-surface)] text-[var(--webtec-heading)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Filter by tag"
            value={tag}
            onChange={(e) => {
              setTag(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[var(--webtec-border)] bg-[var(--webtec-surface)] px-3 text-xs font-semibold text-[var(--webtec-heading)]"
          >
            {tags.map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "All Tags" : `#${t}`}
              </option>
            ))}
          </select>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--webtec-body)]" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search articles..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      {paginated.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--webtec-border)] p-12 text-center text-[var(--webtec-body)]">
          No published articles matched your search.
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {paginated.map((post) => {
            const pub = post.publishedAt ? new Date(post.publishedAt) : new Date();
            const day = pub.getDate().toString().padStart(2, "0");
            const month = pub.toLocaleString("en-US", { month: "short" }).toUpperCase();

            return (
              <article
                key={post.id}
                className="group overflow-hidden rounded-3xl border border-[var(--webtec-border)] bg-[var(--webtec-surface)] shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={
                      post.featuredImage ||
                      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80"
                    }
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 left-5 rounded-xl bg-[var(--webtec-surface)] px-3.5 py-2 text-center shadow-lg">
                    <span className="block font-heading text-lg font-extrabold leading-none text-[var(--webtec-heading)]">
                      {day}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-[var(--webtec-accent)]">
                      {month}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--webtec-body)]">
                    <span className="font-bold text-[var(--webtec-accent)]">
                      {post.categoryName}
                    </span>
                    <span>•</span>
                    <span>{post.authorName}</span>
                    <span>•</span>
                    <span>{post.readingTime} min</span>
                  </div>

                  <h3 className="mt-2.5 font-heading text-xl font-bold leading-snug text-[var(--webtec-heading)] group-hover:text-[var(--webtec-accent)]">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-[var(--webtec-body)]">
                    {post.excerpt}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-[var(--webtec-border)] pt-4">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xs font-bold uppercase tracking-wider text-[var(--webtec-heading)] hover:text-[var(--webtec-accent)]"
                    >
                      Read More
                    </Link>
                    <Link
                      href={`/blog/${post.slug}`}
                      aria-label={`Read ${post.title}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--webtec-accent)] text-[var(--webtec-accent)] transition-colors hover:bg-[var(--webtec-accent)] hover:text-white"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
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
