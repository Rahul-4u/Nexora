"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Globe, MapPin, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CompanyItem {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  size: string | null;
  city: string | null;
  country: string | null;
  _count: { contacts: number; deals: number; projects: number };
}

export default function CompaniesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    website: "",
    industry: "",
    size: "50-200",
    city: "",
    country: "",
  });

  const { data, isLoading } = useQuery<{ companies: CompanyItem[] }>({
    queryKey: ["companies", search],
    queryFn: async () => {
      const res = await fetch(`/api/crm/companies?search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/crm/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => {
      toast.success("Company created");
      setOpen(false);
      setForm({ name: "", website: "", industry: "", size: "50-200", city: "", country: "" });
      qc.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/crm/companies/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast.success("Company removed");
      qc.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  const companies = data?.companies ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Companies
          </h1>
          <p className="text-sm text-muted-foreground">
            B2B accounts, client organizations, and linked projects.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      <div className="nexora-glass-card overflow-hidden">
        <div className="border-b border-border p-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search companies or industries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
              Loading companies...
            </p>
          ) : companies.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
              No companies found.
            </p>
          ) : (
            companies.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-border bg-card/70 p-5 transition hover:border-primary/40"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-heading text-base font-bold text-foreground">
                        {c.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {c.industry || "Technology"} &bull; {c.size || "SMB"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMut.mutate(c.id)}
                    aria-label={`Delete ${c.name}`}
                    className="text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  {c.website && (
                    <p className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      {c.website}
                    </p>
                  )}
                  {(c.city || c.country) && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {[c.city, c.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span>{c._count.contacts} contacts</span>
                  <span>&bull;</span>
                  <span>{c._count.deals} deals</span>
                  <span>&bull;</span>
                  <span>{c._count.projects} projects</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Company</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMut.mutate();
            }}
            className="mt-4 space-y-4"
          >
            <div className="space-y-1">
              <Label>Company Name *</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Industry</Label>
                <Input
                  value={form.industry}
                  onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Website</Label>
                <Input
                  placeholder="https://"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Country</Label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                />
              </div>
            </div>
            <Button type="submit" disabled={createMut.isPending} className="w-full">
              Save Company
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
