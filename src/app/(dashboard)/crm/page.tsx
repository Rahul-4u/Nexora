import Link from "next/link";
import {
  Activity,
  Building2,
  Calendar,
  CheckSquare,
  Contact2,
  Handshake,
  UserPlus,
} from "lucide-react";
import { requirePageSession } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CrmOverviewPage() {
  const session = await requirePageSession();
  const orgId = session.organizationId;

  const [leads, contacts, companies, openDeals, activities, tasks] =
    await Promise.all([
      prisma.lead.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.contact.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.company.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.deal.findMany({
        where: { organizationId: orgId, deletedAt: null, status: "OPEN" },
        select: { amount: true },
      }),
      prisma.activity.count({ where: { organizationId: orgId } }),
      prisma.task.count({ where: { organizationId: orgId, status: { not: "DONE" } } }),
    ]);

  const pipelineSum = openDeals.reduce((s, d) => s + Number(d.amount), 0);

  const cards = [
    {
      title: "Leads",
      metric: `${leads} Total`,
      desc: "Capture, score, filter, import/export, and convert leads.",
      href: "/leads",
      icon: UserPlus,
    },
    {
      title: "Deals Pipeline",
      metric: `${openDeals.length} Open (${formatCurrency(pipelineSum)})`,
      desc: "Drag-and-drop Kanban sales stages and win probability.",
      href: "/deals",
      icon: Handshake,
    },
    {
      title: "Contacts",
      metric: `${contacts} People`,
      desc: "Client stakeholders, owners, tags, and timeline history.",
      href: "/contacts",
      icon: Contact2,
    },
    {
      title: "Companies",
      metric: `${companies} Accounts`,
      desc: "Organization directory linked to contacts, deals, and billing.",
      href: "/companies",
      icon: Building2,
    },
    {
      title: "Activities",
      metric: `${activities} Logged`,
      desc: "Calls, emails, meetings, notes, and follow-up reminders.",
      href: "/activities",
      icon: Activity,
    },
    {
      title: "Tasks & Calendar",
      metric: `${tasks} Active Tasks`,
      desc: "Prioritized tasks and scheduled client meetings.",
      href: "/tasks",
      icon: CheckSquare,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            CRM Command Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Unified revenue operations for {session.organizationName}.
          </p>
        </div>
        <Link
          href="/calendar"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent"
        >
          <Calendar className="h-4 w-4 text-primary" />
          Open Calendar
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="nexora-glass-card group p-6 transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-primary">{c.metric}</span>
            </div>
            <h2 className="mt-4 font-heading text-lg font-bold text-foreground group-hover:text-primary">
              {c.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
