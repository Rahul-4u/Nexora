import type { Metadata } from "next";
import { PageTitleBanner } from "@/components/public/page-title-banner";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Nexora privacy policy covering data collection, CRM processing, cookies, and security safeguards.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageTitleBanner
        title="Privacy Policy"
        breadcrumbs={[{ label: "Legal" }, { label: "Privacy Policy" }]}
      />
      <section className="bg-[var(--webtec-surface)] py-20">
        <div className="mx-auto max-w-[900px] space-y-8 px-4 sm:px-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-[var(--webtec-heading)]">
              1. Information We Collect
            </h2>
            <p className="mt-3 text-base leading-[1.85] text-[var(--webtec-body)]">
              When you submit a contact inquiry, newsletter request, or career
              application on Nexora, we collect your provided contact details,
              project context, and uploaded documents solely to respond to your
              request and deliver agency services.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-[var(--webtec-heading)]">
              2. Multi-Tenant Data Security &amp; Isolation
            </h2>
            <p className="mt-3 text-base leading-[1.85] text-[var(--webtec-body)]">
              All CRM, HR, finance, and CMS records inside Nexora are strictly
              scoped to their owning organization on the server. Authentication
              sessions use signed HTTP-only cookies and bcrypt password hashing.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-[var(--webtec-heading)]">
              3. Cookies &amp; Preferences
            </h2>
            <p className="mt-3 text-base leading-[1.85] text-[var(--webtec-body)]">
              We use essential session cookies for authenticated workspaces and
              local storage preferences to remember your light or dark theme
              selection across sessions.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-[var(--webtec-heading)]">
              4. Contact Regarding Privacy
            </h2>
            <p className="mt-3 text-base leading-[1.85] text-[var(--webtec-body)]">
              For data access, correction, or deletion requests, please email{" "}
              <span className="font-semibold text-[var(--webtec-accent)]">
                privacy@nexora.agency
              </span>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
