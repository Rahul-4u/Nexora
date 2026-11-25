"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Mail, Phone, Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

interface ActivityRow {
  id: string;
  type: string;
  status: string;
  subject: string;
  description: string | null;
  scheduledAt: string | null;
  createdAt: string;
  user: { name: string } | null;
  lead: { name: string } | null;
  deal: { title: string } | null;
}

export default function ActivitiesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [filterType, setFilterType] = React.useState("ALL");
  const [form, setForm] = React.useState({
    type: "CALL",
    status: "PENDING",
    subject: "",
    description: "",
    scheduledAt: "",
  });

  const { data, isLoading } = useQuery<{ activities: ActivityRow[] }>({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await fetch("/api/crm/activities");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/crm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create activity");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Activity logged");
      setOpen(false);
      setForm({ type: "CALL", status: "PENDING", subject: "", description: "", scheduledAt: "" });
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await fetch(`/api/crm/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activities"] }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/crm/activities/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast.success("Activity removed");
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  const activities = (data?.activities ?? []).filter(
    (a) => filterType === "ALL" || a.type === filterType
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Activities &amp; Follow-Ups
          </h1>
          <p className="text-sm text-muted-foreground">
            Calls, emails, client meetings, notes, and follow-up reminders.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["ALL", "CALL", "EMAIL", "MEETING", "NOTE", "FOLLOW_UP"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilterType(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
              filterType === t
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="nexora-glass-card divide-y divide-border">
        {isLoading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Loading activity feed...
          </p>
        ) : activities.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            No activities logged for this filter.
          </p>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {act.type === "CALL" ? (
                    <Phone className="h-4 w-4" />
                  ) : act.type === "EMAIL" ? (
                    <Mail className="h-4 w-4" />
                  ) : act.type === "MEETING" ? (
                    <Calendar className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-sm font-bold text-foreground">
                      {act.subject}
                    </h3>
                    <Badge variant="outline">{act.type}</Badge>
                    <Badge
                      variant={
                        act.status === "COMPLETED" ? "success" : "secondary"
                      }
                    >
                      {act.status}
                    </Badge>
                  </div>
                  {act.description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {act.description}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {act.user?.name || "System"} &bull;{" "}
                    {act.lead?.name ? `Lead: ${act.lead.name} • ` : ""}
                    {act.deal?.title ? `Deal: ${act.deal.title} • ` : ""}
                    {formatDate(act.scheduledAt || act.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toggleStatus.mutate({
                      id: act.id,
                      status: act.status === "COMPLETED" ? "PENDING" : "COMPLETED",
                    })
                  }
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {act.status === "COMPLETED" ? "Reopen" : "Complete"}
                </Button>
                <button
                  type="button"
                  onClick={() => deleteMut.mutate(act.id)}
                  className="rounded-lg p-2 text-muted-foreground hover:text-destructive cursor-pointer"
                  aria-label="Delete activity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity / Follow-Up</DialogTitle>
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
                <Label>Type</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="CALL">Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">Meeting</option>
                  <option value="NOTE">Note</option>
                  <option value="FOLLOW_UP">Follow-Up</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Subject *</Label>
              <Input
                required
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Scheduled At</Label>
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, scheduledAt: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <Button type="submit" disabled={createMut.isPending} className="w-full">
              Save Activity
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
