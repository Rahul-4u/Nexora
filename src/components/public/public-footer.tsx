"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUp, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { NexoraLogo } from "@/components/shared/nexora-logo";

interface PublicFooterProps {
  siteName: string;
  phone: string;
  email: string;
  address: string;
  variant?: "home" | "inner";
}

export function PublicFooter({
  siteName,
  phone,
  email,
  address,
  variant = "inner",
}: PublicFooterProps) {
  const [newsletterEmail, setNewsletterEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter Subscriber",
          email: newsletterEmail.trim(),
          subject: "Newsletter Subscription",
          message: "Subscribed via website footer newsletter form.",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Please enter a valid email address.");
      } else {
        toast.success("Subscribed! Welcome to Nexora insights.");
        setNewsletterEmail("");
      }
    } catch {
      toast.error("Unable to subscribe right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quickLinks = [
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Team Member", href: "/team" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Latest News", href: "/blog" },
  ];

  const serviceLinks = [
    { label: "Meet Our Team", href: "/team" },
    { label: "What We Do", href: "/services" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Faqs", href: "/faq" },
  ];

  const socialItems = [
    { label: "X", href: "https://x.com", abbr: "𝕏" },
    { label: "Facebook", href: "https://facebook.com", abbr: "f" },
    { label: "LinkedIn", href: "https://linkedin.com", abbr: "in" },
    { label: "Instagram", href: "https://instagram.com", abbr: "ig" },
  ];

  return (
    <footer className="relative pb-5 px-3 sm:px-4">
      <div className="relative mx-auto max-w-[1860px] overflow-hidden rounded-[32px] lg:rounded-[50px] bg-[var(--webtec-footer)] text-white">
        {/* Subtle Crimson Bottom Radial Glow (Webtec footer aesthetic) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-0 h-[420px] w-[420px] rounded-full bg-[var(--webtec-accent)]/20 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-20 h-[340px] w-[340px] rounded-full bg-indigo-600/15 blur-[110px]"
        />

        <div className="relative z-10 mx-auto max-w-[1290px] px-6 pt-16 pb-10 sm:px-8 lg:pt-24">
          {variant === "home" ? (
            <>
              {/* Webtec Footer Style One: Top Logo + Newsletter Bar */}
              <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-12 lg:flex-row lg:items-center">
                <div>
                  <NexoraLogo variant="public" lightText />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                  <p className="max-w-[230px] font-heading text-xl font-semibold leading-snug text-white">
                    Get the latest inspiration &amp; insights
                  </p>
                  <form
                    onSubmit={handleSubscribe}
                    className="relative w-full sm:w-[340px]"
                  >
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Email Address"
                      className="h-[58px] w-full rounded-full bg-[#666666]/20 pl-7 pr-16 text-sm text-white placeholder:text-[#a0a0a0] outline-none ring-1 ring-white/10 transition focus:ring-[var(--webtec-accent)]"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      aria-label="Subscribe to newsletter"
                      className="absolute right-0 top-0 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[var(--webtec-accent)] text-white transition hover:bg-[var(--webtec-accent-hover)] cursor-pointer disabled:opacity-60"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Middle Row */}
              <div className="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-12">
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-3">
                    <a
                      href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                      className="block font-heading text-2xl font-bold text-white transition hover:text-[var(--webtec-accent)]"
                    >
                      {phone}
                    </a>
                    <a
                      href={`mailto:${email}`}
                      className="block text-base text-white/75 underline decoration-white/25 underline-offset-4 transition hover:text-[var(--webtec-accent)]"
                    >
                      {email}
                    </a>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    {socialItems.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={s.label}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-[#313131] bg-[#313131] text-sm font-bold text-white transition hover:border-[var(--webtec-accent)] hover:bg-[var(--webtec-accent)]"
                      >
                        {s.abbr}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <h3 className="mb-5 font-heading text-xl font-semibold text-white">
                    Quick Link
                  </h3>
                  <ul className="space-y-3">
                    {quickLinks.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="font-heading text-[15px] text-white/80 transition hover:text-[var(--webtec-accent)]"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:col-span-4">
                  <h3 className="mb-5 font-heading text-xl font-semibold text-white">
                    Our Services
                  </h3>
                  <ul className="space-y-3">
                    {serviceLinks.map((item) => (
                      <li key={item.href + item.label}>
                        <Link
                          href={item.href}
                          className="font-heading text-[15px] text-white/80 transition hover:text-[var(--webtec-accent)]"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            /* Webtec Footer Style Two: Inner Pages 4-Column Layout */
            <div className="grid gap-10 border-b border-white/10 pb-14 md:grid-cols-2 lg:grid-cols-12">
              <div className="lg:col-span-4 space-y-5">
                <NexoraLogo variant="public" lightText />
                <p className="text-sm leading-relaxed text-white/70">
                  Full-stack digital agency crafting brand systems, high-converting
                  web experiences, and unified CRM business platforms.
                </p>
                <form onSubmit={handleSubscribe} className="relative max-w-xs">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Email Address"
                    className="h-12 w-full rounded-full bg-white/10 pl-5 pr-14 text-sm text-white placeholder:text-white/50 outline-none focus:ring-1 focus:ring-[var(--webtec-accent)]"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    aria-label="Subscribe"
                    className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--webtec-accent)] text-white cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2">
                <h3 className="mb-5 font-heading text-lg font-semibold text-white">
                  Quick Link
                </h3>
                <ul className="space-y-3 text-sm text-white/75">
                  {quickLinks.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="hover:text-[var(--webtec-accent)]">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-3">
                <h3 className="mb-5 font-heading text-lg font-semibold text-white">
                  Company
                </h3>
                <ul className="space-y-3 text-sm text-white/75">
                  {serviceLinks.map((item) => (
                    <li key={item.href + item.label}>
                      <Link href={item.href} className="hover:text-[var(--webtec-accent)]">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/login" className="hover:text-[var(--webtec-accent)]">
                      Client &amp; Staff Portal
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-3 space-y-4">
                <h3 className="mb-5 font-heading text-lg font-semibold text-white">
                  Contact Info
                </h3>
                <div className="flex items-start gap-3 text-sm text-white/75">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--webtec-accent)]" />
                  <span>{address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/75">
                  <Phone className="h-4 w-4 shrink-0 text-[var(--webtec-accent)]" />
                  <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="hover:text-white">
                    {phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/75">
                  <Mail className="h-4 w-4 shrink-0 text-[var(--webtec-accent)]" />
                  <a href={`mailto:${email}`} className="hover:text-white">
                    {email}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Bar */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/70 sm:flex-row">
            <p>
              &copy; {new Date().getFullYear()} {siteName}. All Rights Reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy" className="hover:text-[var(--webtec-accent)]">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[var(--webtec-accent)]">
                Terms &amp; Conditions
              </Link>
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Scroll to top"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--webtec-accent)] text-white shadow-lg transition hover:-translate-y-0.5 cursor-pointer"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
