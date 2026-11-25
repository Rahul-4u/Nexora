import type { Metadata } from "next";
import { Clock, Mail, MapPin, PhoneCall } from "lucide-react";
import { getPublicSiteData } from "@/lib/services/public-cms";
import { PageTitleBanner } from "@/components/public/page-title-banner";
import { ContactForm } from "@/components/public/contact-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Connect with Nexora's digital agency team. Every inquiry routes directly into our CRM for rapid strategic follow-up.",
};

export default async function ContactPage() {
  const data = await getPublicSiteData();

  return (
    <>
      <PageTitleBanner
        title="Contact Us"
        breadcrumbs={[{ label: "Pages" }, { label: "Contact Us" }]}
      />

      {/* Webtec .contact-section-h2 */}
      <section className="bg-[var(--webtec-surface)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1290px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-12">
            {/* Left Form Column */}
            <div className="rounded-[28px] border border-[var(--webtec-border)] bg-[var(--webtec-surface-silver)] p-7 sm:p-10 lg:col-span-7">
              <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
                SEND US EMAIL
              </span>
              <h2 className="mt-2 font-heading text-3xl font-bold text-[var(--webtec-heading)] sm:text-4xl">
                Feel Free To Write
              </h2>
              <p className="mt-3 text-sm text-[var(--webtec-body)]">
                Tell us about your project scope, timeline, or CRM automation
                goals. Your inquiry automatically creates a tracked CRM lead.
              </p>

              <div className="mt-8">
                <ContactForm
                  showServiceSelect
                  services={data.services.map((s) => ({
                    title: s.title,
                    slug: s.slug,
                  }))}
                />
              </div>
            </div>

            {/* Right Info Column */}
            <div className="space-y-6 lg:col-span-5">
              <div>
                <span className="inline-block font-heading text-xs font-bold tracking-[0.2em] uppercase text-[var(--webtec-accent)]">
                  NEED ANY HELP?
                </span>
                <h2 className="mt-2 font-heading text-3xl font-bold text-[var(--webtec-heading)]">
                  Get In Touch With Us
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--webtec-body)]">
                  Visit our San Francisco studio or schedule a virtual discovery
                  session with our engineering and brand directors.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4 rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--webtec-accent)] text-white shadow">
                    <PhoneCall className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-bold text-[var(--webtec-heading)]">
                      Have Any Question?
                    </h3>
                    <a
                      href={`tel:${data.phone.replace(/[^+\d]/g, "")}`}
                      className="mt-1 block text-sm font-semibold text-[var(--webtec-body)] hover:text-[var(--webtec-accent)]"
                    >
                      {data.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--webtec-accent)] text-white shadow">
                    <Mail className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-bold text-[var(--webtec-heading)]">
                      Write Email
                    </h3>
                    <a
                      href={`mailto:${data.email}`}
                      className="mt-1 block text-sm font-semibold text-[var(--webtec-body)] hover:text-[var(--webtec-accent)]"
                    >
                      {data.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--webtec-accent)] text-white shadow">
                    <MapPin className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-bold text-[var(--webtec-heading)]">
                      Visit Anytime
                    </h3>
                    <p className="mt-1 text-sm text-[var(--webtec-body)]">
                      {data.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-[var(--webtec-border)] bg-[var(--webtec-surface-alt)] p-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--webtec-navy)] text-white shadow">
                    <Clock className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-bold text-[var(--webtec-heading)]">
                      Studio Hours
                    </h3>
                    <p className="mt-1 text-sm text-[var(--webtec-body)]">
                      Mon – Fri: 9:00 AM – 6:30 PM PST
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width Map Section */}
      <section className="px-3 pb-12 sm:px-4">
        <div className="mx-auto max-w-[1860px] overflow-hidden rounded-[28px] border border-[var(--webtec-border)]">
          <iframe
            title="Nexora Studio Location"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-122.4105%2C37.7850%2C-122.3955%2C37.7950&layer=mapnik&marker=37.7900%2C-122.4030"
            className="h-[380px] w-full border-0 grayscale contrast-110"
            loading="lazy"
          />
        </div>
      </section>
    </>
  );
}
