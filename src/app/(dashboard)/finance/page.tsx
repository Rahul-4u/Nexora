"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, DollarSign, FileSpreadsheet, Receipt, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface FinanceResponse {
  summary: {
    totalRevenue: number;
    pendingPayments: number;
    totalExpenses: number;
    netCashflow: number;
  };
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    total: string | number;
    amountPaid: string | number;
    status: string;
    company: { name: string } | null;
  }>;
  expenses: Array<{
    id: string;
    title: string;
    category: string;
    amount: string | number;
  }>;
}

export default function FinanceOverviewPage() {
  const { data, isLoading } = useQuery<FinanceResponse>({
    queryKey: ["finance-data"],
    queryFn: async () => {
      const res = await fetch("/api/finance");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (isLoading || !data) {
    return (
      <div className="nexora-glass-card p-8 text-sm text-muted-foreground">
        Loading financial summary...
      </div>
    );
  }

  const chartData = [
    { name: "Collected Revenue", amount: data.summary.totalRevenue },
    { name: "Pending Receivables", amount: data.summary.pendingPayments },
    { name: "Expenses", amount: data.summary.totalExpenses },
    { name: "Net Cashflow", amount: Math.max(0, data.summary.netCashflow) },
  ];

  const kpis = [
    { label: "Collected Revenue", value: formatCurrency(data.summary.totalRevenue), icon: DollarSign },
    { label: "Pending Payments", value: formatCurrency(data.summary.pendingPayments), icon: FileSpreadsheet },
    { label: "Total Expenses", value: formatCurrency(data.summary.totalExpenses), icon: Receipt },
    { label: "Net Cashflow", value: formatCurrency(data.summary.netCashflow), icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Finance &amp; Revenue Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Client invoicing, payment collection, and operational expenses.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            Invoices <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/expenses"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground"
          >
            Expenses
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="nexora-glass-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <k.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 font-heading text-2xl font-bold text-foreground">
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="nexora-glass-card p-6">
        <h2 className="font-heading text-base font-bold text-foreground">
          Financial Breakdown
        </h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "currentColor" }} />
              <YAxis tick={{ fontSize: 12, fill: "currentColor" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "12px",
                  color: "var(--popover-foreground)",
                }}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
