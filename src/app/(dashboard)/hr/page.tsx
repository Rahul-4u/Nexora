"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { DashboardPageHeader, StatusPill } from "@/components/dashboard/dashboard-widgets";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

export default function HrOperationsPage() {
  const qc = useQueryClient();
  const [selectedEmpId, setSelectedEmpId] = React.useState("");
  const [workHours, setWorkHours] = React.useState("4");
  const [workDesc, setWorkDesc] = React.useState("");

  const { data } = useQuery({
    queryKey: ["hr-data"],
    queryFn: async () => {
      const res = await fetch("/api/hr");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const employees = data?.employees ?? [];
  const attendance = data?.attendance ?? [];
  const leaves = data?.leaveRequests ?? [];
  const workLogs = data?.workLogs ?? [];

  React.useEffect(() => {
    if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].id);
    }
  }, [employees, selectedEmpId]);

  const markAttendance = async (status: string) => {
    if (!selectedEmpId) return;
    const res = await fetch("/api/hr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "attendance",
        employeeId: selectedEmpId,
        status,
      }),
    });
    if (res.ok) {
      toast.success(`Attendance recorded (${status})`);
      qc.invalidateQueries({ queryKey: ["hr-data"] });
    }
  };

  const reviewLeave = async (id: string, status: "APPROVED" | "REJECTED") => {
    const res = await fetch("/api/hr", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leaveId: id, status }),
    });
    if (res.ok) {
      toast.success(`Leave request ${status.toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ["hr-data"] });
    }
  };

  const logWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !workDesc.trim()) return;
    const res = await fetch("/api/hr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "workLog",
        employeeId: selectedEmpId,
        hours: Number(workHours),
        description: workDesc,
      }),
    });
    if (res.ok) {
      toast.success("Work log recorded");
      setWorkDesc("");
      qc.invalidateQueries({ queryKey: ["hr-data"] });
    }
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="HR Operations"
        description="Manage daily attendance, leave approvals, and billable work logs."
      />

      {/* Quick Attendance & Work Log Bar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="nexora-glass-card p-6 space-y-4">
          <h2 className="font-heading text-base font-bold">
            Record Today&apos;s Attendance
          </h2>
          <div>
            <Label>Employee</Label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              {employees.map((e: { id: string; fullName: string }) => (
                <option key={e.id} value={e.id}>
                  {e.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => markAttendance("PRESENT")}>
              Mark Present
            </Button>
            <Button size="sm" variant="outline" onClick={() => markAttendance("REMOTE")}>
              Mark Remote
            </Button>
            <Button size="sm" variant="outline" onClick={() => markAttendance("HALF_DAY")}>
              Half Day
            </Button>
          </div>
        </div>

        <div className="nexora-glass-card p-6 space-y-4">
          <h2 className="flex items-center gap-2 font-heading text-base font-bold">
            <Clock className="h-4 w-4 text-primary" /> Log Work Hours
          </h2>
          <form onSubmit={logWork} className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.5"
                min="0.5"
                value={workHours}
                onChange={(e) => setWorkHours(e.target.value)}
                className="w-24"
              />
              <Input
                placeholder="Work log description..."
                value={workDesc}
                onChange={(e) => setWorkDesc(e.target.value)}
                required
              />
              <Button type="submit" size="sm">
                <Plus className="h-4 w-4" /> Log
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Leave Requests & Recent Attendance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="nexora-glass-card p-6 space-y-3">
          <h2 className="font-heading text-base font-bold">Leave Requests</h2>
          {leaves.length === 0 ? (
            <p className="text-xs text-muted-foreground">No leave requests.</p>
          ) : (
            leaves.map(
              (l: {
                id: string;
                leaveType: string;
                startDate: string;
                endDate: string;
                reason: string;
                status: string;
                employee: { fullName: string };
              }) => (
                <div
                  key={l.id}
                  className="rounded-xl border border-border/60 bg-background/40 p-4 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      {l.employee.fullName} &bull; {l.leaveType}
                    </span>
                    <StatusPill status={l.status} />
                  </div>
                  <p className="text-muted-foreground">
                    {formatDate(l.startDate)} → {formatDate(l.endDate)} — {l.reason}
                  </p>
                  {l.status === "PENDING" && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => reviewLeave(l.id, "APPROVED")}
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => reviewLeave(l.id, "REJECTED")}
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              )
            )
          )}
        </div>

        <div className="nexora-glass-card p-6 space-y-3">
          <h2 className="font-heading text-base font-bold">
            Recent Attendance &amp; Work Logs
          </h2>
          <div className="space-y-2">
            {attendance.slice(0, 5).map(
              (a: {
                id: string;
                date: string;
                status: string;
                employee: { fullName: string };
              }) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 p-3 text-xs"
                >
                  <span className="font-semibold">{a.employee.fullName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{formatDate(a.date)}</span>
                    <StatusPill status={a.status} />
                  </div>
                </div>
              )
            )}
            {workLogs.slice(0, 5).map(
              (w: {
                id: string;
                hours: string | number;
                description: string;
                employee: { fullName: string };
              }) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 p-3 text-xs"
                >
                  <span className="truncate pr-2">
                    <strong>{w.employee.fullName}:</strong> {w.description}
                  </span>
                  <span className="font-bold text-primary">{String(w.hours)}h</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
