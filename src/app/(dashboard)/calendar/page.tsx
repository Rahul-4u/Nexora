"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Users } from "lucide-react";
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

interface CalendarResponse {
  meetings: Array<{
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    location: string | null;
    participants: string[];
    organizer: { name: string } | null;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    status: string;
  }>;
  followUps: Array<{
    id: string;
    name: string;
    followUpDate: string;
    status: string;
  }>;
}

export default function CalendarPage() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    startTime: "",
    endTime: "",
    location: "Zoom",
    participants: "",
    description: "",
  });

  const { data, isLoading } = useQuery<CalendarResponse>({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const res = await fetch("/api/crm/meetings");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/crm/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          participants: form.participants
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed to schedule meeting");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Meeting scheduled");
      setOpen(false);
      setForm({ title: "", startTime: "", endTime: "", location: "Zoom", participants: "", description: "" });
      qc.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Calendar &amp; Meetings
          </h1>
          <p className="text-sm text-muted-foreground">
            Unified schedule of meetings, task deadlines, and lead follow-ups.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      {isLoading ? (
        <div className="nexora-glass-card p-8 text-sm text-muted-foreground">
          Loading schedule...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="nexora-glass-card space-y-4 p-6 lg:col-span-7">
            <h2 className="font-heading text-base font-bold text-foreground">
              Upcoming Meetings
            </h2>
            {data?.meetings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No meetings scheduled.</p>
            ) : (
              data?.meetings.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-border bg-card/70 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-sm font-bold text-foreground">
                      {m.title}
                    </h3>
                    <Badge variant="outline">
                      {formatDate(m.startTime, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </Badge>
                  </div>
                  {m.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{m.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {m.location || "Virtual"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      {m.participants.length} participants
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="nexora-glass-card p-6">
              <h2 className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                Lead Follow-Up Reminders
              </h2>
              <div className="mt-4 space-y-2.5">
                {data?.followUps.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-foreground">{f.name}</span>
                    <span className="text-muted-foreground">
                      {formatDate(f.followUpDate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="nexora-glass-card p-6">
              <h2 className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
                <CalendarIcon className="h-4 w-4 text-primary" />
                Task Deadlines
              </h2>
              <div className="mt-4 space-y-2.5">
                {data?.tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-foreground">{t.title}</span>
                    <Badge variant="outline">{formatDate(t.dueDate)}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMut.mutate();
            }}
            className="mt-4 space-y-4"
          >
            <div className="space-y-1">
              <Label>Meeting Title *</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Start Time *</Label>
                <Input
                  type="datetime-local"
                  required
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>End Time *</Label>
                <Input
                  type="datetime-local"
                  required
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Location / Video Link</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Participant Emails (comma separated)</Label>
              <Input
                placeholder="client@company.com, sales@nexora.agency"
                value={form.participants}
                onChange={(e) =>
                  setForm((f) => ({ ...f, participants: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Agenda</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <Button type="submit" disabled={createMut.isPending} className="w-full">
              Schedule Meeting
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
