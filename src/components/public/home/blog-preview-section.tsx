import Link from "next/link";
import { ArrowRight, Folder, MessageSquare } from "lucide-react";
import { WebtecButton } from "@/components/public/webtec-button";

interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  publishedAt: Date | null;
  categoryName: string;
  readingTime: number;
}

interface BlogPreviewSectionProps {
  posts: BlogPostItem[];
}

export function BlogPreviewSection({ posts }: BlogPreviewSectionProps) {
  const items = posts.slice(0, 2);

  return (
    <section className="bg-[var(--webtec-surface)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1290px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-12">
          {/* Left Intro Column */}
          <div className="lg:col-span-4">
            <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
              FROM THE BLOG
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-[1.2] text-[var(--webtec-heading)] sm:text-4xl lg:text-[44px]">
              Check Out Latest News Update &amp; Articles
            </h2>
            <p className="mt-5 text-base leading-[1.85] text-[var(--webtec-body)]">
              Insights from our product strategists, UX designers, and full-stack
              engineers on building conversion engines that scale.
            </p>
            <div className="mt-8">
              <WebtecButton href="/blog">VIEW ALL BLOGS</WebtecButton>
            </div>
          </div>

          {/* Right Blog Cards */}
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-8">
            {items.map((post) => {
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
                  className="group overflow-hidden rounded-[22px] border border-[var(--webtec-border)] bg-[var(--webtec-surface)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative">
                    <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
                      <img
                        src={
                          post.featuredImage ||
                          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80"
                        }
                        alt={post.title}
                        className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Overlapping Date Badge (Webtec .date-box) */}
                    <div className="absolute right-6 -bottom-7 z-10 flex h-20 w-[76px] flex-col items-center justify-center rounded-tl-[32px] rounded-br-xl bg-[var(--webtec-surface)] text-center shadow-lg transition-colors duration-300 group-hover:bg-[var(--webtec-accent)]">
                      <span className="font-heading text-2xl font-extrabold leading-none text-[var(--webtec-heading)] group-hover:text-white">
                        {day}
                      </span>
                      <span className="mt-1 font-heading text-xs font-semibold uppercase tracking-wider text-[var(--webtec-body)] group-hover:text-white/90">
                        {month}
                      </span>
                    </div>
                  </div>

                  <div className="p-7 pt-9">
                    <div className="flex items-center gap-4 border-b border-[var(--webtec-border)] pb-3 text-xs font-medium text-[var(--webtec-body)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Folder className="h-3.5 w-3.5 text-[var(--webtec-accent)]" />
                        {post.categoryName}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-[var(--webtec-accent)]" />
                        {post.readingTime} min read
                      </span>
                    </div>

                    <h3 className="mt-4 font-heading text-xl font-bold leading-snug text-[var(--webtec-heading)] transition-colors group-hover:text-[var(--webtec-accent)]">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <div className="mt-6 flex items-center justify-between">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="font-heading text-sm font-bold text-[var(--webtec-heading)] transition-colors hover:text-[var(--webtec-accent)]"
                      >
                        Read More
                      </Link>
                      <div className="flex items-center gap-3">
                        <span className="h-[2px] w-16 bg-[#e6e0fa] transition-colors group-hover:bg-[var(--webtec-accent)] dark:bg-white/15" />
                        <Link
                          href={`/blog/${post.slug}`}
                          aria-label={`Read ${post.title}`}
                          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--webtec-accent)] text-[var(--webtec-heading)] transition-colors group-hover:bg-[var(--webtec-accent)] group-hover:text-white"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
