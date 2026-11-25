"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import { CreditCard, FileDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: string | number;
  taxRate: string | number;
  taxAmount: string | number;
  total: string | number;
  amountPaid: string | number;
  company: { id: string; name: string } | null;
  items: Array<{
    id: string;
    description: string;
    quantity: string | number;
    unitPrice: string | number;
    amount: string | number;
  }>;
}

export default function InvoicesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [payInv, setPayInv] = React.useState<InvoiceRow | null>(null);
  const [payAmount, setPayAmount] = React.useState("");

  const [form, setForm] = React.useState({
    companyId: "",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    taxRate: "8",
    status: "SENT",
    itemDesc: "Agency Retainer Sprint",
    itemQty: "1",
    itemPrice: "5000",
  });

  const { data, isLoading } = useQuery<{
    invoices: InvoiceRow[];
    companies: Array<{ id: string; name: string }>;
  }>({
    queryKey: ["finance-data"],
    queryFn: async () => {
      const res = await fetch("/api/finance");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: form.companyId || null,
          dueDate: form.dueDate,
          taxRate: Number(form.taxRate),
          status: form.status,
          items: [
            {
              description: form.itemDesc,
              quantity: Number(form.itemQty),
              unitPrice: Number(form.itemPrice),
            },
          ],
        }),
      });
      if (!res.ok) throw new Error("Failed to create invoice");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Invoice created");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["finance-data"] });
    },
  });

  const paymentMut = useMutation({
    mutationFn: async () => {
      if (!payInv) return;
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "payment",
          invoiceId: payInv.id,
          amount: Number(payAmount),
        }),
      });
      if (!res.ok) throw new Error("Failed to record payment");
    },
    onSuccess: () => {
      toast.success("Payment recorded");
      setPayInv(null);
      setPayAmount("");
      qc.invalidateQueries({ queryKey: ["finance-data"] });
    },
  });

  const downloadPdf = (inv: InvoiceRow) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("NEXORA DIGITAL AGENCY", 20, 24);
    doc.setFontSize(12);
    doc.text(`Invoice: ${inv.invoiceNumber}`, 20, 38);
    doc.text(`Client: ${inv.company?.name || "Client Account"}`, 20, 46);
    doc.text(`Status: ${inv.status}`, 20, 54);
    doc.text(`Due Date: ${formatDate(inv.dueDate)}`, 20, 62);

    let y = 80;
    doc.setFontSize(11);
    doc.text("Line Items:", 20, y);
    y += 10;
    inv.items.forEach((item) => {
      doc.text(
        `- ${item.description} (${item.quantity} x ${formatCurrency(item.unitPrice)}) = ${formatCurrency(item.amount)}`,
        24,
        y
      );
      y += 8;
    });

    y += 10;
    doc.text(`Subtotal: ${formatCurrency(inv.subtotal)}`, 20, y);
    y += 8;
    doc.text(`Tax (${inv.taxRate}%): ${formatCurrency(inv.taxAmount)}`, 20, y);
    y += 8;
    doc.setFontSize(13);
    doc.text(`Total: ${formatCurrency(inv.total)}`, 20, y);
    y += 8;
    doc.text(`Paid: ${formatCurrency(inv.amountPaid)}`, 20, y);

    doc.save(`${inv.invoiceNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Invoices &amp; Payments
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate client invoices, record payments, and export PDFs.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      <div className="nexora-glass-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Loading invoices...
                </td>
              </tr>
            ) : (
              data?.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-foreground">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3.5 text-xs">
                    {inv.company?.name || "Direct Client"}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-foreground">
                    {formatCurrency(inv.total)}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-emerald-500 font-semibold">
                    {formatCurrency(inv.amountPaid)}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    {formatDate(inv.dueDate)}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge
                      variant={
                        inv.status === "PAID"
                          ? "success"
                          : inv.status === "OVERDUE"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    {inv.status !== "PAID" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPayInv(inv);
                          setPayAmount(
                            String(Math.max(0, Number(inv.total) - Number(inv.amountPaid)))
                          );
                        }}
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Pay
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadPdf(inv)}
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Client Invoice</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMut.mutate();
            }}
            className="mt-4 space-y-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Client Company</Label>
                <select
                  value={form.companyId}
                  onChange={(e) => setForm((f) => ({ ...f, companyId: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select client</option>
                  {data?.companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  required
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Line Item Description *</Label>
              <Input
                required
                value={form.itemDesc}
                onChange={(e) => setForm((f) => ({ ...f, itemDesc: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label>Qty</Label>
                <Input
                  type="number"
                  value={form.itemQty}
                  onChange={(e) => setForm((f) => ({ ...f, itemQty: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Unit Price ($)</Label>
                <Input
                  type="number"
                  value={form.itemPrice}
                  onChange={(e) => setForm((f) => ({ ...f, itemPrice: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Tax %</Label>
                <Input
                  type="number"
                  value={form.taxRate}
                  onChange={(e) => setForm((f) => ({ ...f, taxRate: e.target.value }))}
                />
              </div>
            </div>
            <Button type="submit" disabled={createMut.isPending} className="w-full">
              Create Invoice
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!payInv} onOpenChange={() => setPayInv(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment — {payInv?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              paymentMut.mutate();
            }}
            className="mt-4 space-y-4"
          >
            <div className="space-y-1">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={paymentMut.isPending} className="w-full">
              Confirm Payment
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
