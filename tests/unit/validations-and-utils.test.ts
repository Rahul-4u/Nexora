import { describe, expect, it } from "vitest";
import {
  contactFormSchema,
  dealSchema,
  leadSchema,
} from "@/lib/validations/schemas";
import { invoiceSchema, jobApplicationSchema } from "@/lib/validations/modules";
import { calculateReadingTime, formatCurrency, slugify } from "@/lib/utils";
import { checkRateLimit } from "@/lib/utilities/rate-limit";

describe("Validations & Utilities", () => {
  it("validates public contact form submissions", () => {
    const valid = contactFormSchema.safeParse({
      name: "Jordan Lee",
      email: "jordan@company.io",
      phone: "+1 415 555 0100",
      subject: "New SaaS Platform",
      service: "App Agency",
      message: "We are looking to rebuild our web platform and CRM integration.",
    });
    expect(valid.success).toBe(true);

    const invalid = contactFormSchema.safeParse({
      name: "J",
      email: "bad-email",
      subject: "Hi",
      message: "short",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates leads, deals, invoices, and job applications", () => {
    expect(
      leadSchema.safeParse({
        name: "BrightLabs",
        email: "lead@brightlabs.io",
        status: "QUALIFIED",
        score: 88,
      }).success
    ).toBe(true);

    expect(
      dealSchema.safeParse({
        title: "Enterprise Retainer",
        amount: 35000,
        stageId: "stage-1",
      }).success
    ).toBe(true);

    expect(
      invoiceSchema.safeParse({
        dueDate: "2026-12-15",
        taxRate: 8,
        items: [{ description: "Sprint 1", quantity: 1, unitPrice: 5000 }],
      }).success
    ).toBe(true);

    expect(
      jobApplicationSchema.safeParse({
        jobListingId: "job-1",
        applicantName: "Maya Lin",
        email: "maya@dev.io",
      }).success
    ).toBe(true);
  });

  it("formats currency, slugs, reading time, and enforces rate limits", () => {
    expect(formatCurrency(12500)).toBe("$12,500");
    expect(slugify("Brand Identity & Strategy!")).toBe("brand-identity-strategy");
    expect(calculateReadingTime("word ".repeat(450))).toBe(3);

    const key = `test-rate-${Date.now()}`;
    expect(checkRateLimit(key, 2, 10_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 10_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 10_000).allowed).toBe(false);
  });
});
