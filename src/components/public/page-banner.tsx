import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBannerProps {
  title: string;
  eyebrow?: string;
  breadcrumbs: BreadcrumbItem[];
}

export function PageBanner({ title, eyebrow, breadcrumbs }: PageBannerProps) {
  return (
    <section
      className="relative overflow-hidden bg-[#13132E] pt-44 pb-28 sm:pt-48 sm:pb-32"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Webtec exact 158deg overlay gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: "linear-gradient(158deg, #13132E 54%, #FF3838 100%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full border border-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full border border-white/10"
      />

      <div className="relative z-10 mx-auto max-w-[1290px] px-4 text-center sm:px-6">
        {eyebrow ? (
          <span className="mb-3 inline-block font-heading text-xs font-bold tracking-[0.22em] uppercase text-[var(--webtec-accent)]">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-[60px] md:leading-[1.15]">
          {title}
        </h1>
        <nav
          aria-label="Breadcrumb"
          className="mt-5 flex flex-wrap items-center justify-center gap-2 text-base font-medium text-white/90 sm:text-lg"
        >
          <Link href="/" className="transition hover:text-[var(--webtec-accent)]">
            Home
          </Link>
          {breadcrumbs.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-white/60" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="transition hover:text-[var(--webtec-accent)]"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-white/80">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </section>
  );
}
