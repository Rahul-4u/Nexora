"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Contact2,
  DollarSign,
  Handshake,
  Percent,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardStats {
  kpis: {
    totalLeads: number;
    newLeads: number;
    qualifiedLeads: number;
    totalContacts: number;
    totalCompanies: number;
    activeDeals: number;
    pipelineValue: number;
    wonRevenue: number;
    conversionRate: number;
  };
  pipelineChart: Array<{ stage: string; count: number; value: number; color: string }>;
  leadSourceChart: Array<{ name: string; value: number; color: string }>;
  revenueChart: Array<{ month: string; revenue: number }>;
  recentLeads: Array<{
    id: string;
    name: string;
    email: string;
    companyName: string | null;
    status: string;
    score: number;
    createdAt: string;
    source: { name: string } | null;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    subject: string;
    createdAt: string;
    user: { name: string } | null;
  }>;
  upcomingFollowUps: Array<{
    id: string;
    name: string;
    companyName: string | null;
    followUpDate: string;
    status: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    dueDate: string | null;
    assignee: { name: string } | null;
  }>;
  recentDeals: Array<{
    id: string;
    title: string;
    amount: string | number;
    status: string;
    stage: { name: string; color: string };
    company: { name: string } | null;
  }>;
  teamPerformance: Array<{
    name: string;
    leadsCount: number;
    dealsWon: number;
    wonAmount: number;
  }>;
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed to load dashboard metrics");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="nexora-glass-card p-8 text-center">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Database Connection Needed
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect PostgreSQL in <code className="text-primary">.env</code> and run{" "}
          <code>npx prisma migrate dev && npx prisma db seed</code> to load live
          dashboard metrics.
        </p>
      </div>
    );
  }

  const kpiCards = [
    { label: "Total Leads", value: data.kpis.totalLeads, icon: Users, href: "/leads" },
    { label: "New Leads (7d)", value: `+${data.kpis.newLeads}`, icon: UserPlus, href: "/leads" },
    { label: "Qualified Leads", value: data.kpis.qualifiedLeads, icon: Sparkles, href: "/leads" },
    { label: "Total Contacts", value: data.kpis.totalContacts, icon: Contact2, href: "/contacts" },
    { label: "Total Companies", value: data.kpis.totalCompanies, icon: Building2, href: "/companies" },
    { label: "Active Deals", value: data.kpis.activeDeals, icon: Handshake, href: "/deals" },
    { label: "Pipeline Value", value: formatCurrency(data.kpis.pipelineValue), icon: TrendingUp, href: "/deals" },
    { label: "Won Revenue", value: formatCurrency(data.kpis.wonRevenue), icon: DollarSign, href: "/finance" },
    { label: "Conversion Rate", value: `${data.kpis.conversionRate}%`, icon: Percent, href: "/reports" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Executive CRM &amp; Agency Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live multi-tenant telemetry from your PostgreSQL workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90"
          >
            <span>Manage Leads</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/deals"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent"
          >
            <span>Sales Pipeline</span>
          </Link>
        </div>
      </div>

      {/* 9 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {kpiCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="nexora-glass-card group p-4 transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {card.label}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <card.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 font-heading text-2xl font-bold text-foreground">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sales Pipeline Chart */}
        <div className="nexora-glass-card p-6 lg:col-span-5">
          <h2 className="font-heading text-base font-bold text-foreground">
            Sales Pipeline By Stage
          </h2>
          <p className="text-xs text-muted-foreground">
            Deal volume across active stages
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.pipelineChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "currentColor" }} />
                <YAxis tick={{ fontSize: 11, fill: "currentColor" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    color: "var(--popover-foreground)",
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {data.pipelineChart.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color || "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="nexora-glass-card p-6 lg:col-span-4">
          <h2 className="font-heading text-base font-bold text-foreground">
            Revenue Trend
          </h2>
          <p className="text-xs text-muted-foreground">
            Closed-won deals &amp; paid invoices
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueChart.length ? data.revenueChart : [{ month: "Current", revenue: data.kpis.wonRevenue }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "currentColor" }} />
                <YAxis tick={{ fontSize: 11, fill: "currentColor" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    color: "var(--popover-foreground)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Donut */}
        <div className="nexora-glass-card p-6 lg:col-span-3">
          <h2 className="font-heading text-base font-bold text-foreground">
            Lead Sources
          </h2>
          <p className="text-xs text-muted-foreground">Acquisition channels</p>
          <div className="mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.leadSourceChart}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={72}
                  paddingAngle={3}
                >
                  {data.leadSourceChart.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color || "#3b82f6"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    color: "var(--popover-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5">
            {data.leadSourceChart.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.name}
                </span>
                <span className="font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Operational Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Recent Leads */}
        <div className="nexora-glass-card p-6 lg:col-span-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-foreground">
              Recent Leads
            </h2>
            <Link href="/leads" className="text-xs font-semibold text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3 transition hover:border-primary/40"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {lead.companyName || lead.email} &bull; {lead.source?.name || "Direct"}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{lead.status}</Badge>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Score {lead.score}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Deals */}
        <div className="nexora-glass-card p-6 lg:col-span-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-foreground">
              Recent Deals
            </h2>
            <Link href="/deals" className="text-xs font-semibold text-primary hover:underline">
              Pipeline Board
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentDeals.map((deal) => (
              <div
                key={deal.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{deal.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {deal.company?.name || "Direct Client"} &bull; {deal.stage.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-sm font-bold text-foreground">
                    {formatCurrency(deal.amount)}
                  </p>
                  <Badge variant={deal.status === "WON" ? "success" : "secondary"}>
                    {deal.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="nexora-glass-card p-6 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-foreground">
              Recent Activities
            </h2>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4 space-y-3">
            {data.recentActivities.map((act) => (
              <div key={act.id} className="border-l-2 border-primary/50 pl-3">
                <p className="text-xs font-semibold text-foreground">{act.subject}</p>
                <p className="text-[11px] text-muted-foreground">
                  {act.type} &bull; {act.user?.name || "System"} &bull;{" "}
                  {formatDate(act.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Follow-Ups & Tasks */}
        <div className="nexora-glass-card p-6 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-foreground">
              Tasks &amp; Follow-Ups
            </h2>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4 space-y-2.5">
            {data.tasks.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs"
              >
                <span className="truncate font-medium text-foreground pr-2">
                  {t.title}
                </span>
                <Badge variant="outline">{t.priority}</Badge>
              </div>
            ))}
            {data.upcomingFollowUps.slice(0, 2).map((fu) => (
              <Link
                key={fu.id}
                href={`/leads/${fu.id}`}
                className="block rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs"
              >
                <span className="font-semibold text-foreground">
                  Follow up: {fu.name}
                </span>
                <span className="ml-2 text-muted-foreground">
                  ({formatDate(fu.followUpDate)})
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Team Performance */}
        <div className="nexora-glass-card p-6 lg:col-span-4">
          <h2 className="font-heading text-base font-bold text-foreground">
            Team Performance
          </h2>
          <div className="mt-4 space-y-3">
            {data.teamPerformance.map((member) => (
              <div
                key={member.name}
                className="flex items-center justify-between rounded-xl bg-muted/30 px-3.5 py-2.5"
              >
                <div>
                  <p className="text-xs font-semibold text-foreground">{member.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {member.leadsCount} leads &bull; {member.dealsWon} won
                  </p>
                </div>
                <span className="font-heading text-xs font-bold text-emerald-500">
                  {formatCurrency(member.wonAmount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
