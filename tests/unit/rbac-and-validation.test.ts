import { describe, expect, it } from "vitest";
import { hasAnyPermission, hasPermission, PERMISSIONS } from "@/lib/permissions/rbac";
import { contactFormSchema, leadSchema, registerSchema } from "@/lib/validations/schemas";
import { invoiceSchema } from "@/lib/validations/modules";
import type { SessionPayload } from "@/lib/auth/session";

const makeSession = (
  role: SessionPayload["role"],
  permissions: string[] = []
): SessionPayload => ({
  userId: "user-1",
  email: "test@nexora.agency",
  name: "Test User",
  organizationId: "org-1",
  organizationName: "Nexora",
  organizationSlug: "nexora",
  role,
  permissions,
});

describe("RBAC Permission Enforcement", () => {
  it("grants all permissions to SUPER_ADMIN and ORG_ADMIN", () => {
    const superAdmin = makeSession("SUPER_ADMIN");
    const orgAdmin = makeSession("ORG_ADMIN");

    expect(hasPermission(superAdmin, PERMISSIONS.FINANCE_WRITE)).toBe(true);
    expect(hasPermission(orgAdmin, PERMISSIONS.CMS_PUBLISH)).toBe(true);
    expect(hasPermission(orgAdmin, PERMISSIONS.SETTINGS_MANAGE)).toBe(true);
  });

  it("restricts SALES_REP from HR, Finance, and CMS publish", () => {
    const salesRep = makeSession("SALES_REP");

    expect(hasPermission(salesRep, PERMISSIONS.CRM_READ)).toBe(true);
    expect(hasPermission(salesRep, PERMISSIONS.CRM_WRITE)).toBe(true);
    expect(hasPermission(salesRep, PERMISSIONS.CRM_DELETE)).toBe(false);
    expect(hasPermission(salesRep, PERMISSIONS.HR_WRITE)).toBe(false);
    expect(hasPermission(salesRep, PERMISSIONS.FINANCE_WRITE)).toBe(false);
    expect(hasPermission(salesRep, PERMISSIONS.CMS_PUBLISH)).toBe(false);
  });

  it("allows HR_MANAGER recruitment and HR but denies CRM delete", () => {
    const hr = makeSession("HR_MANAGER");
    expect(hasPermission(hr, PERMISSIONS.RECRUITMENT_WRITE)).toBe(true);
    expect(hasPermission(hr, PERMISSIONS.HR_WRITE)).toBe(true);
    expect(hasAnyPermission(hr, [PERMISSIONS.CRM_DELETE, PERMISSIONS.FINANCE_WRITE])).toBe(false);
  });

  it("denies null sessions", () => {
    expect(hasPermission(null, PERMISSIONS.DASHBOARD_VIEW)).toBe(false);
  });
});

describe("Zod Validation Schemas", () => {
  it("validates public contact submissions", () => {
    const valid = contactFormSchema.safeParse({
      name: "Alice Johnson",
      email: "alice@company.com",
      phone: "+1 415 555 0100",
      subject: "Website Redesign",
      service: "UX / UI Design",
      message: "We need a full agency website redesign and CRM rollout.",
    });
    expect(valid.success).toBe(true);

    const invalid = contactFormSchema.safeParse({
      name: "A",
      email: "bad-email",
      subject: "Hi",
      message: "short",
    });
    expect(invalid.success).toBe(false);
  });

  it("enforces strong passwords on registration", () => {
    expect(
      registerSchema.safeParse({
        name: "Alex",
        email: "alex@nexora.agency",
        password: "weak",
      }).success
    ).toBe(false);

    expect(
      registerSchema.safeParse({
        name: "Alex",
        email: "alex@nexora.agency",
        password: "StrongPass1",
        organizationName: "Acme",
      }).success
    ).toBe(true);
  });

  it("validates lead scores within 0-100", () => {
    expect(
      leadSchema.safeParse({
        name: "Lead One",
        email: "lead@test.com",
        score: 120,
      }).success
    ).toBe(false);
  });

  it("requires at least one line item on invoices", () => {
    expect(
      invoiceSchema.safeParse({
        dueDate: "2026-12-31",
        items: [],
      }).success
    ).toBe(false);
  });
});
