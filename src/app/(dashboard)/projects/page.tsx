"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  CheckSquare,
  Clock,
  Crown,
  Filter,
  FolderGit2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardPageHeader, StatusPill } from "@/components/dashboard/dashboard-widgets";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string | null;
}

interface Project {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  status: "PLANNING" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | "ON_HOLD";
  progress: number;
  budget: string | number | null;
  deadline: string | null;
  company?: { id?: string; name: string } | null;
  teamName?: string | null;
  teamLeader?: string | null;
  milestones: Milestone[];
}

interface Team {
  id: string;
  name: string;
  leaderName: string | null;
  memberCount: number;
}

export default function ProjectsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState<string>("ALL");
  const [milestoneText, setMilestoneText] = React.useState<Record<string, string>>({});

  const [form, setForm] = React.useState({
    name: "",
    code: "",
    clientName: "NovaTech Solutions",
    teamName: "Frontend & Web Engineering",
    teamLeader: "Alex Rivera",
    budget: "35000",
    status: "PLANNING",
    deadline: "",
    description: "",
    initialMilestone: "Sprint 1: Architecture, wireframes & project kickoff",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      return res.json();
    },
  });

  const { data: hrData } = useQuery({
    queryKey: ["hr-teams"],
    queryFn: async () => {
      const res = await fetch("/api/hr");
      if (!res.ok) return { departments: [] };
      return res.json();
    },
  });

  // Combine teams from projects and HR API
  const teams: Team[] = React.useMemo(() => {
    if (data?.teams && Array.isArray(data.teams) && data.teams.length > 0) {
      return data.teams;
    }
    if (hrData?.departments && Array.isArray(hrData.departments) && hrData.departments.length > 0) {
      return hrData.departments;
    }
    return [
      { id: "team-1", name: "Frontend & Web Engineering", leaderName: "Alex Rivera", memberCount: 5 },
      { id: "team-2", name: "Backend, Cloud & DevOps", leaderName: "David Chen", memberCount: 4 },
      { id: "team-3", name: "UI/UX & Creative Product Studio", leaderName: "Sarah Jenkins", memberCount: 3 },
      { id: "team-4", name: "Mobile App & Flutter Development", leaderName: "Marcus Vance", memberCount: 3 },
    ];
  }, [data?.teams, hrData?.departments]);

  const handleTeamChange = (tName: string) => {
    const found = teams.find((t) => t.name === tName);
    setForm((prev) => ({
      ...prev,
      teamName: tName,
      teamLeader: found?.leaderName || prev.teamLeader,
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      code: form.code || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      budget: Number(form.budget) || null,
      status: form.status,
      deadline: form.deadline || null,
      description: form.description || null,
      companyName: form.clientName,
      teamName: form.teamName,
      teamLeader: form.teamLeader,
      milestones: form.initialMilestone ? [form.initialMilestone] : undefined,
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Could not create project");
      return;
    }
    toast.success(`Project "${form.name}" created successfully!`);
    setOpen(false);
    setForm({
      name: "",
      code: "",
      clientName: "NovaTech Solutions",
      teamName: "Frontend & Web Engineering",
      teamLeader: "Alex Rivera",
      budget: "35000",
      status: "PLANNING",
      deadline: "",
      description: "",
      initialMilestone: "Sprint 1: Architecture, wireframes & project kickoff",
    });
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
    toast.success("Milestone added");
    qc.invalidateQueries({ queryKey: ["projects"] });
  };

  const updateProjectProgress = async (id: string, progress: number, status?: string) => {
    const boundedProgress = Math.max(0, Math.min(100, progress));
    let nextStatus = status;
    if (!nextStatus) {
      if (boundedProgress === 100) nextStatus = "COMPLETED";
      else if (boundedProgress > 0) nextStatus = "IN_PROGRESS";
    }

    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress: boundedProgress, status: nextStatus }),
    });
    toast.success(`Project updated to ${boundedProgress}%`);
    qc.invalidateQueries({ queryKey: ["projects"] });
  };

  const updateProjectStatus = async (id: string, currentProgress: number, status: string) => {
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress: currentProgress, status }),
    });
    toast.success(`Status changed to ${status}`);
    qc.invalidateQueries({ queryKey: ["projects"] });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`Project "${name}" deleted`);
      qc.invalidateQueries({ queryKey: ["projects"] });
    } else {
      toast.error("Failed to delete project");
    }
  };

  const rawProjects: Project[] = data?.projects ?? [];
  const projects = React.useMemo(() => {
    if (filterStatus === "ALL") return rawProjects;
    return rawProjects.filter((p) => p.status === filterStatus);
  }, [rawProjects, filterStatus]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Projects & Client Delivery"
        description="Track agency client deliverables, assign teams & leaders, monitor milestones and budgets."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" /> New Project
            </Button>
          </div>
        }
      />

      {/* Filter and stats row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Filter:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "ALL", label: "All Projects" },
              { id: "IN_PROGRESS", label: "In Progress" },
              { id: "PLANNING", label: "Planning" },
              { id: "COMPLETED", label: "Completed" },
              { id: "ON_HOLD", label: "On Hold" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  filterStatus === f.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{projects.length}</span> of{" "}
          <span className="font-semibold text-foreground">{rawProjects.length}</span> projects
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4 animate-spin" /> Loading client projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <FolderGit2 className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2" />
          <p className="font-medium text-foreground">No projects match this filter</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create a new client project or switch the status filter above.
          </p>
          <Button size="sm" onClick={() => setOpen(true)} className="mt-4 gap-1.5">
            <Plus className="h-4 w-4" /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {projects.map((p) => (
            <div
              key={p.id}
              className="nexora-glass-card p-6 space-y-4 rounded-xl border border-border/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Code, Title, Delete, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary tracking-wide">
                        {p.code}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Client: <strong className="text-foreground">{p.company?.name || "Direct Client"}</strong>
                      </span>
                    </div>
                    <h2 className="font-heading text-lg font-bold text-foreground leading-tight">
                      {p.name}
                    </h2>
                    {p.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {p.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusPill status={p.status} />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(p.id, p.name)}
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Team & Leader Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>Team: {p.teamName || "Engineering Team"}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                    <span>Lead: {p.teamLeader || "Alex Rivera"}</span>
                  </div>
                  {p.deadline && (
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Due: {formatDate(p.deadline)}</span>
                    </div>
                  )}
                </div>

                {/* Delivery Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">Project Delivery</span>
                    <span className="font-bold text-foreground">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="h-2.5" />
                </div>

                {/* Quick Progress & Status Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                  <span className="font-bold text-foreground">
                    Budget: {p.budget ? formatCurrency(p.budget) : "Fixed Scope"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={p.status}
                      onChange={(e) => updateProjectStatus(p.id, p.progress, e.target.value)}
                      className="h-7 rounded-md border border-input bg-background px-2 text-xs font-medium"
                    >
                      <option value="PLANNING">Planning</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="COMPLETED">Completed</option>
                    </select>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => updateProjectProgress(p.id, p.progress - 10, p.status)}
                      title="Decrease 10%"
                    >
                      -10%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => updateProjectProgress(p.id, p.progress + 15, p.status)}
                      title="Advance 15%"
                    >
                      +15%
                    </Button>
                    <Button
                      size="sm"
                      variant={p.progress === 100 ? "default" : "secondary"}
                      className="h-7 px-2 text-xs font-medium"
                      onClick={() => updateProjectProgress(p.id, 100, "COMPLETED")}
                    >
                      100% Done
                    </Button>
                  </div>
                </div>

                {/* Milestones & Sprint Deliverables */}
                <div className="border-t border-border/80 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Agency Milestones ({p.milestones?.filter((m) => m.isCompleted).length || 0}/
                      {p.milestones?.length || 0})
                    </p>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {(p.milestones || []).map((m) => (
                      <label
                        key={m.id}
                        className="flex items-center gap-2.5 rounded-lg border border-border/40 p-2 text-xs cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={m.isCompleted}
                          onChange={() => toggleMilestone(p.id, m.id)}
                          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                        />
                        <span
                          className={`flex-1 ${
                            m.isCompleted
                              ? "line-through text-muted-foreground/80 font-normal"
                              : "text-foreground font-medium"
                          }`}
                        >
                          {m.title}
                        </span>
                        {m.isCompleted && (
                          <Badge variant="outline" className="text-[10px] py-0 text-emerald-600 border-emerald-500/30">
                            Completed
                          </Badge>
                        )}
                      </label>
                    ))}
                  </div>

                  {/* Add Milestone input */}
                  <div className="flex gap-2 pt-1.5">
                    <Input
                      value={milestoneText[p.id] || ""}
                      onChange={(e) =>
                        setMilestoneText((prev) => ({
                          ...prev,
                          [p.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addMilestone(p.id);
                        }
                      }}
                      placeholder="Add deliverables/sprint milestone..."
                      className="h-8 text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs gap-1"
                      onClick={() => addMilestone(p.id)}
                    >
                      <CheckSquare className="h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Create Client Project
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Project Name *</Label>
                <Input
                  required
                  placeholder="e.g. Enterprise Fintech Portal"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Project Code *</Label>
                <Input
                  required
                  placeholder="e.g. PRJ-EFP"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>

              <div>
                <Label>Client / Organization</Label>
                <Input
                  placeholder="e.g. NovaTech Solutions"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                />
              </div>

              <div>
                <Label>Assign Team</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.teamName}
                  onChange={(e) => handleTeamChange(e.target.value)}
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Team Leader</Label>
                <Input
                  placeholder="e.g. Alex Rivera"
                  value={form.teamLeader}
                  onChange={(e) => setForm({ ...form, teamLeader: e.target.value })}
                />
              </div>

              <div>
                <Label>Initial Status</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="PLANNING">Planning</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <Label>Budget ($ USD)</Label>
                <Input
                  type="number"
                  placeholder="35000"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>

              <div>
                <Label>Deadline Date</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>First Sprint / Milestone</Label>
              <Input
                placeholder="e.g. Discovery, Architecture & Figma Wireframes"
                value={form.initialMilestone}
                onChange={(e) => setForm({ ...form, initialMilestone: e.target.value })}
              />
            </div>

            <div>
              <Label>Project Scope / Description</Label>
              <Input
                placeholder="Brief summary of requirements, tech stack, and deliverable goals..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create & Assign Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
