"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Folder, Search, Sparkles, User } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface BlogPostItem {
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

const PAGE_SIZE = 6;

export function BlogGridClient({ posts }: { posts: BlogPostItem[] }) {
  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.categoryName)))],
    [posts]
  );
  const allTags = React.useMemo(() => {
    const map = new Map<string, string>();
    posts.forEach((p) => p.tags.forEach((t) => map.set(t.slug, t.name)));
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [posts]);

  const [category, setCategory] = React.useState("All");
  const [tag, setTag] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const featured = posts.find((p) => p.isFeatured) ?? posts[0];

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      const matchCat = category === "All" || p.categoryName === category;
      const matchTag = !tag || p.tags.some((t) => t.slug === tag);
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q);
      return matchCat && matchTag && matchQuery;
    });
  }, [posts, category, tag, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  React.useEffect(() => {
    setPage(1);
  }, [category, tag, search]);

  return (
    <div className="space-y-14">
      {/* Featured Blog Banner */}
      {featured && (
        <div className="grid overflow-hidden rounded-[28px] border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] shadow-lg lg:grid-cols-12">
          <div className="lg:col-span-6">
            <img
              src={
                featured.featuredImage ||
                "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=85"
              }
              alt={featured.title}
              className="h-full min-h-[280px] w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-6 lg:p-12">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--webtec-accent)]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--webtec-accent)]">
              <Sparkles className="h-3.5 w-3.5" />
              Featured Article
            </span>
            <h2 className="mt-4 font-heading text-2xl font-bold leading-tight text-[var(--webtec-heading)] sm:text-3xl">
              <Link
                href={`/blog/${featured.slug}`}
                className="transition hover:text-[var(--webtec-accent)]"
              >
                {featured.title}
              </Link>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--webtec-body)]">
              {featured.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-5 text-xs font-medium text-[var(--webtec-body)]">
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
            <div className="mt-7">
              <Link
                href={`/blog/${featured.slug}`}
                className="inline-flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-[var(--webtec-accent)] hover:gap-3 transition-all"
              >
                Read Featured Article <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search + Category + Tag Filters */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full px-5 py-2 font-heading text-xs font-bold uppercase tracking-wider transition cursor-pointer",
                category === cat
                  ? "bg-[var(--webtec-accent)] text-white"
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
            placeholder="Search articles..."
            className="h-11 w-full rounded-full border border-[var(--webtec-border)] bg-[var(--webtec-surface)] pl-11 pr-4 text-sm text-[var(--webtec-heading)] outline-none focus:border-[var(--webtec-accent)]"
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--webtec-body)]">
            Tags:
          </span>
          <button
            type="button"
            onClick={() => setTag(null)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer",
              !tag
                ? "bg-[var(--webtec-navy)] text-white"
                : "bg-[var(--webtec-surface-alt)] text-[var(--webtec-body)] hover:text-[var(--webtec-heading)]"
            )}
          >
            All Tags
          </button>
          {allTags.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => setTag(tag === t.slug ? null : t.slug)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer",
                tag === t.slug
                  ? "bg-[var(--webtec-accent)] text-white"
                  : "bg-[var(--webtec-surface-alt)] text-[var(--webtec-body)] hover:text-[var(--webtec-heading)]"
              )}
            >
              #{t.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {paged.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--webtec-border)] py-16 text-center">
          <p className="font-heading text-lg font-semibold text-[var(--webtec-heading)]">
            No articles match your filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {paged.map((post) => {
            const dateObj = post.publishedAt
              ? new Date(post.publishedAt)
              : new Date();
            const day = String(dateObj.getDate()).padStart(2, "0");
            const month = dateObj
              .toLocaleDateString("en-US", { month: "short" })
              .toUpperCase();

            return (
              <article
                key={post.id}
                className="group overflow-hidden rounded-[22px] border border-[var(--webtec-border)] bg-[var(--webtec-surface)] shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative">
                  <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
                    <img
                      src={
                        post.featuredImage ||
                        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80"
                      }
                      alt={post.title}
                      className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="absolute right-6 -bottom-7 z-10 flex h-20 w-[76px] flex-col items-center justify-center rounded-tl-[32px] rounded-br-xl bg-[var(--webtec-surface)] text-center shadow-lg transition-colors group-hover:bg-[var(--webtec-accent)]">
                    <span className="font-heading text-2xl font-extrabold leading-none text-[var(--webtec-heading)] group-hover:text-white">
                      {day}
                    </span>
                    <span className="mt-1 font-heading text-xs font-semibold uppercase text-[var(--webtec-body)] group-hover:text-white/90">
                      {month}
                    </span>
                  </div>
                </div>

                <div className="p-7 pt-9">
                  <div className="flex flex-wrap items-center gap-3 border-b border-[var(--webtec-border)] pb-3 text-xs text-[var(--webtec-body)]">
                    <span className="inline-flex items-center gap-1">
                      <Folder className="h-3.5 w-3.5 text-[var(--webtec-accent)]" />
                      {post.categoryName}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-[var(--webtec-accent)]" />
                      {post.authorName}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[var(--webtec-accent)]" />
                      {post.readingTime} min
                    </span>
                  </div>

                  <h3 className="mt-4 font-heading text-xl font-bold leading-snug text-[var(--webtec-heading)] group-hover:text-[var(--webtec-accent)]">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-[var(--webtec-body)]">
                    {post.excerpt}
                  </p>

                  <div className="mt-6 flex items-center justify-between">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-heading text-sm font-bold text-[var(--webtec-heading)] hover:text-[var(--webtec-accent)]"
                    >
                      Read More
                    </Link>
                    <Link
                      href={`/blog/${post.slug}`}
                      aria-label={`Read ${post.title}`}
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--webtec-accent)] text-[var(--webtec-heading)] transition group-hover:bg-[var(--webtec-accent)] group-hover:text-white"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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
