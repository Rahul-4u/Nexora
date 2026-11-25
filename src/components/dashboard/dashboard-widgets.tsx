import * as React from "react";
import { Badge } from "@/components/ui/badge";

export function DashboardPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
}) {
  return (
    <div className="nexora-glass-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {icon && <span className="text-primary">{icon}</span>}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <p className="font-heading text-2xl font-bold text-foreground">{value}</p>
        {trend && <Badge variant="success">{trend}</Badge>}
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const variant =
    status === "PAID" ||
    status === "PUBLISHED" ||
    status === "APPROVED" ||
    status === "ACTIVE" ||
    status === "COMPLETED" ||
    status === "PRESENT" ||
    status === "HIRED"
      ? "success"
      : status === "REJECTED" ||
          status === "OVERDUE" ||
          status === "CANCELLED" ||
          status === "TERMINATED"
        ? "destructive"
        : status === "PENDING" || status === "ON_HOLD" || status === "DRAFT"
          ? "warning"
          : "outline";

  return <Badge variant={variant}>{status.replace(/_/g, " ")}</Badge>;
}
