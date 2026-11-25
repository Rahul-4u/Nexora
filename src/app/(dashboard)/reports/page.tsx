"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const { data } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const exportSummary = () => {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Leads", data.kpis.totalLeads],
      ["Qualified Leads", data.kpis.qualifiedLeads],
      ["Conversion Rate", `${data.kpis.conversionRate}%`],
      ["Active Deals", data.kpis.activeDeals],
      ["Pipeline Value", data.kpis.pipelineValue],
      ["Won Revenue", data.kpis.wonRevenue],
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexora-executive-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Executive Reports &amp; Attribution
          </h1>
          <p className="text-sm text-muted-foreground">
            Pipeline velocity, team performance, and channel attribution.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={exportSummary}>
          <Download className="h-4 w-4" />
          Export Report CSV
        </Button>
      </div>

      {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="nexora-glass-card p-6">
            <h2 className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
              <BarChart3 className="h-4 w-4 text-primary" />
              Team Won Revenue
            </h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.teamPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "currentColor" }} />
                  <YAxis tick={{ fontSize: 11, fill: "currentColor" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: "12px",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Bar dataKey="wonAmount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="nexora-glass-card p-6 space-y-4">
            <h2 className="font-heading text-base font-bold text-foreground">
              Pipeline Conversion Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between rounded-xl bg-muted/40 p-3.5">
                <span className="text-muted-foreground">Total Pipeline Value</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(data.kpis.pipelineValue)}
                </span>
              </div>
              <div className="flex justify-between rounded-xl bg-muted/40 p-3.5">
                <span className="text-muted-foreground">Closed-Won Revenue</span>
                <span className="font-bold text-emerald-500">
                  {formatCurrency(data.kpis.wonRevenue)}
                </span>
              </div>
              <div className="flex justify-between rounded-xl bg-muted/40 p-3.5">
                <span className="text-muted-foreground">Lead-to-Deal Conversion</span>
                <span className="font-bold text-primary">
                  {data.kpis.conversionRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
