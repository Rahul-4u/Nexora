"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Contact2,
  DollarSign,
  ExternalLink,
  FileSpreadsheet,
  FolderKanban,
  Globe,
  Handshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Search,
  Settings,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { SessionPayload } from "@/lib/auth/session";
import { hasPermission, PERMISSIONS, type PermissionKey } from "@/lib/permissions/rbac";
import { NexoraLogo } from "@/components/shared/nexora-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { cn, getInitials } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: PermissionKey;
  group: "Overview" | "CRM" | "Operations" | "Finance & Growth" | "System";
}

const ALL_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: PERMISSIONS.DASHBOARD_VIEW,
    group: "Overview",
  },
  {
    label: "CRM Overview",
    href: "/crm",
    icon: BarChart3,
    permission: PERMISSIONS.CRM_READ,
    group: "CRM",
  },
  {
    label: "Leads",
    href: "/leads",
    icon: UserPlus,
    permission: PERMISSIONS.CRM_READ,
    group: "CRM",
  },
  {
    label: "Deals Pipeline",
    href: "/deals",
    icon: Handshake,
    permission: PERMISSIONS.CRM_READ,
    group: "CRM",
  },
  {
    label: "Contacts",
    href: "/contacts",
    icon: Contact2,
    permission: PERMISSIONS.CRM_READ,
    group: "CRM",
  },
  {
    label: "Companies",
    href: "/companies",
    icon: Building2,
    permission: PERMISSIONS.CRM_READ,
    group: "CRM",
  },
  {
    label: "Activities",
    href: "/activities",
    icon: Activity,
    permission: PERMISSIONS.CRM_READ,
    group: "CRM",
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    permission: PERMISSIONS.DASHBOARD_VIEW,
    group: "Operations",
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: Calendar,
    permission: PERMISSIONS.DASHBOARD_VIEW,
    group: "Operations",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
    permission: PERMISSIONS.PROJECTS_READ,
    group: "Operations",
  },
  {
    label: "Employees",
    href: "/employees",
    icon: Users,
    permission: PERMISSIONS.HR_READ,
    group: "Operations",
  },
  {
    label: "HR & Leave",
    href: "/hr",
    icon: UserCheck,
    permission: PERMISSIONS.HR_READ,
    group: "Operations",
  },
  {
    label: "Recruitment",
    href: "/recruitment",
    icon: Briefcase,
    permission: PERMISSIONS.RECRUITMENT_READ,
    group: "Operations",
  },
  {
    label: "Finance",
    href: "/finance",
    icon: DollarSign,
    permission: PERMISSIONS.FINANCE_READ,
    group: "Finance & Growth",
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: FileSpreadsheet,
    permission: PERMISSIONS.FINANCE_READ,
    group: "Finance & Growth",
  },
  {
    label: "Expenses",
    href: "/expenses",
    icon: Receipt,
    permission: PERMISSIONS.FINANCE_READ,
    group: "Finance & Growth",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    permission: PERMISSIONS.REPORTS_READ,
    group: "Finance & Growth",
  },
  {
    label: "CMS & Media",
    href: "/cms",
    icon: Globe,
    permission: PERMISSIONS.CMS_READ,
    group: "System",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_MANAGE,
    group: "System",
  },
];

const TOP_PILLS = [
  { label: "Dashboard", href: "/dashboard", permission: PERMISSIONS.DASHBOARD_VIEW },
  { label: "Leads", href: "/leads", permission: PERMISSIONS.CRM_READ },
  { label: "Deals", href: "/deals", permission: PERMISSIONS.CRM_READ },
  { label: "Companies", href: "/companies", permission: PERMISSIONS.CRM_READ },
  { label: "Activities", href: "/activities", permission: PERMISSIONS.CRM_READ },
  { label: "Tasks", href: "/tasks", permission: PERMISSIONS.DASHBOARD_VIEW },
  { label: "Projects", href: "/projects", permission: PERMISSIONS.PROJECTS_READ },
  { label: "CMS", href: "/cms", permission: PERMISSIONS.CMS_READ },
];

interface DashboardShellProps {
  session: SessionPayload;
  unreadCount: number;
  children: React.ReactNode;
}

export function DashboardShell({
  session,
  unreadCount,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [globalSearch, setGlobalSearch] = React.useState("");

  const allowedItems = React.useMemo(
    () =>
      ALL_NAV_ITEMS.filter(
        (item) => !item.permission || hasPermission(session, item.permission)
      ),
    [session]
  );

  const allowedTopPills = React.useMemo(
    () =>
      TOP_PILLS.filter(
        (item) => !item.permission || hasPermission(session, item.permission)
      ),
    [session]
  );

  const searchResults = React.useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return [];
    return allowedItems.filter((item) =>
      item.label.toLowerCase().includes(q)
    );
  }, [allowedItems, globalSearch]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Subtle Ambient Midnight Glow in Dark Mode */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 hidden overflow-hidden dark:block"
      >
        <div className="absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-blue-600/12 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-[140px]" />
      </div>

      {/* Top Glass Header (Matching Nexora Dark CRM UI Reference) */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/dashboard" className="shrink-0">
              <NexoraLogo variant="dashboard" />
            </Link>

            {/* Top Module Nav Pills */}
            <nav
              aria-label="Quick module navigation"
              className="hidden xl:flex items-center gap-1 pl-4"
            >
              {allowedTopPills.map((pill) => {
                const active =
                  pill.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(pill.href);

                return (
                  <Link
                    key={pill.href}
                    href={pill.href}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {pill.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Search */}
            <div className="relative hidden md:block w-56 lg:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Jump to module..."
                className="h-9 w-full rounded-full border border-border bg-muted/60 pl-9 pr-4 text-xs text-foreground outline-none transition focus:border-primary focus:bg-card"
              />
              {searchResults.length > 0 && (
                <div className="absolute left-0 top-11 z-50 w-full rounded-xl border border-border bg-popover p-1.5 shadow-xl">
                  {searchResults.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setGlobalSearch("")}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-popover-foreground hover:bg-accent"
                    >
                      <item.icon className="h-3.5 w-3.5 text-primary" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/"
              target="_blank"
              title="Open Public Website"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              <span>Website</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <Link
              href="/activities"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <ThemeToggle variant="dashboard" />

            <div className="flex items-center gap-2.5 border-l border-border pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 font-heading text-xs font-bold text-primary">
                {getInitials(session.name)}
              </div>
              <div className="hidden lg:block leading-tight">
                <p className="text-xs font-semibold text-foreground">
                  {session.name}
                </p>
                <Badge variant="outline" className="mt-0.5 text-[10px] py-0 px-1.5">
                  {session.role.replace("_", " ")}
                </Badge>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex">
        {/* Desktop Sidebar / Icon Rail */}
        <aside
          className={cn(
            "sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col justify-between border-r border-border bg-card/60 backdrop-blur-md transition-all duration-200 lg:flex",
            collapsed ? "w-[74px]" : "w-60"
          )}
        >
          <div className="flex-1 overflow-y-auto px-2.5 py-4">
            <div className="mb-3 flex items-center justify-between px-2">
              {!collapsed && (
                <span className="truncate text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {session.organizationName}
                </span>
              )}
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="ml-auto flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {collapsed ? (
                  <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                  <ChevronLeft className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <nav className="space-y-1" aria-label="Dashboard sidebar">
              {allowedItems.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-border p-3 flex items-center justify-center">
            <ThemeToggle variant="pill" />
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative z-10 flex h-full w-72 flex-col bg-card p-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <NexoraLogo variant="dashboard" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
                {allowedItems.map((item) => {
                  const active =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Workspace Content */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
