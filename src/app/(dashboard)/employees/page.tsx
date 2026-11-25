"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { DashboardPageHeader, StatusPill } from "@/components/dashboard/dashboard-widgets";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function EmployeesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    employeeCode: "",
    fullName: "",
    email: "",
    designation: "",
    departmentId: "",
    skillsText: "",
    isPublicProfile: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["hr-data"],
    queryFn: async () => {
      const res = await fetch("/api/hr");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/hr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeCode: form.employeeCode,
        fullName: form.fullName,
        email: form.email,
        designation: form.designation,
        departmentId: form.departmentId || null,
        skills: form.skillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        isPublicProfile: form.isPublicProfile,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Could not add employee");
      return;
    }
    toast.success("Employee added");
    setOpen(false);
    setForm({
      employeeCode: "",
      fullName: "",
      email: "",
      designation: "",
      departmentId: "",
      skillsText: "",
      isPublicProfile: true,
    });
    qc.invalidateQueries({ queryKey: ["hr-data"] });
  };

  const togglePublic = async (id: string, current: boolean) => {
    const res = await fetch("/api/hr", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: id,
        isPublicProfile: !current,
      }),
    });
    if (res.ok) {
      toast.success(
        !current
          ? "Employee is now visible on public /team page"
          : "Employee hidden from public /team page"
      );
      qc.invalidateQueries({ queryKey: ["hr-data"] });
    }
  };

  const employees = data?.employees ?? [];
  const departments = data?.departments ?? [];

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Employees Directory"
        description="Manage agency staff, departments, skills, and public team profile visibility."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Employee
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading employees...</p>
        ) : (
          employees.map(
            (emp: {
              id: string;
              employeeCode: string;
              fullName: string;
              email: string;
              designation: string;
              status: string;
              isPublicProfile: boolean;
              skills: string[];
              department: { name: string } | null;
            }) => (
              <div key={emp.id} className="nexora-glass-card p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Users className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-heading text-base font-bold text-foreground">
                        {emp.fullName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {emp.designation}
                      </p>
                    </div>
                  </div>
                  <StatusPill status={emp.status} />
                </div>

                <p className="text-xs text-muted-foreground">
                  {emp.employeeCode} &bull; {emp.department?.name || "General"} &bull;{" "}
                  {emp.email}
                </p>

                {emp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {emp.skills.map((sk) => (
                      <span
                        key={sk}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    Public Team Page
                  </span>
                  <Button
                    size="sm"
                    variant={emp.isPublicProfile ? "default" : "outline"}
                    onClick={() => togglePublic(emp.id, emp.isPublicProfile)}
                  >
                    {emp.isPublicProfile ? "Visible" : "Hidden"}
                  </Button>
                </div>
              </div>
            )
          )
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Employee Code *</Label>
                <Input
                  required
                  placeholder="EMP-010"
                  value={form.employeeCode}
                  onChange={(e) =>
                    setForm({ ...form, employeeCode: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Full Name *</Label>
                <Input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Designation *</Label>
                <Input
                  required
                  value={form.designation}
                  onChange={(e) =>
                    setForm({ ...form, designation: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Department</Label>
              <select
                value={form.departmentId}
                onChange={(e) =>
                  setForm({ ...form, departmentId: e.target.value })
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">Select department</option>
                {departments.map((d: { id: string; name: string }) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Skills (comma-separated)</Label>
              <Input
                placeholder="Next.js, TypeScript, UI Systems"
                value={form.skillsText}
                onChange={(e) => setForm({ ...form, skillsText: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-medium">
              <input
                type="checkbox"
                checked={form.isPublicProfile}
                onChange={(e) =>
                  setForm({ ...form, isPublicProfile: e.target.checked })
                }
              />
              Publish profile to public /team website page
            </label>
            <Button type="submit" className="w-full">
              Save Employee
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
