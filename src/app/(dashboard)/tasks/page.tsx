"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
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

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
  lead: { name: string } | null;
  deal: { title: string } | null;
  project: { name: string } | null;
  comments: Array<{ id: string; body: string; user: { name: string } }>;
}

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;

export default function TasksPage() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [commentTask, setCommentTask] = React.useState<TaskRow | null>(null);
  const [commentText, setCommentText] = React.useState("");
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    assigneeId: "",
  });

  const { data, isLoading } = useQuery<{
    tasks: TaskRow[];
    users: Array<{ id: string; name: string }>;
  }>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/crm/tasks");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/crm/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Task created");
      setOpen(false);
      setForm({ title: "", description: "", priority: "MEDIUM", dueDate: "", assigneeId: "" });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await fetch(`/api/crm/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const commentMut = useMutation({
    mutationFn: async () => {
      if (!commentTask) return;
      await fetch(`/api/crm/tasks/${commentTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentText }),
      });
    },
    onSuccess: () => {
      setCommentText("");
      toast.success("Comment added");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setCommentTask(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/crm/tasks/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const tasks = data?.tasks ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Task Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Prioritized tasks linked across leads, deals, and client projects.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {isLoading ? (
        <div className="nexora-glass-card p-8 text-sm text-muted-foreground">
          Loading tasks...
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {TASK_STATUSES.map((st) => {
            const col = tasks.filter((t) => t.status === st);
            return (
              <div key={st} className="nexora-glass-card flex flex-col p-4">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-2.5">
                  <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
                    {st.replace("_", " ")}
                  </h2>
                  <Badge variant="secondary">{col.length}</Badge>
                </div>

                <div className="space-y-3">
                  {col.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-border bg-card p-4 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading text-sm font-bold text-foreground">
                          {task.title}
                        </h3>
                        <Badge
                          variant={
                            task.priority === "URGENT"
                              ? "destructive"
                              : task.priority === "HIGH"
                                ? "warning"
                                : "outline"
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {task.description}
                        </p>
                      )}

                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Assignee: {task.assignee?.name || "Unassigned"} &bull; Due:{" "}
                        {formatDate(task.dueDate)}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5">
                        <select
                          aria-label={`Change status for ${task.title}`}
                          value={task.status}
                          onChange={(e) =>
                            updateMut.mutate({ id: task.id, status: e.target.value })
                          }
                          className="h-7 rounded border border-input bg-background px-2 text-[11px]"
                        >
                          {TASK_STATUSES.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt.replace("_", " ")}
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCommentTask(task)}
                            className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground hover:bg-muted cursor-pointer"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            {task.comments.length}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMut.mutate(task.id)}
                            aria-label="Delete task"
                            className="rounded p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
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
            <DialogTitle>Create Task</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMut.mutate();
            }}
            className="mt-4 space-y-4"
          >
            <div className="space-y-1">
              <Label>Task Title *</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Priority</Label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Assignee</Label>
              <select
                value={form.assigneeId}
                onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">Assign to me</option>
                {data?.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <Button type="submit" disabled={createMut.isPending} className="w-full">
              Create Task
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!commentTask} onOpenChange={() => setCommentTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comments — {commentTask?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            {commentTask?.comments.map((c) => (
              <div key={c.id} className="rounded-xl bg-muted/40 p-3 text-xs">
                <span className="font-bold text-foreground">{c.user.name}: </span>
                <span className="text-muted-foreground">{c.body}</span>
              </div>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (commentText.trim()) commentMut.mutate();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button type="submit" size="sm">
                Post
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
