import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { WebtecButton } from "@/components/public/webtec-button";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  featuredImage: string | null;
}

interface PortfolioPreviewSectionProps {
  projects: PortfolioItem[];
}

export function PortfolioPreviewSection({
  projects,
}: PortfolioPreviewSectionProps) {
  const items = projects.slice(0, 6);

  return (
    <section className="bg-[var(--webtec-surface)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1620px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
            SELECTED WORKS
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-[var(--webtec-heading)] sm:text-4xl lg:text-[50px]">
            Showcasing Your Projects
          </h2>
        </div>

        <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((project) => (
            <Link
              key={project.id}
              href={`/portfolio/${project.slug}`}
              className="group relative block overflow-hidden rounded-[20px] bg-slate-900 shadow-lg"
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

              {/* Webtec Signature Bottom-Up Red Gradient Reveal */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#13132E]/85 via-[#13132E]/20 to-transparent transition-all duration-300 group-hover:from-[var(--webtec-accent)] group-hover:via-[var(--webtec-accent)]/70"
              />

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-7">
                <div>
                  <span className="inline-block text-xs font-bold tracking-wider uppercase text-white/90">
                    {project.category}
                  </span>
                  <h3 className="mt-1.5 font-heading text-2xl font-semibold text-white">
                    {project.title}
                  </h3>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <WebtecButton href="/portfolio">VIEW ALL PROJECTS</WebtecButton>
        </div>
      </div>
    </section>
  );
}
