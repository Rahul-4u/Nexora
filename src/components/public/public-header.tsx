"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Phone,
  Search,
  X,
  ArrowUpRight,
} from "lucide-react";
import { NexoraLogo } from "@/components/shared/nexora-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { WebtecButton } from "@/components/public/webtec-button";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
}

interface SearchEntry {
  title: string;
  category: string;
  href: string;
}

interface PublicHeaderProps {
  siteName: string;
  phone: string;
  services: Array<{ title: string; slug: string }>;
  projects: Array<{ title: string; slug: string }>;
  posts: Array<{ title: string; slug: string }>;
}

export function PublicHeader({
  siteName,
  phone,
  services,
  projects,
  posts,
}: PublicHeaderProps) {
  const pathname = usePathname();
  const [isSticky, setIsSticky] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openMobileGroup, setOpenMobileGroup] = React.useState<string | null>(null);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    const onScroll = () => {
      setIsSticky(window.scrollY > 120);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const navItems: NavItem[] = [
    {
      label: "HOME",
      href: "/",
    },
    {
      label: "PAGES",
      href: "/about",
      children: [
        { label: "About Us", href: "/about" },
        { label: "Team Members", href: "/team" },
        { label: "Contact Us", href: "/contact" },
        { label: "FAQ", href: "/faq" },
        { label: "Careers", href: "/careers" },
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms & Conditions", href: "/terms" },
      ],
    },
    {
      label: "SERVICES",
      href: "/services",
      children: [
        { label: "Services Grid", href: "/services" },
        ...services.slice(0, 5).map((s) => ({
          label: s.title,
          href: `/services/${s.slug}`,
        })),
      ],
    },
    {
      label: "PROJECTS",
      href: "/portfolio",
      children: [
        { label: "Project Grid", href: "/portfolio" },
        ...projects.slice(0, 4).map((p) => ({
          label: p.title,
          href: `/portfolio/${p.slug}`,
        })),
      ],
    },
    {
      label: "NEWS",
      href: "/blog",
      children: [
        { label: "News Grid", href: "/blog" },
        ...posts.slice(0, 4).map((b) => ({
          label: b.title,
          href: `/blog/${b.slug}`,
        })),
      ],
    },
  ];

  const searchEntries: SearchEntry[] = React.useMemo(
    () => [
      ...services.map((s) => ({
        title: s.title,
        category: "Service",
        href: `/services/${s.slug}`,
      })),
      ...projects.map((p) => ({
        title: p.title,
        category: "Portfolio",
        href: `/portfolio/${p.slug}`,
      })),
      ...posts.map((b) => ({
        title: b.title,
        category: "Blog",
        href: `/blog/${b.slug}`,
      })),
      { title: "About Our Agency", category: "Page", href: "/about" },
      { title: "Careers & Open Roles", category: "Page", href: "/careers" },
      { title: "Frequently Asked Questions", category: "Page", href: "/faq" },
      { title: "Contact & Get a Quote", category: "Page", href: "/contact" },
    ],
    [services, projects, posts]
  );

  const filteredSearch = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return searchEntries.slice(0, 6);
    return searchEntries
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [searchEntries, searchQuery]);

  const renderDesktopNav = (sticky: boolean) => (
    <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <div key={item.label} className="group relative py-3">
            <Link
              href={item.href}
              className={cn(
                "inline-flex items-center gap-1.5 font-heading text-[14px] font-semibold tracking-[0.06em] uppercase transition-colors",
                sticky
                  ? "text-[var(--webtec-heading)] hover:text-[var(--webtec-accent)]"
                  : "text-white/95 hover:text-[var(--webtec-accent)]",
                isActive && "text-[var(--webtec-accent)]"
              )}
            >
              <span>{item.label}</span>
              {item.children && (
                <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:rotate-180" />
              )}
            </Link>

            {item.children && (
              <div className="pointer-events-none invisible absolute left-0 top-full z-50 min-w-[230px] translate-y-2 rounded-lg border border-border bg-white py-2 opacity-0 shadow-xl transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:bg-[#161524] dark:border-white/10">
                {item.children.map((sub) => (
                  <Link
                    key={sub.href + sub.label}
                    href={sub.href}
                    className="flex items-center justify-between border-b border-black/5 px-5 py-2.5 text-[14px] font-medium text-[#24201F] transition-colors last:border-b-0 hover:bg-[#ff3838]/5 hover:text-[var(--webtec-accent)] dark:border-white/5 dark:text-slate-200"
                  >
                    <span className="truncate pr-2">{sub.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Main Overlay Header */}
      <header className="absolute left-0 top-0 z-40 w-full border-b border-white/10">
        <div className="mx-auto flex max-w-[1630px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0" aria-label={siteName}>
            <NexoraLogo variant="public" lightText />
          </Link>

          {renderDesktopNav(false)}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search website"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Search className="h-5 w-5" />
            </button>

            <ThemeToggle variant="public" className="text-white border-white/25" />

            <Link
              href="/login"
              className="hidden xl:inline-flex items-center gap-1 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/90 transition-colors hover:border-white hover:bg-white/10"
            >
              <span>CRM Portal</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <div className="hidden sm:block">
              <WebtecButton href="/contact">GET IN TOUCH</WebtecButton>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open mobile menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sticky Header on Scroll (Webtec .sticky-header) */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-300 dark:bg-[#0e0e16]/95 dark:border-b dark:border-white/10",
          isSticky
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="shrink-0">
            <NexoraLogo variant="public" />
          </Link>

          {renderDesktopNav(true)}

          <div className="flex items-center gap-3">
            <ThemeToggle variant="dashboard" />
            <a
              href={`tel:${phone.replace(/[^+\d]/g, "")}`}
              className="hidden md:flex items-center gap-3 group"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--webtec-accent)] text-white shadow-md transition-transform group-hover:scale-105">
                <Phone className="h-4 w-4" />
              </span>
              <span className="leading-tight">
                <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Call Anytime
                </span>
                <span className="block font-heading text-sm font-bold text-[var(--webtec-heading)]">
                  {phone}
                </span>
              </span>
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open mobile menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-In Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[310px] max-w-full flex-col bg-[#222222] text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <NexoraLogo variant="public" lightText />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close mobile menu"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[var(--webtec-accent)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {navItems.map((item) => {
                const expanded = openMobileGroup === item.label;
                return (
                  <div key={item.label} className="border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <Link
                        href={item.href}
                        className="flex-1 px-5 py-3.5 font-heading text-sm font-semibold tracking-wider uppercase text-white"
                      >
                        {item.label}
                      </Link>
                      {item.children && (
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMobileGroup(expanded ? null : item.label)
                          }
                          aria-label={`Toggle ${item.label} submenu`}
                          className="flex h-11 w-11 items-center justify-center border-l border-white/10 text-white/80 cursor-pointer"
                        >
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              expanded && "rotate-180"
                            )}
                          />
                        </button>
                      )}
                    </div>
                    {item.children && expanded && (
                      <div className="bg-black/25 py-1">
                        {item.children.map((sub) => (
                          <Link
                            key={sub.href + sub.label}
                            href={sub.href}
                            className="block px-7 py-2 text-sm text-white/80 hover:text-[var(--webtec-accent)]"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 border-t border-white/10 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/60">
                  Theme
                </span>
                <ThemeToggle variant="public" className="text-white border-white/25" />
              </div>
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10"
              >
                CRM & Admin Login
              </Link>
              <WebtecButton href="/contact" className="w-full justify-center">
                GET IN TOUCH
              </WebtecButton>
            </div>
          </aside>
        </div>
      )}

      {/* Search Overlay Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/75 p-4 pt-24 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex flex-1 items-center gap-3">
                <Search className="h-5 w-5 text-[var(--webtec-accent)]" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services, projects, blog articles, FAQs..."
                  className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 max-h-80 space-y-1 overflow-y-auto">
              {filteredSearch.length > 0 ? (
                filteredSearch.map((item) => (
                  <Link
                    key={item.href + item.title}
                    href={item.href}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <span className="font-medium text-foreground">{item.title}</span>
                    <span className="rounded-full bg-[var(--webtec-accent)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--webtec-accent)]">
                      {item.category}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No matching pages or articles found.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
