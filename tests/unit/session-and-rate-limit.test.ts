// @vitest-environment node
import { describe, expect, it } from "vitest";
import { signSessionToken, verifySessionToken } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { checkRateLimit } from "@/lib/utilities/rate-limit";

describe("Authentication Security & Rate Limiting", () => {
  it("hashes and verifies passwords with bcrypt", async () => {
    const hash = await hashPassword("Nexora@2026!");
    expect(hash).not.toBe("Nexora@2026!");
    expect(await verifyPassword("Nexora@2026!", hash)).toBe(true);
    expect(await verifyPassword("WrongPassword", hash)).toBe(false);
  });

  it("signs and verifies organization-scoped JWT session tokens", async () => {
    const token = await signSessionToken({
      userId: "u-1",
      email: "admin@nexora.agency",
      name: "Arlene McCoy",
      organizationId: "org-nexora",
      organizationName: "Nexora Digital Agency",
      organizationSlug: "nexora",
      role: "SUPER_ADMIN",
      permissions: ["crm:read", "crm:write"],
    });

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.organizationId).toBe("org-nexora");
    expect(decoded?.role).toBe("SUPER_ADMIN");
    expect(await verifySessionToken("tampered.token.value")).toBeNull();
  });

  it("enforces sliding-window rate limits per key", () => {
    const key = `test-rate-${Date.now()}`;
    expect(checkRateLimit(key, 2, 10_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 10_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 10_000).allowed).toBe(false);
  });
});
