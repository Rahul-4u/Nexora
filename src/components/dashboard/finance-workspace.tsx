"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import { DollarSign, Download, Plus, Receipt, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import {
  DashboardPageHeader,
  KpiCard,
  StatusPill,
} from "@/components/dashboard/dashboard-widgets";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: string | number;
  taxAmount: string | number;
  total: string | number;
  amountPaid: string | number;
  company: { name: string } | null;
  items: Array<{
    description: string;
    quantity: string | number;
    unitPrice: string | number;
    amount: string | number;
  }>;
}

export function FinanceWorkspace({
  defaultTab = "invoices",
  title = "Finance & Billing",
}: {
  defaultTab?: "invoices" | "expenses";
  title?: string;
}) {
  const qc = useQueryClient();
  const [invOpen, setInvOpen] = React.useState(false);
  const [expOpen, setExpOpen] = React.useState(false);
  const [payInvoice, setPayInvoice] = React.useState<InvoiceRow | null>(null);
  const [payAmount, setPayAmount] = React.useState("");

  const [invForm, setInvForm] = React.useState({
    companyId: "",
    dueDate: "",
    taxRate: "8",
    description: "Agency Digital Retainer",
    quantity: "1",
    unitPrice: "5000",
  });

  const [expForm, setExpForm] = React.useState({
    title: "",
    category: "Software",
    amount: "",
    vendor: "",
  });

  const { data } = useQuery({
    queryKey: ["finance"],
    queryFn: async () => {
      const res = await fetch("/api/finance");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const summary = data?.summary ?? {
    totalRevenue: 0,
    pendingPayments: 0,
    totalExpenses: 0,
    netCashflow: 0,
  };
  const invoices: InvoiceRow[] = data?.invoices ?? [];
  const expenses = data?.expenses ?? [];
  const companies = data?.companies ?? [];

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: invForm.companyId || null,
        dueDate: invForm.dueDate,
        taxRate: Number(invForm.taxRate || 0),
        status: "SENT",
        items: [
          {
            description: invForm.description,
            quantity: Number(invForm.quantity),
            unitPrice: Number(invForm.unitPrice),
          },
        ],
      }),
    });
    if (res.ok) {
      toast.success("Invoice created");
      setInvOpen(false);
      qc.invalidateQueries({ queryKey: ["finance"] });
    }
  };

  const createExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "expense",
        ...expForm,
        amount: Number(expForm.amount),
      }),
    });
    if (res.ok) {
      toast.success("Expense recorded");
      setExpOpen(false);
      setExpForm({ title: "", category: "Software", amount: "", vendor: "" });
      qc.invalidateQueries({ queryKey: ["finance"] });
    }
  };

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payInvoice) return;
    const res = await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "payment",
        invoiceId: payInvoice.id,
        amount: Number(payAmount),
      }),
    });
    if (res.ok) {
      toast.success("Payment logged");
      setPayInvoice(null);
      setPayAmount("");
      qc.invalidateQueries({ queryKey: ["finance"] });
    }
  };

  const downloadPdf = (inv: InvoiceRow) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("NEXORA DIGITAL AGENCY", 20, 22);
    doc.setFontSize(12);
    doc.text(`Invoice: ${inv.invoiceNumber}`, 20, 34);
    doc.text(`Client: ${inv.company?.name || "Client"}`, 20, 42);
    doc.text(`Due Date: ${formatDate(inv.dueDate)}`, 20, 50);
    doc.text(`Status: ${inv.status}`, 20, 58);

    let y = 74;
    doc.setFontSize(11);
    doc.text("Line Items:", 20, y);
    y += 8;
    inv.items.forEach((item) => {
      doc.text(
        `- ${item.description} (x${item.quantity}) : ${formatCurrency(item.amount)}`,
        22,
        y
      );
      y += 8;
    });

    y += 6;
    doc.text(`Subtotal: ${formatCurrency(inv.subtotal)}`, 20, y);
    doc.text(`Tax: ${formatCurrency(inv.taxAmount)}`, 20, y + 8);
    doc.setFontSize(13);
    doc.text(`Total: ${formatCurrency(inv.total)}`, 20, y + 18);
    doc.text(`Paid: ${formatCurrency(inv.amountPaid)}`, 20, y + 26);

    doc.save(`${inv.invoiceNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={title}
        description="Track client invoices, payments, expenses, PDF statements, and net cashflow."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setExpOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add Expense
            </Button>
            <Button size="sm" onClick={() => setInvOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Create Invoice
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Collected Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          trend="Paid"
        />
        <KpiCard
          label="Pending Payments"
          value={formatCurrency(summary.pendingPayments)}
          icon={<FileSpreadsheet className="h-5 w-5" />}
        />
        <KpiCard
          label="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={<Receipt className="h-5 w-5" />}
        />
        <KpiCard
          label="Net Cashflow"
          value={formatCurrency(summary.netCashflow)}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <div className="nexora-glass-card p-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 pr-4">Invoice #</th>
                  <th className="py-3 pr-4">Client</th>
                  <th className="py-3 pr-4">Total</th>
                  <th className="py-3 pr-4">Paid</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/40">
                    <td className="py-3.5 pr-4 font-semibold">{inv.invoiceNumber}</td>
                    <td className="py-3.5 pr-4 text-xs">{inv.company?.name || "Client"}</td>
                    <td className="py-3.5 pr-4 font-bold">{formatCurrency(inv.total)}</td>
                    <td className="py-3.5 pr-4 text-xs text-emerald-500 font-semibold">
                      {formatCurrency(inv.amountPaid)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <StatusPill status={inv.status} />
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      {inv.status !== "PAID" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPayInvoice(inv);
                            setPayAmount(
                              String(Math.max(0, Number(inv.total) - Number(inv.amountPaid)))
                            );
                          }}
                        >
                          Record Payment
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadPdf(inv)}
                      >
                        <Download className="h-4 w-4" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="nexora-glass-card p-5 space-y-3">
            {expenses.map(
              (exp: {
                id: string;
                title: string;
                category: string;
                amount: string | number;
                vendor: string | null;
                expenseDate: string;
              }) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 p-4 text-sm"
                >
                  <div>
                    <p className="font-semibold text-foreground">{exp.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {exp.category} {exp.vendor ? `• ${exp.vendor}` : ""} &bull;{" "}
                      {formatDate(exp.expenseDate)}
                    </p>
                  </div>
                  <span className="font-heading font-bold text-destructive">
                    -{formatCurrency(exp.amount)}
                  </span>
                </div>
              )
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Invoice Modal */}
      <Dialog open={invOpen} onOpenChange={setInvOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Client Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={createInvoice} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Client Company</Label>
                <select
                  value={invForm.companyId}
                  onChange={(e) => setInvForm({ ...invForm, companyId: e.target.value })}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select client</option>
                  {companies.map((c: { id: string; name: string }) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  required
                  value={invForm.dueDate}
                  onChange={(e) => setInvForm({ ...invForm, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Line Item Description *</Label>
              <Input
                required
                value={invForm.description}
                onChange={(e) => setInvForm({ ...invForm, description: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label>Qty</Label>
                <Input
                  type="number"
                  value={invForm.quantity}
                  onChange={(e) => setInvForm({ ...invForm, quantity: e.target.value })}
                />
              </div>
              <div>
                <Label>Unit Price ($)</Label>
                <Input
                  type="number"
                  value={invForm.unitPrice}
                  onChange={(e) => setInvForm({ ...invForm, unitPrice: e.target.value })}
                />
              </div>
              <div>
                <Label>Tax (%)</Label>
                <Input
                  type="number"
                  value={invForm.taxRate}
                  onChange={(e) => setInvForm({ ...invForm, taxRate: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Create &amp; Issue Invoice
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Expense Modal */}
      <Dialog open={expOpen} onOpenChange={setExpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={createExpense} className="space-y-3">
            <div>
              <Label>Expense Title *</Label>
              <Input
                required
                value={expForm.title}
                onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Category *</Label>
                <Input
                  required
                  value={expForm.category}
                  onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                />
              </div>
              <div>
                <Label>Amount ($) *</Label>
                <Input
                  type="number"
                  required
                  value={expForm.amount}
                  onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Vendor</Label>
              <Input
                value={expForm.vendor}
                onChange={(e) => setExpForm({ ...expForm, vendor: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full">
              Save Expense
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Payment Modal */}
      <Dialog open={!!payInvoice} onOpenChange={() => setPayInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment for {payInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          <form onSubmit={recordPayment} className="space-y-3">
            <div>
              <Label>Payment Amount ($)</Label>
              <Input
                type="number"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Record Payment
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
