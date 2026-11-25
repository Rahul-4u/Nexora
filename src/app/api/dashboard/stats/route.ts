import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.DASHBOARD_VIEW);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const now = new Date();

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
}
