import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CheckCircle2, ExternalLink } from "lucide-react";
import { getPublicSiteData } from "@/lib/services/public-cms";
import { PageTitleBanner } from "@/components/public/page-title-banner";
import { WebtecButton } from "@/components/public/webtec-button";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicSiteData();
  const project = data.portfolio.find((p) => p.slug === slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.summary,
    openGraph: {
      title: project.seoTitle || project.title,
      description: project.seoDescription || project.summary,
      images: project.featuredImage ? [project.featuredImage] : [],
    },
  };
}

export default async function ProjectDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPublicSiteData();
  const project = data.portfolio.find((p) => p.slug === slug);

  if (!project) notFound();

  const related = data.portfolio
    .filter((p) => p.slug !== project.slug)
    .slice(0, 3);

  return (
    <>
      <PageTitleBanner
        title={project.title}
        breadcrumbs={[
          { label: "Project", href: "/portfolio" },
          { label: "Project Details" },
        ]}
      />

      <section className="bg-[var(--webtec-surface)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1290px] px-4 sm:px-6 lg:px-8">
          {/* Hero Image */}
          <div className="overflow-hidden rounded-[30px] shadow-2xl">
            <img
              src={
                project.featuredImage ||
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=85"
              }
              alt={project.title}
              className="h-[340px] w-full object-cover sm:h-[480px] lg:h-[540px]"
            />
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-12">
            {/* Main Narrative */}
            <div className="space-y-8 lg:col-span-8">
              <div>
                <h2 className="font-heading text-3xl font-bold text-[var(--webtec-heading)] sm:text-4xl">
                  Here To Know About This Project
                </h2>
                <p className="mt-4 text-base leading-[1.9] text-[var(--webtec-body)]">
                  {project.summary}
                </p>
              </div>

              {project.challenge && (
                <div className="rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-7">
                  <h3 className="font-heading text-xl font-bold text-[var(--webtec-heading)]">
                    The Challenge
                  </h3>
                  <p className="mt-3 text-sm leading-[1.85] text-[var(--webtec-body)]">
                    {project.challenge}
                  </p>
                </div>
              )}

              {project.solution && (
                <div className="rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-7">
                  <h3 className="font-heading text-xl font-bold text-[var(--webtec-heading)]">
                    Our Solution
                  </h3>
                  <p className="mt-3 text-sm leading-[1.85] text-[var(--webtec-body)]">
                    {project.solution}
                  </p>
                </div>
              )}

              {project.results && (
                <div className="rounded-2xl border border-[var(--webtec-accent)]/25 bg-[var(--webtec-accent)]/10 p-7">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[var(--webtec-accent)]" />
                    <h3 className="font-heading text-xl font-bold text-[var(--webtec-heading)]">
                      Measurable Results
                    </h3>
                  </div>
                  <p className="mt-3 text-base font-semibold text-[var(--webtec-heading)]">
                    {project.results}
                  </p>
                </div>
              )}

              {project.galleryImages.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  {project.galleryImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${project.title} gallery ${i + 1}`}
                      className="h-60 w-full rounded-2xl object-cover shadow"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Metadata Box (Webtec project-details info card) */}
            <aside className="lg:col-span-4">
              <div className="rounded-[26px] bg-[var(--webtec-navy)] p-8 text-white shadow-xl">
                <h3 className="border-b border-white/15 pb-4 font-heading text-xl font-bold">
                  Project Information
                </h3>
                <dl className="mt-6 space-y-5 text-sm">
                  <div>
                    <dt className="text-white/60">Client</dt>
                    <dd className="mt-1 font-heading text-base font-bold text-white">
                      {project.clientName || "Enterprise Client"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/60">Category</dt>
                    <dd className="mt-1 font-heading text-base font-bold text-white">
                      {project.category}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/60">Industry</dt>
                    <dd className="mt-1 font-heading text-base font-bold text-white">
                      {project.industry || "Digital Technology"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/60">Technologies</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
                        >
                          {tech}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>

                <div className="mt-8 space-y-3">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-white/25 py-3 font-heading text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
                    >
                      <span>Visit Live Project</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <WebtecButton href="/contact" className="w-full justify-center">
                    START A PROJECT
                  </WebtecButton>
                </div>
              </div>
            </aside>
          </div>

          {/* Related Projects */}
          {related.length > 0 && (
            <div className="mt-20 border-t border-[var(--webtec-border)] pt-16">
              <div className="mb-10 text-center">
                <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
                  SELECTED WORKS
                </span>
                <h2 className="mt-2 font-heading text-3xl font-bold text-[var(--webtec-heading)]">
                  Related Projects
                </h2>
              </div>

              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/portfolio/${item.slug}`}
                    className="group relative block overflow-hidden rounded-[20px] bg-slate-900 shadow-lg"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden">
                      <img
                        src={
                          item.featuredImage ||
                          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80"
                        }
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#13132E]/90 via-transparent to-transparent transition group-hover:from-[var(--webtec-accent)]" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                      <div>
                        <span className="text-xs font-bold uppercase text-white/85">
                          {item.category}
                        </span>
                        <h3 className="mt-1 font-heading text-xl font-bold text-white">
                          {item.title}
                        </h3>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
