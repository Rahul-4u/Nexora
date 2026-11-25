"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Receipt } from "lucide-react";
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

interface ExpenseRow {
  id: string;
  title: string;
  category: string;
  amount: string | number;
  expenseDate: string;
  vendor: string | null;
}

export default function ExpensesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    category: "Software",
    amount: "",
    vendor: "",
  });

  const { data, isLoading } = useQuery<{ expenses: ExpenseRow[] }>({
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
          kind: "expense",
          ...form,
          amount: Number(form.amount),
        }),
      });
      if (!res.ok) throw new Error("Failed to add expense");
    },
    onSuccess: () => {
      toast.success("Expense recorded");
      setOpen(false);
      setForm({ title: "", category: "Software", amount: "", vendor: "" });
      qc.invalidateQueries({ queryKey: ["finance-data"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Agency Expenses
          </h1>
          <p className="text-sm text-muted-foreground">
            Track SaaS tooling, cloud hosting, contractors, and operational costs.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Log Expense
        </Button>
      </div>

      <div className="nexora-glass-card divide-y divide-border">
        {isLoading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Loading expenses...
          </p>
        ) : (
          data?.expenses.map((exp) => (
            <div
              key={exp.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Receipt className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-heading text-sm font-bold text-foreground">
                    {exp.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {exp.vendor || "General Vendor"} &bull;{" "}
                    {formatDate(exp.expenseDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{exp.category}</Badge>
                <span className="font-heading text-sm font-bold text-foreground">
                  {formatCurrency(exp.amount)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMut.mutate();
            }}
            className="mt-4 space-y-4"
          >
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Amount ($) *</Label>
                <Input
                  type="number"
                  required
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Vendor</Label>
              <Input
                value={form.vendor}
                onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
              />
            </div>
            <Button type="submit" disabled={createMut.isPending} className="w-full">
              Save Expense
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
