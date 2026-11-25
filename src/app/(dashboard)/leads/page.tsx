"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  Plus,
  Search,
  Trash2,
  Upload,
  Eye,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pagination } from "@/components/shared/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const STATUSES = [
  "ALL",
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "CONVERTED",
  "LOST",
] as const;

interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  status: string;
  score: number;
  estimatedValue: string | number | null;
  followUpDate: string | null;
  createdAt: string;
  source: { id: string; name: string } | null;
  owner: { id: string; name: string } | null;
}

interface LeadsResponse {
  leads: LeadRow[];
  total: number;
  page: number;
  totalPages: number;
  statusCounts: Record<string, number>;
  sources: Array<{ id: string; name: string }>;
  owners: Array<{ id: string; name: string }>;
}

export default function LeadsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string>("ALL");
  const [sourceId, setSourceId] = React.useState("ALL");
  const [ownerId, setOwnerId] = React.useState("ALL");
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [csvText, setCsvText] = React.useState(
    "name,email,company,phone,value\nSarah Jenkins,sarah@acme.io,Acme Corp,+1-415-555-0101,12000"
  );

  const [newLead, setNewLead] = React.useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    serviceInterest: "App Agency",
    sourceName: "Website",
    status: "NEW",
    score: 75,
    estimatedValue: "10000",
    notes: "",
  });

  const { data, isLoading } = useQuery<LeadsResponse>({
    queryKey: ["leads", search, status, sourceId, ownerId, sortBy, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        status,
        sourceId,
        ownerId,
        sortBy,
        page: String(page),
        pageSize: "8",
      });
      const res = await fetch(`/api/crm/leads?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load leads");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLead,
          estimatedValue: newLead.estimatedValue ? Number(newLead.estimatedValue) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create lead");
      return json;
    },
    onSuccess: () => {
      toast.success("Lead created");
      setCreateOpen(false);
      setNewLead({
        name: "",
        email: "",
        phone: "",
        companyName: "",
        serviceInterest: "App Agency",
        sourceName: "Website",
        status: "NEW",
        score: 75,
        estimatedValue: "10000",
        notes: "",
      });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const bulkMutation = useMutation({
    mutationFn: async (payload: { ids: string[]; action: string; value?: string }) => {
      const res = await fetch("/api/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Bulk action failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Bulk update applied");
      setSelectedIds([]);
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/crm/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");
      return json;
    },
    onSuccess: (res) => {
      toast.success(`Imported ${res.imported} leads`);
      setImportOpen(false);
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const leads = data?.leads ?? [];
  const allChecked =
    leads.length > 0 && leads.every((l) => selectedIds.includes(l.id));

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Leads
          </h1>
          <p className="text-sm text-muted-foreground">
            Track, score, import, and convert prospects into active pipeline deals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/crm/leads/export"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-accent"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </a>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Status Pipeline Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((st) => {
          const count =
            st === "ALL"
              ? data?.total ?? 0
              : data?.statusCounts?.[st] ?? 0;
          return (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatus(st);
                setPage(1);
              }}
              className={cn(
                "rounded-xl border px-3.5 py-2 text-xs font-semibold transition cursor-pointer",
                status === st
                  ? "border-primary bg-primary text-primary-foreground shadow"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Glass Table Card */}
      <div className="nexora-glass-card overflow-hidden">
        {/* Filters Bar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-9 pl-9"
              />
            </div>

            <select
              aria-label="Filter by source"
              value={sourceId}
              onChange={(e) => {
                setSourceId(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground"
            >
              <option value="ALL">Source: All</option>
              {data?.sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by owner"
              value={ownerId}
              onChange={(e) => {
                setOwnerId(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground"
            >
              <option value="ALL">Owner: All Reps</option>
              {data?.owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Sort leads"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground"
            >
              <option value="createdAt">Sort: Newest</option>
              <option value="score">Sort: Highest Score</option>
              <option value="estimatedValue">Sort: Highest Value</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-primary/10 px-3 py-1.5">
              <span className="text-xs font-semibold text-primary">
                {selectedIds.length} selected
              </span>
              <select
                aria-label="Bulk status"
                defaultValue=""
                onChange={(e) => {
                  if (!e.target.value) return;
                  bulkMutation.mutate({
                    ids: selectedIds,
                    action: "status",
                    value: e.target.value,
                  });
                }}
                className="h-7 rounded border border-border bg-card px-2 text-xs"
              >
                <option value="">Set Status...</option>
                {STATUSES.filter((s) => s !== "ALL").map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() =>
                  bulkMutation.mutate({ ids: selectedIds, action: "delete" })
                }
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    aria-label="Select all leads"
                    className="rounded border-input"
                  />
                </th>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Est. Value</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Follow-Up</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                    No leads match your filters.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="transition hover:bg-muted/30"
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lead.id)}
                        onChange={() => toggleOne(lead.id)}
                        aria-label={`Select ${lead.name}`}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-semibold text-foreground hover:text-primary"
                      >
                        {lead.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-foreground">
                      {lead.companyName || "—"}
                    </td>
                    <td className="w-36 px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Progress value={lead.score} className="h-2 w-20" />
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-foreground">
                          {lead.score >= 85 && (
                            <Flame className="h-3 w-3 text-amber-500" />
                          )}
                          {lead.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-foreground">
                      {lead.estimatedValue
                        ? formatCurrency(lead.estimatedValue)
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {lead.source?.name || "Direct"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          lead.status === "CONVERTED"
                            ? "success"
                            : lead.status === "LOST"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {formatDate(lead.followUpDate)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary hover:text-primary"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="border-t border-border px-4 py-3">
          <Pagination
            page={page}
            totalPages={data?.totalPages ?? 1}
            totalItems={data?.total ?? 0}
            pageSize={8}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Create Lead Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Lead</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="mt-4 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input
                  type="email"
                  required
                  value={newLead.email}
                  onChange={(e) => setNewLead((s) => ({ ...s, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input
                  value={newLead.companyName}
                  onChange={(e) =>
                    setNewLead((s) => ({ ...s, companyName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Estimated Value ($)</Label>
                <Input
                  type="number"
                  value={newLead.estimatedValue}
                  onChange={(e) =>
                    setNewLead((s) => ({ ...s, estimatedValue: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Input
                  value={newLead.sourceName}
                  onChange={(e) =>
                    setNewLead((s) => ({ ...s, sourceName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Lead Score (0-100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={newLead.score}
                  onChange={(e) =>
                    setNewLead((s) => ({ ...s, score: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                value={newLead.notes}
                onChange={(e) => setNewLead((s) => ({ ...s, notes: e.target.value }))}
              />
            </div>
            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? "Saving..." : "Save Lead"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* CSV Import Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Leads From CSV</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <p className="text-xs text-muted-foreground">
              Paste CSV rows with headers including <code>name</code> and{" "}
              <code>email</code> (optional: <code>company, phone, value</code>).
            </p>
            <Textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />
            <Button
              onClick={() => importMutation.mutate()}
              disabled={importMutation.isPending}
              className="w-full"
            >
              {importMutation.isPending ? "Importing..." : "Import Leads"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
