import type { Metadata } from "next";
import { PageTitleBanner } from "@/components/public/page-title-banner";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms of use and service conditions for the Nexora agency website and CRM platform.",
};

export default function TermsPage() {
  return (
    <>
      <PageTitleBanner
        title="Terms & Conditions"
        breadcrumbs={[{ label: "Legal" }, { label: "Terms & Conditions" }]}
      />
      <section className="bg-[var(--webtec-surface)] py-20">
        <div className="mx-auto max-w-[900px] space-y-8 px-4 sm:px-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-[var(--webtec-heading)]">
              1. Acceptance of Terms
            </h2>
            <p className="mt-3 text-base leading-[1.85] text-[var(--webtec-body)]">
              By accessing the Nexora agency website or utilizing the Nexora
              CRM, CMS, and operational workspace, you agree to comply with these
              Terms &amp; Conditions and applicable laws.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-[var(--webtec-heading)]">
              2. Agency Services &amp; Intellectual Property
            </h2>
            <p className="mt-3 text-base leading-[1.85] text-[var(--webtec-body)]">
              All bespoke software, brand deliverables, and creative assets
              produced under a client Statement of Work remain governed by the
              executed Master Services Agreement.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-[var(--webtec-heading)]">
              3. Acceptable Platform Use
            </h2>
            <p className="mt-3 text-base leading-[1.85] text-[var(--webtec-body)]">
              Authorized workspace users must safeguard login credentials, respect
              role-based access boundaries, and refrain from unauthorized automated
              scraping or security probing.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
