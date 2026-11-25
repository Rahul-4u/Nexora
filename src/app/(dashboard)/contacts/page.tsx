"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, Mail, Phone, Building2 } from "lucide-react";
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

interface ContactItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  isClient: boolean;
  company: { id: string; name: string } | null;
  _count: { deals: number; activities: number };
}

export default function ContactsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [onlyClients, setOnlyClients] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    isClient: true,
  });

  const { data, isLoading } = useQuery<{ contacts: ContactItem[] }>({
    queryKey: ["contacts", search, onlyClients],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (search) p.set("search", search);
      if (onlyClients) p.set("isClient", "true");
      const res = await fetch(`/api/crm/contacts?${p.toString()}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => {
      toast.success("Contact created");
      setOpen(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", jobTitle: "", isClient: true });
      qc.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/crm/contacts/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast.success("Contact removed");
      qc.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  const contacts = data?.contacts ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Contacts &amp; Clients
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage client stakeholders, decision makers, and associated deals.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <div className="nexora-glass-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={onlyClients}
              onChange={(e) => setOnlyClients(e.target.checked)}
            />
            Show Active Clients Only
          </label>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
              Loading contacts...
            </p>
          ) : contacts.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
              No contacts found.
            </p>
          ) : (
            contacts.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-border bg-card/70 p-5 transition hover:border-primary/40"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground">
                      {c.firstName} {c.lastName}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {c.jobTitle || "Stakeholder"}
                    </p>
                  </div>
                  <Badge variant={c.isClient ? "success" : "secondary"}>
                    {c.isClient ? "Client" : "Contact"}
                  </Badge>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    {c.email}
                  </p>
                  {c.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      {c.phone}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    {c.company?.name || "Independent"}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="text-muted-foreground">
                    {c._count.deals} deals &bull; {c._count.activities} activities
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteMut.mutate(c.id)}
                    aria-label={`Delete ${c.firstName}`}
                    className="text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Contact</DialogTitle>
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
                <Label>First Name *</Label>
                <Input
                  required
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Last Name *</Label>
                <Input
                  required
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Job Title</Label>
                <Input
                  value={form.jobTitle}
                  onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
                />
              </div>
            </div>
            <Button type="submit" disabled={createMut.isPending} className="w-full">
              Save Contact
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
