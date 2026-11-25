import type { Metadata } from "next";
import { PageBanner } from "@/components/public/page-banner";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms of service governing the Nexora website and integrated CRM platform.",
};

export default function TermsPage() {
  return (
    <div>
      <PageBanner
        title="Terms & Conditions"
        eyebrow="LEGAL"
        breadcrumbs={[{ label: "Terms & Conditions" }]}
      />

      <section className="bg-[var(--webtec-surface)] py-20">
        <div className="mx-auto max-w-4xl space-y-6 px-4 text-base leading-relaxed text-[var(--webtec-body)] sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-[var(--webtec-heading)]">
            1. Platform Usage
          </h2>
          <p>
            By accessing the Nexora public website or authenticated CRM
            workspace, you agree to use all services solely for lawful business
            operations and respect tenant boundaries and intellectual property.
          </p>
          <h2 className="font-heading text-2xl font-bold text-[var(--webtec-heading)]">
            2. Service Deliverables &amp; Invoicing
          </h2>
          <p>
            Agency engagements, project milestones, and payment schedules are
            governed by each approved Statement of Work and issued invoice.
          </p>
          <h2 className="font-heading text-2xl font-bold text-[var(--webtec-heading)]">
            3. Governing Law
          </h2>
          <p>
            These terms are governed by applicable commercial law in San
            Francisco, California.
          </p>
        </div>
      </section>
    </div>
  );
}
