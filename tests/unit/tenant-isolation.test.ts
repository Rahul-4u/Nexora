import { describe, expect, it, vi } from "vitest";
import { PERMISSIONS } from "@/lib/permissions/rbac";

const mockGetServerSession = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getServerSession: () => mockGetServerSession(),
}));

import { requireApiAuth } from "@/lib/auth/guard";

describe("Server-side API Tenant & Permission Guard", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetServerSession.mockResolvedValueOnce(null);
    const res = await requireApiAuth(PERMISSIONS.CRM_READ);
    expect(res.error?.status).toBe(401);
  });

  it("returns 403 when user lacks required permission", async () => {
    mockGetServerSession.mockResolvedValueOnce({
      userId: "u1",
      email: "client@acme.io",
      name: "Client",
      organizationId: "org-1",
      organizationName: "Org 1",
      organizationSlug: "org-1",
      role: "CLIENT",
      permissions: [],
    });
    const res = await requireApiAuth(PERMISSIONS.CRM_WRITE);
    expect(res.error?.status).toBe(403);
  });

  it("returns scoped session with organizationId when authorized", async () => {
    mockGetServerSession.mockResolvedValueOnce({
      userId: "u2",
      email: "sales@nexora.agency",
      name: "Sales Mgr",
      organizationId: "org-nexora",
      organizationName: "Nexora",
      organizationSlug: "nexora",
      role: "SALES_MANAGER",
      permissions: [],
    });
    const res = await requireApiAuth(PERMISSIONS.CRM_WRITE);
    expect(res.error).toBeUndefined();
    expect(res.session?.organizationId).toBe("org-nexora");
  });
});
