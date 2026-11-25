"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { DashboardPageHeader, StatusPill } from "@/components/dashboard/dashboard-widgets";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ProjectsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [milestoneText, setMilestoneText] = React.useState<Record<string, string>>({});
  const [form, setForm] = React.useState({
    name: "",
    code: "",
    budget: "25000",
    status: "PLANNING",
    deadline: "",
    description: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, budget: Number(form.budget) || null }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Could not create project");
      return;
    }
    toast.success("Project created");
    setOpen(false);
    setForm({ name: "", code: "", budget: "25000", status: "PLANNING", deadline: "", description: "" });
    qc.invalidateQueries({ queryKey: ["projects"] });
  };

  const toggleMilestone = async (projectId: string, milestoneId: string) => {
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toggleMilestoneId: milestoneId }),
    });
    qc.invalidateQueries({ queryKey: ["projects"] });
  };

  const addMilestone = async (projectId: string) => {
    const title = milestoneText[projectId]?.trim();
    if (!title) return;
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addMilestone: { title } }),
    });
    setMilestoneText((m) => ({ ...m, [projectId]: "" }));
    qc.invalidateQueries({ queryKey: ["projects"] });
  };

  const updateProjectProgress = async (id: string, progress: number, status: string) => {
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress, status }),
    });
    toast.success("Project updated");
    qc.invalidateQueries({ queryKey: ["projects"] });
  };

  const projects = data?.projects ?? [];

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Projects & Delivery"
        description="Manage agency client projects, milestones, progress, and budgets."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New Project
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading projects...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {projects.map(
            (p: {
              id: string;
              name: string;
              code: string;
              status: string;
              progress: number;
              budget: string | number | null;
              deadline: string | null;
              company: { name: string } | null;
              milestones: Array<{ id: string; title: string; isCompleted: boolean }>;
            }) => (
              <div key={p.id} className="nexora-glass-card p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-primary">{p.code}</span>
                    <h2 className="font-heading text-lg font-bold text-foreground">
                      {p.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Client: {p.company?.name || "Internal"} &bull; Deadline:{" "}
                      {formatDate(p.deadline)}
                    </p>
                  </div>
                  <StatusPill status={p.status} />
                </div>

                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-muted-foreground">Delivery Progress</span>
                    <span className="font-bold">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="h-2" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-foreground">
                    Budget: {p.budget ? formatCurrency(p.budget) : "—"}
                  </span>
                  <div className="flex gap-2">
                    <select
                      value={p.status}
                      onChange={(e) =>
                        updateProjectProgress(p.id, p.progress, e.target.value)
                      }
                      className="h-7 rounded border border-input bg-background px-2 text-xs"
                    >
                      <option value="PLANNING">Planning</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() =>
                        updateProjectProgress(
                          p.id,
                          Math.min(100, p.progress + 15),
                          p.status
                        )
                      }
                    >
                      +15%
                    </Button>
                  </div>
                </div>

                {/* Milestones */}
                <div className="border-t border-border pt-3 space-y-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground">
                    Milestones
                  </p>
                  {p.milestones.map((m) => (
                    <label
                      key={m.id}
                      className="flex items-center gap-2 text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={m.isCompleted}
                        onChange={() => toggleMilestone(p.id, m.id)}
                      />
                      <span
                        className={
                          m.isCompleted
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }
                      >
                        {m.title}
                      </span>
                    </label>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <Input
                      value={milestoneText[p.id] || ""}
                      onChange={(e) =>
                        setMilestoneText((prev) => ({
                          ...prev,
                          [p.id]: e.target.value,
                        }))
                      }
                      placeholder="Add milestone..."
                      className="h-8 text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addMilestone(p.id)}
                    >
                      <CheckSquare className="h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Client Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Project Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Project Code *</Label>
                <Input
                  required
                  placeholder="PRJ-202"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div>
                <Label>Budget ($)</Label>
                <Input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>
              <div>
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Save Project
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
