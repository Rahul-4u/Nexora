import type { RoleCode } from "@prisma/client";
import type { SessionPayload } from "@/lib/auth/session";

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",
  CRM_READ: "crm:read",
  CRM_WRITE: "crm:write",
  CRM_DELETE: "crm:delete",
  PROJECTS_READ: "projects:read",
  PROJECTS_WRITE: "projects:write",
  HR_READ: "hr:read",
  HR_WRITE: "hr:write",
  RECRUITMENT_READ: "recruitment:read",
  RECRUITMENT_WRITE: "recruitment:write",
  FINANCE_READ: "finance:read",
  FINANCE_WRITE: "finance:write",
  CMS_READ: "cms:read",
  CMS_WRITE: "cms:write",
  CMS_PUBLISH: "cms:publish",
  REPORTS_READ: "reports:read",
  SETTINGS_MANAGE: "settings:manage",
  USERS_MANAGE: "users:manage",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionKey[] = Object.values(PERMISSIONS);

export const ROLE_DEFAULT_PERMISSIONS: Record<RoleCode, PermissionKey[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  ORG_ADMIN: ALL_PERMISSIONS,
  SALES_MANAGER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CRM_READ,
    PERMISSIONS.CRM_WRITE,
    PERMISSIONS.CRM_DELETE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.PROJECTS_READ,
  ],
  SALES_REP: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CRM_READ,
    PERMISSIONS.CRM_WRITE,
  ],
  MARKETING: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CRM_READ,
    PERMISSIONS.CMS_READ,
    PERMISSIONS.CMS_WRITE,
    PERMISSIONS.CMS_PUBLISH,
    PERMISSIONS.REPORTS_READ,
  ],
  HR_MANAGER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.HR_READ,
    PERMISSIONS.HR_WRITE,
    PERMISSIONS.RECRUITMENT_READ,
    PERMISSIONS.RECRUITMENT_WRITE,
  ],
  FINANCE_MANAGER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.FINANCE_WRITE,
    PERMISSIONS.CRM_READ,
    PERMISSIONS.REPORTS_READ,
  ],
  PROJECT_MANAGER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.PROJECTS_WRITE,
    PERMISSIONS.CRM_READ,
    PERMISSIONS.HR_READ,
  ],
  EMPLOYEE: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.HR_READ,
  ],
  CLIENT: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.PROJECTS_READ, PERMISSIONS.FINANCE_READ],
};

export function hasPermission(
  session: SessionPayload | null,
  permission: PermissionKey
): boolean {
  if (!session) return false;
  if (session.role === "SUPER_ADMIN" || session.role === "ORG_ADMIN") {
    return true;
  }
  if (session.permissions.includes(permission)) {
    return true;
  }
  return ROLE_DEFAULT_PERMISSIONS[session.role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  session: SessionPayload | null,
  permissions: PermissionKey[]
): boolean {
  return permissions.some((p) => hasPermission(session, p));
}
