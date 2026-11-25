import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";

export async function GET() {
  const { session, error } = await requireApiAuth(PERMISSIONS.DASHBOARD_VIEW);
  if (error) return error;

  const orgId = session.organizationId;

  const [
    leads,
    totalContacts,
    totalCompanies,
    deals,
    stages,
    recentActivities,
    tasks,
    invoices,
    expenses,
    members,
  ] = await Promise.all([
    prisma.lead.findMany({
      where: { organizationId: orgId, deletedAt: null },
      include: { source: true, owner: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contact.count({ where: { organizationId: orgId, deletedAt: null } }),
    prisma.company.count({ where: { organizationId: orgId, deletedAt: null } }),
    prisma.deal.findMany({
      where: { organizationId: orgId, deletedAt: null },
      include: {
        stage: true,
        company: { select: { name: true } },
        owner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.pipelineStage.findMany({
      where: { pipeline: { organizationId: orgId, isDefault: true } },
      orderBy: { position: "asc" },
    }),
    prisma.activity.findMany({
      where: { organizationId: orgId },
      include: {
        user: { select: { name: true } },
        lead: { select: { name: true } },
        deal: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.task.findMany({
      where: { organizationId: orgId },
      include: { assignee: { select: { name: true } } },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      take: 8,
    }),
    prisma.invoice.findMany({
      where: { organizationId: orgId },
      select: { total: true, amountPaid: true, status: true, issueDate: true },
    }),
    prisma.expense.findMany({
      where: { organizationId: orgId },
      select: { amount: true, expenseDate: true },
    }),
    prisma.membership.findMany({
      where: { organizationId: orgId, status: "ACTIVE" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        role: { select: { name: true, code: true } },
      },
    }),
  ]);

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "NEW").length;
  const qualifiedLeads = leads.filter(
    (l) => l.status === "QUALIFIED" || l.status === "PROPOSAL"
  ).length;
  const convertedLeads = leads.filter((l) => l.status === "CONVERTED").length;
  const conversionRate =
    totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const openDeals = deals.filter((d) => d.status === "OPEN");
  const wonDeals = deals.filter((d) => d.status === "WON");
  const pipelineValue = openDeals.reduce((sum, d) => sum + Number(d.amount), 0);
  const wonRevenue = wonDeals.reduce((sum, d) => sum + Number(d.amount), 0);

  // Sales pipeline chart by stage
  const pipelineChart = stages.map((st) => {
    const stageDeals = deals.filter((d) => d.stageId === st.id);
    return {
      stage: st.name,
      count: stageDeals.length,
      value: stageDeals.reduce((s, d) => s + Number(d.amount), 0),
      color: st.color,
    };
  });

  // Lead source breakdown
  const sourceCounts = new Map<string, { name: string; count: number; color: string }>();
  for (const lead of leads) {
    const name = lead.source?.name || "Direct";
    const color = lead.source?.color || "#3b82f6";
    const entry = sourceCounts.get(name) || { name, count: 0, color };
    entry.count += 1;
    sourceCounts.set(name, entry);
  }
  const leadSourcesChart = Array.from(sourceCounts.values());

  // Revenue vs Expense monthly summary (last 6 months + current)
  const monthMap = new Map<string, { month: string; revenue: number; expenses: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleDateString("en-US", { month: "short" });
    monthMap.set(key, { month: label, revenue: 0, expenses: 0 });
  }
  for (const inv of invoices) {
    const d = new Date(inv.issueDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = monthMap.get(key);
    if (bucket) bucket.revenue += Number(inv.amountPaid);
  }
  for (const deal of wonDeals) {
    const d = new Date(deal.closedAt || deal.updatedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = monthMap.get(key);
    if (bucket && bucket.revenue === 0) bucket.revenue += Number(deal.amount);
  }
  for (const exp of expenses) {
    const d = new Date(exp.expenseDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = monthMap.get(key);
    if (bucket) bucket.expenses += Number(exp.amount);
  }

  // Upcoming follow-ups
  const upcomingFollowUps = leads
    .filter((l) => l.followUpDate && l.status !== "CONVERTED" && l.status !== "LOST")
    .slice(0, 6);

  // Team performance
  const teamPerformance = members
    .filter((m) => m.role.code !== "CLIENT")
    .slice(0, 6)
    .map((m) => {
      const ownedLeads = leads.filter((l) => l.ownerId === m.userId).length;
      const ownedDeals = deals.filter((d) => d.ownerId === m.userId);
      const wonAmount = ownedDeals
        .filter((d) => d.status === "WON")
        .reduce((s, d) => s + Number(d.amount), 0);
      return {
        id: m.userId,
        name: m.user.name,
        role: m.role.name,
        leadsCount: ownedLeads,
        dealsCount: ownedDeals.length,
        wonAmount,
      };
    });

  return NextResponse.json({
    kpis: {
      totalLeads,
      newLeads,
      qualifiedLeads,
      totalContacts,
      totalCompanies,
      activeDeals: openDeals.length,
      pipelineValue,
      wonRevenue,
      conversionRate,
    },
    charts: {
      pipelineChart,
      leadSourcesChart,
      revenueChart: Array.from(monthMap.values()),
    },
    recentLeads: leads.slice(0, 6),
    recentActivities,
    upcomingFollowUps,
    tasksOverview: tasks,
    recentDeals: deals.slice(0, 6),
    teamPerformance,
  });
}
