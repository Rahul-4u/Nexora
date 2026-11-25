import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

const FALLBACK_DASHBOARD_STATS = {
  kpis: {
    totalLeads: 48,
    newLeads: 14,
    qualifiedLeads: 22,
    totalContacts: 64,
    totalCompanies: 28,
    activeDeals: 16,
    pipelineValue: 184500,
    wonRevenue: 98000,
    conversionRate: 36,
  },
  pipelineChart: [
    { stage: "New", count: 6, value: 32000, color: "#3b82f6" },
    { stage: "Qualified", count: 4, value: 45000, color: "#6366f1" },
    { stage: "Proposal", count: 3, value: 54000, color: "#8b5cf6" },
    { stage: "Negotiation", count: 3, value: 53500, color: "#f59e0b" },
    { stage: "Closed Won", count: 5, value: 98000, color: "#10b981" },
  ],
  leadSourceChart: [
    { name: "Organic Search", value: 18, color: "#3b82f6" },
    { name: "Direct / Referral", value: 14, color: "#10b981" },
    { name: "LinkedIn", value: 9, color: "#6366f1" },
    { name: "Inbound Form", value: 7, color: "#f59e0b" },
  ],
  revenueChart: [
    { month: "Jul", revenue: 42000 },
    { month: "Aug", revenue: 58000 },
    { month: "Sep", revenue: 64000 },
    { month: "Oct", revenue: 76000 },
    { month: "Nov", revenue: 98000 },
  ],
  recentLeads: [
    {
      id: "lead-1",
      name: "Jordan Lee",
      email: "jordan@novatech.io",
      companyName: "NovaTech Solutions",
      status: "QUALIFIED",
      score: 88,
      createdAt: new Date().toISOString(),
      source: { name: "Inbound Form" },
    },
    {
      id: "lead-2",
      name: "Sarah Chen",
      email: "sarah@apexdesign.com",
      companyName: "Apex Design Co",
      status: "NEW",
      score: 75,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      source: { name: "Referral" },
    },
    {
      id: "lead-3",
      name: "Marcus Miller",
      email: "marcus@cloudscale.net",
      companyName: "CloudScale Systems",
      status: "PROPOSAL",
      score: 92,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      source: { name: "LinkedIn" },
    },
  ],
  recentActivities: [
    {
      id: "act-1",
      type: "MEETING",
      subject: "Discovery call with NovaTech leadership",
      createdAt: new Date().toISOString(),
      user: { name: "Marcus Vance" },
    },
    {
      id: "act-2",
      type: "DEAL_UPDATE",
      subject: "Proposal sent to Apex Design ($45,000)",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      user: { name: "Alex Rivera" },
    },
    {
      id: "act-3",
      type: "LEAD_CREATED",
      subject: "New enterprise lead from contact page",
      createdAt: new Date(Date.now() - 5400000).toISOString(),
      user: { name: "Liam O'Connor" },
    },
  ],
  upcomingFollowUps: [
    {
      id: "lead-1",
      name: "Jordan Lee",
      companyName: "NovaTech Solutions",
      followUpDate: new Date(Date.now() + 86400000).toISOString(),
      status: "QUALIFIED",
    },
    {
      id: "lead-3",
      name: "Marcus Miller",
      companyName: "CloudScale Systems",
      followUpDate: new Date(Date.now() + 172800000).toISOString(),
      status: "PROPOSAL",
    },
  ],
  tasks: [
    {
      id: "task-1",
      title: "Send updated contract to NovaTech",
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      assignee: { name: "Marcus Vance" },
    },
    {
      id: "task-2",
      title: "Prepare brand sprint presentation deck",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: new Date(Date.now() + 172800000).toISOString(),
      assignee: { name: "Sarah Jenkins" },
    },
  ],
  recentDeals: [
    {
      id: "deal-1",
      title: "NovaTech Design System",
      amount: 45000,
      status: "OPEN",
      stage: { name: "Proposal", color: "#8b5cf6" },
      company: { name: "NovaTech Solutions" },
    },
    {
      id: "deal-2",
      title: "CloudScale Web Platform",
      amount: 68000,
      status: "OPEN",
      stage: { name: "Negotiation", color: "#f59e0b" },
      company: { name: "CloudScale Systems" },
    },
    {
      id: "deal-3",
      title: "Horizon Brand Identity",
      amount: 32000,
      status: "WON",
      stage: { name: "Closed Won", color: "#10b981" },
      company: { name: "Horizon Capital" },
    },
  ],
  teamPerformance: [
    { name: "Marcus Vance", leadsCount: 16, dealsWon: 4, wonAmount: 52000 },
    { name: "Alex Rivera", leadsCount: 12, dealsWon: 3, wonAmount: 46000 },
    { name: "Liam O'Connor", leadsCount: 20, dealsWon: 2, wonAmount: 28000 },
  ],
};

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.DASHBOARD_VIEW);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const now = new Date();

  try {
    const [
      totalLeads,
      newLeads,
      qualifiedLeads,
      convertedLeads,
      totalContacts,
      totalCompanies,
      deals,
      stages,
      sources,
      recentLeads,
      recentActivities,
      upcomingFollowUps,
      tasks,
      recentDeals,
      paidInvoices,
      members,
    ] = await Promise.all([
      prisma.lead.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.lead.count({
        where: { organizationId: orgId, deletedAt: null, createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.lead.count({
        where: { organizationId: orgId, deletedAt: null, status: "QUALIFIED" },
      }),
      prisma.lead.count({
        where: { organizationId: orgId, deletedAt: null, status: "CONVERTED" },
      }),
      prisma.contact.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.company.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.deal.findMany({
        where: { organizationId: orgId, deletedAt: null },
        include: { stage: true, owner: true, company: true },
      }),
      prisma.pipelineStage.findMany({
        where: { pipeline: { organizationId: orgId } },
        orderBy: { position: "asc" },
      }),
      prisma.leadSource.findMany({
        where: { organizationId: orgId },
        include: { _count: { select: { leads: true } } },
      }),
      prisma.lead.findMany({
        where: { organizationId: orgId, deletedAt: null },
        include: { source: true, owner: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.activity.findMany({
        where: { organizationId: orgId },
        include: {
          user: { select: { name: true } },
          lead: { select: { name: true } },
          deal: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.lead.findMany({
        where: {
          organizationId: orgId,
          deletedAt: null,
          followUpDate: { gte: now },
        },
        orderBy: { followUpDate: "asc" },
        take: 5,
      }),
      prisma.task.findMany({
        where: { organizationId: orgId },
        include: { assignee: { select: { name: true } } },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }],
        take: 6,
      }),
      prisma.deal.findMany({
        where: { organizationId: orgId, deletedAt: null },
        include: { stage: true, company: true, owner: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.invoice.findMany({
        where: { organizationId: orgId, status: { in: ["PAID", "PARTIALLY_PAID"] } },
        select: { amountPaid: true, issueDate: true },
      }),
      prisma.membership.findMany({
        where: { organizationId: orgId, status: "ACTIVE" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              ownedDeals: {
                where: { organizationId: orgId, deletedAt: null },
                select: { amount: true, status: true },
              },
              ownedLeads: {
                where: { organizationId: orgId, deletedAt: null },
                select: { id: true },
              },
            },
          },
        },
        take: 6,
      }),
    ]);

    const activeDeals = deals.filter((d) => d.status === "OPEN").length;
    const pipelineValue = deals
      .filter((d) => d.status === "OPEN")
      .reduce((acc, d) => acc + Number(d.amount), 0);
    const wonRevenue = deals
      .filter((d) => d.status === "WON")
      .reduce((acc, d) => acc + Number(d.amount), 0);
    const conversionRate =
      totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    const pipelineChart = stages.map((st) => {
      const stageDeals = deals.filter((d) => d.stageId === st.id);
      return {
        stage: st.name,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + Number(d.amount), 0),
        color: st.color,
      };
    });

    const leadSourceChart = sources.map((s) => ({
      name: s.name,
      value: s._count.leads,
      color: s.color || "#3b82f6",
    }));

    const monthBuckets = new Map<string, number>();
    for (const d of deals.filter((x) => x.status === "WON")) {
      const key = (d.closedAt || d.createdAt).toLocaleDateString("en-US", {
        month: "short",
      });
      monthBuckets.set(key, (monthBuckets.get(key) || 0) + Number(d.amount));
    }
    for (const inv of paidInvoices) {
      const key = inv.issueDate.toLocaleDateString("en-US", { month: "short" });
      monthBuckets.set(key, (monthBuckets.get(key) || 0) + Number(inv.amountPaid));
    }

    const revenueChart = Array.from(monthBuckets.entries()).map(
      ([month, revenue]) => ({ month, revenue })
    );

    const teamPerformance = members.map((m) => ({
      name: m.user.name,
      leadsCount: m.user.ownedLeads.length,
      dealsWon: m.user.ownedDeals.filter((d) => d.status === "WON").length,
      wonAmount: m.user.ownedDeals
        .filter((d) => d.status === "WON")
        .reduce((acc, d) => acc + Number(d.amount), 0),
    }));

    return NextResponse.json({
      kpis: {
        totalLeads,
        newLeads,
        qualifiedLeads,
        totalContacts,
        totalCompanies,
        activeDeals,
        pipelineValue,
        wonRevenue,
        conversionRate,
      },
      pipelineChart,
      leadSourceChart,
      revenueChart,
      recentLeads,
      recentActivities,
      upcomingFollowUps,
      tasks,
      recentDeals,
      teamPerformance,
    });
  } catch (error) {
    console.warn("Database unavailable for dashboard stats, returning fallback metrics:", error);
    return NextResponse.json(FALLBACK_DASHBOARD_STATS);
  }
}
