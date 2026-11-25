"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { formatDate } from "@/lib/utils";

interface SettingsResponse {
  organization: {
    id: string;
    name: string;
    domain: string | null;
    industry: string | null;
    timezone: string;
    currency: string;
  };
  memberships: Array<{
    id: string;
    user: { id: string; name: string; email: string; lastLoginAt: string | null };
    role: { id: string; code: string; name: string };
  }>;
  roles: Array<{ id: string; code: string; name: string }>;
  auditLogs: Array<{
    id: string;
    action: string;
    entity: string;
    createdAt: string;
    user: { name: string; email: string } | null;
  }>;
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery<SettingsResponse>({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const [orgName, setOrgName] = React.useState("");
  const [domain, setDomain] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");

  React.useEffect(() => {
    if (data?.organization) {
      setOrgName(data.organization.name);
      setDomain(data.organization.domain || "");
      setCurrency(data.organization.currency || "USD");
    }
  }, [data]);

  const saveOrg = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName, domain, currency }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
    },
    onSuccess: () => {
      toast.success("Organization settings saved");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const changeRole = useMutation({
    mutationFn: async ({ membershipId, roleId }: { membershipId: string; roleId: string }) => {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId, roleId }),
      });
    },
    onSuccess: () => {
      toast.success("Member role updated");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Workspace Settings &amp; Security
          </h1>
          <p className="text-sm text-muted-foreground">
            Organization configuration, RBAC role assignments, appearance, and
            audit trails.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Theme:</span>
          <ThemeToggle variant="dashboard" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="nexora-glass-card p-6 lg:col-span-5 space-y-4">
          <h2 className="font-heading text-base font-bold text-foreground">
            Organization Profile
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveOrg.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label>Organization Name</Label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Domain</Label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Default Currency</Label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={saveOrg.isPending}>
              Save Organization
            </Button>
          </form>
        </div>

        <div className="nexora-glass-card p-6 lg:col-span-7 space-y-4">
          <h2 className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
            <Users className="h-4 w-4 text-primary" />
            Team Access &amp; RBAC Roles
          </h2>
          <div className="divide-y divide-border">
            {data?.memberships.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-foreground">{m.user.name}</p>
                  <p className="text-xs text-muted-foreground">{m.user.email}</p>
                </div>
                <select
                  aria-label={`Role for ${m.user.name}`}
                  value={m.role.id}
                  onChange={(e) =>
                    changeRole.mutate({ membershipId: m.id, roleId: e.target.value })
                  }
                  className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                >
                  {data.roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="nexora-glass-card p-6">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-foreground mb-4">
          <Shield className="h-4 w-4 text-primary" />
          Security &amp; Audit Logs
        </h2>
        <div className="space-y-2.5 max-h-80 overflow-y-auto">
          {data?.auditLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/30 px-4 py-2.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline">{log.action}</Badge>
                <span className="font-semibold text-foreground">{log.entity}</span>
                <span className="text-muted-foreground">
                  by {log.user?.email || "Public / System"}
                </span>
              </div>
              <span className="text-muted-foreground">
                {formatDate(log.createdAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
