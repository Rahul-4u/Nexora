import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Folder, Share2, User } from "lucide-react";
import { getPublicSiteData } from "@/lib/services/public-cms";
import { PageTitleBanner } from "@/components/public/page-title-banner";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicSiteData();
  const post = data.blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Article Not Found" };

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      type: "article",
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

export default async function BlogDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPublicSiteData();
  const post = data.blogPosts.find((p) => p.slug === slug);

  if (!post) notFound();

  const related = data.blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);
  const categories = Array.from(new Set(data.blogPosts.map((p) => p.categoryName)));
  const paragraphs = post.content.split(/\n\n+/).filter(Boolean);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shareUrl = encodeURIComponent(`${appUrl}/blog/${post.slug}`);
  const shareTitle = encodeURIComponent(post.title);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.authorName },
    datePublished: post.publishedAt?.toISOString(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageTitleBanner
        title={post.title}
        breadcrumbs={[
          { label: "News", href: "/blog" },
          { label: "News Details" },
        ]}
      />

      <section className="bg-[var(--webtec-surface)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1290px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Article Main Column */}
            <article className="lg:col-span-8">
              <div className="overflow-hidden rounded-[26px] shadow-xl">
                <img
                  src={
                    post.featuredImage ||
                    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85"
                  }
                  alt={post.title}
                  className="h-[340px] w-full object-cover sm:h-[450px]"
                />
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-5 border-b border-[var(--webtec-border)] pb-5 text-sm text-[var(--webtec-body)]">
                <span className="inline-flex items-center gap-2">
                  <User className="h-4 w-4 text-[var(--webtec-accent)]" />
                  {post.authorName}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Folder className="h-4 w-4 text-[var(--webtec-accent)]" />
                  {post.categoryName}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--webtec-accent)]" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--webtec-accent)]" />
                  {post.readingTime} min read
                </span>
              </div>

              <h2 className="mt-7 font-heading text-3xl font-bold leading-snug text-[var(--webtec-heading)] sm:text-4xl">
                {post.title}
              </h2>

              <p className="mt-4 text-lg font-medium leading-relaxed text-[var(--webtec-heading)]/85">
                {post.excerpt}
              </p>

              <div className="mt-7 space-y-5 text-base leading-[1.9] text-[var(--webtec-body)]">
                {paragraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {/* Tags + Share Bar */}
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-b border-[var(--webtec-border)] py-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading text-sm font-bold text-[var(--webtec-heading)]">
                    Tags:
                  </span>
                  {post.tags.map((t) => (
                    <span
                      key={t.slug}
                      className="rounded-full bg-[var(--webtec-surface-alt)] px-3.5 py-1 text-xs font-semibold text-[var(--webtec-heading)]"
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--webtec-heading)]">
                    <Share2 className="h-4 w-4 text-[var(--webtec-accent)]" />
                    Share:
                  </span>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[var(--webtec-border)] px-3 py-1 text-xs font-semibold text-[var(--webtec-heading)] hover:border-[var(--webtec-accent)] hover:text-[var(--webtec-accent)]"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[var(--webtec-border)] px-3 py-1 text-xs font-semibold text-[var(--webtec-heading)] hover:border-[var(--webtec-accent)] hover:text-[var(--webtec-accent)]"
                  >
                    X
                  </a>
                </div>
              </div>

              {/* Related Articles */}
              {related.length > 0 && (
                <div className="mt-12">
                  <h3 className="font-heading text-2xl font-bold text-[var(--webtec-heading)]">
                    Related Articles
                  </h3>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    {related.slice(0, 2).map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/blog/${rel.slug}`}
                        className="group overflow-hidden rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-5 transition hover:border-[var(--webtec-accent)]"
                      >
                        <span className="text-xs font-bold uppercase text-[var(--webtec-accent)]">
                          {rel.categoryName}
                        </span>
                        <h4 className="mt-2 font-heading text-lg font-bold text-[var(--webtec-heading)] group-hover:text-[var(--webtec-accent)]">
                          {rel.title}
                        </h4>
                        <p className="mt-2 line-clamp-2 text-xs text-[var(--webtec-body)]">
                          {rel.excerpt}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Webtec Blog Sidebar */}
            <aside className="space-y-8 lg:col-span-4">
              <div className="rounded-[24px] border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-7">
                <h3 className="font-heading text-xl font-bold text-[var(--webtec-heading)]">
                  Latest Posts
                </h3>
                <div className="mt-5 space-y-4">
                  {data.blogPosts.slice(0, 4).map((item) => (
                    <Link
                      key={item.id}
                      href={`/blog/${item.slug}`}
                      className="flex items-center gap-4 group"
                    >
                      <img
                        src={
                          item.featuredImage ||
                          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80"
                        }
                        alt={item.title}
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                      <div>
                        <span className="text-[11px] font-semibold uppercase text-[var(--webtec-accent)]">
                          {item.categoryName}
                        </span>
                        <h4 className="font-heading text-sm font-bold leading-snug text-[var(--webtec-heading)] group-hover:text-[var(--webtec-accent)]">
                          {item.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-7">
                <h3 className="font-heading text-xl font-bold text-[var(--webtec-heading)]">
                  Categories
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {categories.map((cat) => (
                    <li key={cat}>
                      <Link
                        href="/blog"
                        className="flex items-center justify-between rounded-xl bg-[var(--webtec-surface)] px-4 py-3 text-sm font-semibold text-[var(--webtec-heading)] transition hover:text-[var(--webtec-accent)]"
                      >
                        <span>{cat}</span>
                        <span className="text-xs text-[var(--webtec-body)]">
                          &rarr;
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
