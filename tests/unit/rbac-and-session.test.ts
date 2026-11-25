// @vitest-environment node
import { describe, expect, it } from "vitest";
import { hasPermission, hasAnyPermission, PERMISSIONS } from "@/lib/permissions/rbac";
import { signSessionToken, verifySessionToken, type SessionPayload } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

function makeSession(overrides: Partial<SessionPayload> = {}): SessionPayload {
  return {
    userId: "user-1",
    email: "test@nexora.agency",
    name: "Test User",
    organizationId: "org-1",
    organizationName: "Nexora",
    organizationSlug: "nexora",
    role: "SALES_REP",
    permissions: [],
    ...overrides,
  };
}

describe("RBAC & Security", () => {
  it("grants full permissions to SUPER_ADMIN and ORG_ADMIN", () => {
    const admin = makeSession({ role: "ORG_ADMIN" });
    expect(hasPermission(admin, PERMISSIONS.CRM_DELETE)).toBe(true);
    expect(hasPermission(admin, PERMISSIONS.FINANCE_WRITE)).toBe(true);
    expect(hasPermission(admin, PERMISSIONS.SETTINGS_MANAGE)).toBe(true);
  });

  it("restricts SALES_REP from finance and HR write actions", () => {
    const rep = makeSession({ role: "SALES_REP" });
    expect(hasPermission(rep, PERMISSIONS.CRM_READ)).toBe(true);
    expect(hasPermission(rep, PERMISSIONS.CRM_WRITE)).toBe(true);
    expect(hasPermission(rep, PERMISSIONS.CRM_DELETE)).toBe(false);
    expect(hasPermission(rep, PERMISSIONS.FINANCE_WRITE)).toBe(false);
    expect(hasPermission(rep, PERMISSIONS.HR_WRITE)).toBe(false);
  });

  it("checks multi-permission arrays accurately", () => {
    const hr = makeSession({ role: "HR_MANAGER" });
    expect(
      hasAnyPermission(hr, [PERMISSIONS.FINANCE_WRITE, PERMISSIONS.RECRUITMENT_WRITE])
    ).toBe(true);
    expect(
      hasAnyPermission(hr, [PERMISSIONS.FINANCE_WRITE, PERMISSIONS.CMS_PUBLISH])
    ).toBe(false);
  });

  it("signs and verifies JWT session tokens and rejects tampered tokens", async () => {
    const payload = makeSession({ role: "FINANCE_MANAGER" });
    const token = await signSessionToken(payload);
    const verified = await verifySessionToken(token);
    expect(verified?.userId).toBe("user-1");
    expect(verified?.organizationId).toBe("org-1");
    expect(verified?.role).toBe("FINANCE_MANAGER");

    const tampered = await verifySessionToken(token.slice(0, -4) + "abcd");
    expect(tampered).toBeNull();
  });

  it("hashes and verifies passwords with bcrypt", async () => {
    const hash = await hashPassword("Nexora@2026!");
    expect(hash).not.toBe("Nexora@2026!");
    expect(await verifyPassword("Nexora@2026!", hash)).toBe(true);
    expect(await verifyPassword("WrongPass!", hash)).toBe(false);
  });
});
