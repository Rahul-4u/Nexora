"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Mail,
  Phone,
  Plus,
  Trash2,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface LeadDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  serviceInterest: string | null;
  status: string;
  score: number;
  estimatedValue: string | number | null;
  followUpDate: string | null;
  notes: string | null;
  convertedAt: string | null;
  source: { name: string } | null;
  owner: { name: string } | null;
  activities: Array<{
    id: string;
    type: string;
    subject: string;
    description: string | null;
    createdAt: string;
    user: { name: string } | null;
  }>;
  deals: Array<{
    id: string;
    title: string;
    amount: string | number;
    stage: { name: string };
  }>;
}

export default function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [activitySubject, setActivitySubject] = React.useState("");
  const [activityType, setActivityType] = React.useState("NOTE");

  const { data, isLoading } = useQuery<{ lead: LeadDetail }>({
    queryKey: ["lead-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/crm/leads/${id}`);
      if (!res.ok) throw new Error("Lead not found");
      return res.json();
    },
  });

  const lead = data?.lead;
  const [notes, setNotes] = React.useState("");
  const [status, setStatus] = React.useState("NEW");
  const [score, setScore] = React.useState(50);

  React.useEffect(() => {
    if (lead) {
      setNotes(lead.notes || "");
      setStatus(lead.status);
      setScore(lead.score);
    }
  }, [lead]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/crm/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, score, notes }),
      });
      if (!res.ok) throw new Error("Failed to update lead");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Lead updated");
      qc.invalidateQueries({ queryKey: ["lead-detail", id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const convertMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/crm/leads/${id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createDeal: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Conversion failed");
      return json;
    },
    onSuccess: () => {
      toast.success("Lead converted to Contact, Company & Deal!");
      qc.invalidateQueries({ queryKey: ["lead-detail", id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const logActivityMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/crm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activityType,
          subject: activitySubject,
          leadId: id,
          status: "COMPLETED",
        }),
      });
      if (!res.ok) throw new Error("Failed to log activity");
      return res.json();
    },
    onSuccess: () => {
      setActivitySubject("");
      toast.success("Activity logged");
      qc.invalidateQueries({ queryKey: ["lead-detail", id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/crm/leads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast.success("Lead deleted");
      router.push("/leads");
    },
  });

  if (isLoading || !lead) {
    return (
      <div className="nexora-glass-card p-8 text-sm text-muted-foreground">
        Loading lead details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/leads"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-2xl font-bold text-foreground">
                {lead.name}
              </h1>
              <Badge variant={lead.status === "CONVERTED" ? "success" : "outline"}>
                {lead.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Owner: {lead.owner?.name || "Unassigned"} &bull; Source:{" "}
              {lead.source?.name || "Direct"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {lead.status !== "CONVERTED" && (
            <Button
              onClick={() => convertMutation.mutate()}
              disabled={convertMutation.isPending}
            >
              <UserCheck className="h-4 w-4" />
              Convert To Contact &amp; Deal
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteMutation.mutate()}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Profile + Edit Panel */}
        <div className="space-y-6 lg:col-span-5">
          <div className="nexora-glass-card space-y-4 p-6">
            <h2 className="font-heading text-base font-bold text-foreground">
              Lead Information
            </h2>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>{lead.email}</span>
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>{lead.phone || "No phone"}</span>
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                <span>{lead.companyName || "Individual"}</span>
              </p>
              {lead.estimatedValue && (
                <p className="font-heading text-base font-bold text-foreground pt-1">
                  Est. Value: {formatCurrency(lead.estimatedValue)}
                </p>
              )}
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Status</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    {["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "CONVERTED", "LOST"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Score</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Internal Notes</Label>
                <Textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="w-full"
              >
                Save Changes
              </Button>
            </div>
          </div>

          {lead.deals.length > 0 && (
            <div className="nexora-glass-card p-6">
              <h3 className="font-heading text-base font-bold text-foreground">
                Associated Deals
              </h3>
              <div className="mt-3 space-y-2">
                {lead.deals.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs"
                  >
                    <span className="font-semibold text-foreground">{d.title}</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(d.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Activity Timeline */}
        <div className="space-y-6 lg:col-span-7">
          <div className="nexora-glass-card p-6">
            <h2 className="font-heading text-base font-bold text-foreground">
              Log Activity
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (activitySubject.trim()) logActivityMutation.mutate();
              }}
              className="mt-3 flex flex-col gap-3 sm:flex-row"
            >
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="NOTE">Note</option>
                <option value="CALL">Call</option>
                <option value="EMAIL">Email</option>
                <option value="MEETING">Meeting</option>
                <option value="FOLLOW_UP">Follow-Up</option>
              </select>
              <Input
                placeholder="Summary of call, meeting, or note..."
                value={activitySubject}
                onChange={(e) => setActivitySubject(e.target.value)}
              />
              <Button type="submit" disabled={logActivityMutation.isPending}>
                <Plus className="h-4 w-4" />
                Log
              </Button>
            </form>
          </div>

          <div className="nexora-glass-card p-6">
            <h2 className="font-heading text-base font-bold text-foreground">
              Activity History
            </h2>
            <div className="mt-4 space-y-4">
              {lead.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activities logged yet.
                </p>
              ) : (
                lead.activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 border-l-2 border-primary/40 pl-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {act.subject}
                      </p>
                      {act.description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {act.description}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {act.type} &bull; {act.user?.name || "System"} &bull;{" "}
                        {formatDate(act.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
