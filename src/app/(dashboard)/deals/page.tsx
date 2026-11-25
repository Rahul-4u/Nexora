"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, DollarSign, GripVertical, Plus } from "lucide-react";
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

interface StageItem {
  id: string;
  name: string;
  color: string;
  probability: number;
  position: number;
}

interface DealItem {
  id: string;
  title: string;
  amount: string | number;
  probability: number;
  status: string;
  stageId: string;
  expectedCloseDate: string | null;
  company: { id: string; name: string } | null;
  owner: { id: string; name: string } | null;
}

interface DealsResponse {
  stages: StageItem[];
  deals: DealItem[];
  companies: Array<{ id: string; name: string }>;
  contacts: Array<{ id: string; firstName: string; lastName: string }>;
}

export default function DealsKanbanPage() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [draggedDealId, setDraggedDealId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    title: "",
    amount: "15000",
    stageId: "",
    companyId: "",
    expectedCloseDate: "",
  });

  const { data, isLoading } = useQuery<DealsResponse>({
    queryKey: ["deals-pipeline"],
    queryFn: async () => {
      const res = await fetch("/api/crm/deals");
      if (!res.ok) throw new Error("Failed to load deals");
      return res.json();
    },
  });

  React.useEffect(() => {
    if (data?.stages[0] && !form.stageId) {
      setForm((f) => ({ ...f, stageId: data.stages[0].id }));
    }
  }, [data, form.stageId]);

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          companyId: form.companyId || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create deal");
      return json;
    },
    onSuccess: () => {
      toast.success("Deal added to pipeline");
      setOpen(false);
      setForm((f) => ({ ...f, title: "", amount: "15000" }));
      qc.invalidateQueries({ queryKey: ["deals-pipeline"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const moveMut = useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string; stageId: string }) => {
      const res = await fetch(`/api/crm/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
      });
      if (!res.ok) throw new Error("Failed to move deal");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Deal stage updated");
      qc.invalidateQueries({ queryKey: ["deals-pipeline"] });
    },
  });

  const stages = data?.stages ?? [];
  const deals = data?.deals ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Deals &amp; Sales Pipeline
          </h1>
          <p className="text-sm text-muted-foreground">
            Drag and drop deals between stages or change stage directly to track
            weighted pipeline revenue.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New Deal
        </Button>
      </div>

      {isLoading ? (
        <div className="nexora-glass-card p-8 text-sm text-muted-foreground">
          Loading pipeline stages...
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stageId === stage.id);
            const stageSum = stageDeals.reduce((s, d) => s + Number(d.amount), 0);

            return (
              <div
                key={stage.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedDealId) {
                    moveMut.mutate({ dealId: draggedDealId, stageId: stage.id });
                    setDraggedDealId(null);
                  }
                }}
                className="nexora-glass-card flex min-w-[290px] flex-1 flex-col p-4"
              >
                <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h2 className="font-heading text-sm font-bold text-foreground">
                      {stage.name}
                    </h2>
                    <Badge variant="secondary">{stageDeals.length}</Badge>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    {formatCurrency(stageSum)}
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => setDraggedDealId(deal.id)}
                      className="cursor-grab rounded-xl border border-border bg-card p-4 shadow-xs transition hover:border-primary/50 active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading text-sm font-bold text-foreground">
                          {deal.title}
                        </h3>
                        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {deal.company?.name || "Direct Client"}
                      </p>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 font-bold text-primary">
                          <DollarSign className="h-3.5 w-3.5" />
                          {formatCurrency(deal.amount)}
                        </span>
                        <span className="text-muted-foreground">
                          {deal.probability}% prob
                        </span>
                      </div>

                      {deal.expectedCloseDate && (
                        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Close: {formatDate(deal.expectedCloseDate)}
                        </p>
                      )}

                      <div className="mt-3 border-t border-border pt-2">
                        <select
                          aria-label={`Move ${deal.title} stage`}
                          value={deal.stageId}
                          onChange={(e) =>
                            moveMut.mutate({
                              dealId: deal.id,
                              stageId: e.target.value,
                            })
                          }
                          className="h-7 w-full rounded border border-input bg-background px-2 text-[11px] text-foreground"
                        >
                          {stages.map((st) => (
                            <option key={st.id} value={st.id}>
                              Stage: {st.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Pipeline Deal</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMut.mutate();
            }}
            className="mt-4 space-y-4"
          >
            <div className="space-y-1">
              <Label>Deal Title *</Label>
              <Input
                required
                placeholder="BrightLabs RevOps Retainer"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Amount ($) *</Label>
                <Input
                  type="number"
                  required
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Stage</Label>
                <select
                  value={form.stageId}
                  onChange={(e) => setForm((f) => ({ ...f, stageId: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Company</Label>
                <select
                  value={form.companyId}
                  onChange={(e) => setForm((f) => ({ ...f, companyId: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">None</option>
                  {data?.companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Expected Close Date</Label>
                <Input
                  type="date"
                  value={form.expectedCloseDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expectedCloseDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <Button type="submit" disabled={createMut.isPending} className="w-full">
              Create Deal
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
