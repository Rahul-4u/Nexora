import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  featuredImage: string | null;
}

interface ServicesAndProcessSectionProps {
  services: ServiceItem[];
}

export function ServicesAndProcessSection({
  services,
}: ServicesAndProcessSectionProps) {
  const processSteps = [
    {
      num: "01",
      title: "Project Planning",
      tags: ["Project Research", "Competitive Analysis", "Define Flow"],
    },
    {
      num: "02",
      title: "Development",
      tags: ["Project Development", "Execution", "Error Fixing"],
    },
    {
      num: "03",
      title: "Quick Support",
      tags: ["Quality assurance", "Launch Product", "Maintenance"],
    },
  ];

  const displayedServices = services.slice(0, 4);

  return (
    <section className="px-3 py-8 sm:px-4">
      <div className="relative mx-auto max-w-[1870px] overflow-hidden rounded-[32px] lg:rounded-[50px] bg-[var(--webtec-navy)] py-20 text-white lg:py-28">
        {/* Ambient Webtec crimson & indigo glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/4 h-[420px] w-[420px] rounded-full bg-[var(--webtec-accent)]/20 blur-[140px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-1/4 h-[460px] w-[460px] rounded-full bg-indigo-500/20 blur-[140px]"
        />

        <div className="relative z-10 mx-auto max-w-[1290px] px-5 sm:px-8">
          {/* Upper Subsection: HOW IT WORK */}
          <div className="text-center">
            <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
              HOW IT WORK
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl lg:text-[50px]">
              Our Approach Is To Create
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {processSteps.map((step) => (
              <div
                key={step.num}
                className="group relative rounded-[14px] border border-white/10 bg-white/5 px-8 pt-14 pb-10 transition-all duration-300 hover:border-transparent hover:bg-[var(--webtec-accent)]"
              >
                {/* Floating Number Pill */}
                <span className="font-accent absolute right-7 -top-6 rounded-full border border-white/20 bg-[#37334b] px-6 py-2.5 text-3xl font-bold leading-none text-white transition-colors group-hover:bg-white group-hover:text-[var(--webtec-accent)]">
                  {step.num}
                </span>

                {/* Subtle glossy orb visual */}
                <div className="mb-7 h-16 w-16 rounded-2xl border border-white/15 bg-gradient-to-br from-white/20 to-white/5 shadow-inner" />

                <h3 className="font-heading text-2xl font-bold text-white">
                  {step.title}
                </h3>

                <ul className="mt-6 space-y-3">
                  {step.tags.map((tag) => (
                    <li
                      key={tag}
                      className="w-fit rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white/95 transition-colors group-hover:border-transparent group-hover:bg-black/15"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Lower Subsection: OUR SERVICES */}
          <div className="mt-24 pt-4">
            <div className="max-w-2xl">
              <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
                OUR SERVICES
              </span>
              <h2 className="mt-3 font-heading text-3xl font-bold leading-[1.2] text-white sm:text-4xl lg:text-[48px]">
                Empower Your Business With Innovative Digital Services
              </h2>
            </div>

            <div className="mt-12 divide-y divide-white/10 border-t border-b border-white/10">
              {displayedServices.map((service, index) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group relative flex flex-col justify-between gap-6 py-8 transition-all duration-300 md:flex-row md:items-center md:py-10"
                >
                  <div className="flex items-center gap-6 md:gap-10">
                    {service.featuredImage && (
                      <div className="hidden h-[88px] w-0 overflow-hidden rounded-2xl opacity-0 transition-all duration-300 group-hover:w-[190px] group-hover:opacity-100 lg:block">
                        <img
                          src={service.featuredImage}
                          alt={service.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <span className="font-accent text-3xl italic text-white/60 transition-colors group-hover:text-[var(--webtec-accent)] sm:text-4xl">
                      0{index + 1}.
                    </span>
                    <h3 className="font-heading text-3xl font-semibold text-white transition-transform duration-300 group-hover:translate-x-2 sm:text-5xl lg:text-[62px]">
                      {service.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between gap-6 md:justify-end">
                    <p className="max-w-xs text-sm text-white/65 lg:hidden">
                      {service.shortDescription}
                    </p>
                    <span className="flex h-[58px] w-[58px] shrink-0 -rotate-32 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 group-hover:rotate-0 group-hover:bg-[var(--webtec-accent)]">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
