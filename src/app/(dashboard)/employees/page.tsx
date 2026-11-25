"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Crown,
  Globe,
  Plus,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardPageHeader, StatusPill } from "@/components/dashboard/dashboard-widgets";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ROLES = [
  { code: "ORG_ADMIN", name: "Organization Admin" },
  { code: "HR_MANAGER", name: "HR Manager" },
  { code: "PROJECT_MANAGER", name: "Project Lead / Team Leader" },
  { code: "SALES_MANAGER", name: "Sales Manager" },
  { code: "FINANCE_MANAGER", name: "Finance Manager" },
  { code: "MARKETING", name: "Marketing Specialist" },
  { code: "EMPLOYEE", name: "Employee / Team Member" },
];

export default function EmployeesPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<"members" | "teams">("members");

  // Modals
  const [addEmpOpen, setAddEmpOpen] = React.useState(false);
  const [addTeamOpen, setAddTeamOpen] = React.useState(false);
  const [assignLeaderOpen, setAssignLeaderOpen] = React.useState(false);
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>("");
  const [selectedLeaderName, setSelectedLeaderName] = React.useState<string>("");

  // Form states
  const [empForm, setEmpForm] = React.useState({
    employeeCode: "",
    fullName: "",
    email: "",
    designation: "",
    departmentId: "",
    role: "EMPLOYEE",
    skillsText: "",
    isTeamLeader: false,
    isPublicProfile: true,
  });

  const [teamForm, setTeamForm] = React.useState({
    name: "",
    description: "",
    leaderName: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["hr-data"],
    queryFn: async () => {
      const res = await fetch("/api/hr");
      if (!res.ok) throw new Error("Failed to load HR data");
      return res.json();
    },
  });

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/hr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeCode: empForm.employeeCode,
        fullName: empForm.fullName,
        email: empForm.email,
        designation: empForm.designation,
        departmentId: empForm.departmentId || null,
        role: empForm.isTeamLeader ? "PROJECT_MANAGER" : empForm.role,
        skills: empForm.skillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        isTeamLeader: empForm.isTeamLeader,
        isPublicProfile: empForm.isPublicProfile,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Could not add team member");
      return;
    }
    toast.success(`Added ${empForm.fullName} to team roster!`);
    setAddEmpOpen(false);
    setEmpForm({
      employeeCode: "",
      fullName: "",
      email: "",
      designation: "",
      departmentId: "",
      role: "EMPLOYEE",
      skillsText: "",
      isTeamLeader: false,
      isPublicProfile: true,
    });
    qc.invalidateQueries({ queryKey: ["hr-data"] });
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/hr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "department",
        name: teamForm.name,
        description: teamForm.description,
        leaderName: teamForm.leaderName,
      }),
    });
    if (!res.ok) {
      toast.error("Could not create team");
      return;
    }
    toast.success(`Team "${teamForm.name}" created successfully!`);
    setAddTeamOpen(false);
    setTeamForm({ name: "", description: "", leaderName: "" });
    qc.invalidateQueries({ queryKey: ["hr-data"] });
  };

  const handleAssignLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !selectedLeaderName) return;

    const res = await fetch("/api/hr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "assign_leader",
        teamId: selectedTeamId,
        leaderName: selectedLeaderName,
      }),
    });
    if (res.ok) {
      toast.success(`Assigned ${selectedLeaderName} as Team Leader!`);
      setAssignLeaderOpen(false);
      qc.invalidateQueries({ queryKey: ["hr-data"] });
    } else {
      toast.error("Could not assign team leader");
    }
  };

  const handleChangeRole = async (employeeId: string, newRole: string) => {
    const res = await fetch("/api/hr", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, role: newRole }),
    });
    if (res.ok) {
      toast.success("Role updated successfully!");
      qc.invalidateQueries({ queryKey: ["hr-data"] });
    } else {
      toast.error("Failed to update role");
    }
  };

  const togglePublic = async (id: string, current: boolean) => {
    const res = await fetch("/api/hr", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: id, isPublicProfile: !current }),
    });
    if (res.ok) {
      toast.success(
        !current
          ? "Member is now visible on public /team page"
          : "Member hidden from public /team page"
      );
      qc.invalidateQueries({ queryKey: ["hr-data"] });
    }
  };

  const employees = data?.employees ?? [];
  const departments = data?.departments ?? [];

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Teams, Leaders & Roster"
        description="Organize your agency into specialized teams, assign leaders, and manage member roles."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddTeamOpen(true)}
              className="gap-1.5"
            >
              <Briefcase className="h-3.5 w-3.5 text-primary" /> Create Team
            </Button>
            <Button
              size="sm"
              onClick={() => setAddEmpOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Member
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-sm font-semibold transition cursor-pointer ${
            activeTab === "members"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Members &amp; Role Management ({employees.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("teams")}
          className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-sm font-semibold transition cursor-pointer ${
            activeTab === "teams"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Crown className="h-4 w-4" />
          <span>Teams &amp; Leaders ({departments.length})</span>
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading agency data...</p>
      ) : activeTab === "members" ? (
        /* MEMBERS & ROLES VIEW */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map(
            (emp: {
              id: string;
              employeeCode: string;
              fullName: string;
              email: string;
              designation: string;
              role?: string;
              status?: string;
              isTeamLeader?: boolean;
              isPublicProfile: boolean;
              skills: string[];
              department: { name: string } | null;
            }) => (
              <div key={emp.id} className="nexora-glass-card p-5 space-y-3.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Users className="h-5 w-5" />
                      {emp.isTeamLeader && (
                        <span
                          title="Team Leader"
                          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white"
                        >
                          <Crown className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-heading text-base font-bold text-foreground">
                          {emp.fullName}
                        </h3>
                        {emp.isTeamLeader && (
                          <Badge variant="secondary" className="text-[10px] bg-amber-500/15 text-amber-500 py-0">
                            Leader
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {emp.designation}
                      </p>
                    </div>
                  </div>
                  <StatusPill status={emp.status || "ACTIVE"} />
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Team:</span>{" "}
                    {emp.department?.name || "General Agency"}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Email:</span>{" "}
                    {emp.email}
                  </p>
                </div>

                {/* Role Management Dropdown */}
                <div className="border-t border-border pt-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Shield className="h-3.5 w-3.5 text-primary" /> Role:
                    </span>
                    <select
                      value={emp.role || "EMPLOYEE"}
                      onChange={(e) => handleChangeRole(emp.id, e.target.value)}
                      className="h-7 rounded border border-border bg-background px-2 text-xs font-semibold text-foreground outline-none focus:border-primary"
                    >
                      {ROLES.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {emp.skills && emp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {emp.skills.slice(0, 4).map((sk) => (
                      <span
                        key={sk}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border pt-2.5 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Globe className="h-3.5 w-3.5 text-primary" /> Public /team
                  </span>
                  <Button
                    size="sm"
                    variant={emp.isPublicProfile ? "default" : "outline"}
                    className="h-7 text-xs"
                    onClick={() => togglePublic(emp.id, emp.isPublicProfile)}
                  >
                    {emp.isPublicProfile ? "Visible" : "Hidden"}
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        /* TEAMS & LEADERS VIEW */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map(
            (dept: {
              id: string;
              name: string;
              description: string | null;
              leaderName?: string | null;
              _count?: { employees: number };
            }) => (
              <div key={dept.id} className="nexora-glass-card p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Briefcase className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-heading text-base font-bold text-foreground">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {dept._count?.employees || 1} Assigned Members
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {dept.description || "Core engineering and client execution team."}
                </p>

                {/* Team Leader Card */}
                <div className="rounded-xl border border-border/80 bg-muted/40 p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                      <Crown className="h-3 w-3 text-amber-500" /> Team Leader
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTeamId(dept.id);
                        setSelectedLeaderName(dept.leaderName || "");
                        setAssignLeaderOpen(true);
                      }}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {dept.leaderName ? "Change" : "Assign"}
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {dept.leaderName || "No leader assigned"}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="text-muted-foreground">Permissions:</span>
                  <Badge variant="outline" className="text-[10px]">
                    Project &amp; Member Authority
                  </Badge>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* MODAL: ADD EMPLOYEE */}
      <Dialog open={addEmpOpen} onOpenChange={setAddEmpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEmployee} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Employee Code *</Label>
                <Input
                  required
                  placeholder="NX-108"
                  value={empForm.employeeCode}
                  onChange={(e) =>
                    setEmpForm({ ...empForm, employeeCode: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Full Name *</Label>
                <Input
                  required
                  placeholder="Tanvir Ahmed"
                  value={empForm.fullName}
                  onChange={(e) =>
                    setEmpForm({ ...empForm, fullName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Work Email *</Label>
                <Input
                  type="email"
                  required
                  placeholder="tanvir@nexora.agency"
                  value={empForm.email}
                  onChange={(e) =>
                    setEmpForm({ ...empForm, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Designation *</Label>
                <Input
                  required
                  placeholder="Full-Stack Developer"
                  value={empForm.designation}
                  onChange={(e) =>
                    setEmpForm({ ...empForm, designation: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Assign Team</Label>
                <select
                  value={empForm.departmentId}
                  onChange={(e) =>
                    setEmpForm({ ...empForm, departmentId: e.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select team / department</option>
                  {departments.map((d: { id: string; name: string }) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Initial Role</Label>
                <select
                  value={empForm.role}
                  onChange={(e) =>
                    setEmpForm({ ...empForm, role: e.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Skills (comma-separated)</Label>
              <Input
                placeholder="React, Next.js, Node.js, PostgreSQL"
                value={empForm.skillsText}
                onChange={(e) =>
                  setEmpForm({ ...empForm, skillsText: e.target.value })
                }
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={empForm.isTeamLeader}
                  onChange={(e) =>
                    setEmpForm({ ...empForm, isTeamLeader: e.target.checked })
                  }
                />
                <Crown className="h-3.5 w-3.5 text-amber-500" />
                Assign as Team Leader (grants Project Manager authority)
              </label>

              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={empForm.isPublicProfile}
                  onChange={(e) =>
                    setEmpForm({ ...empForm, isPublicProfile: e.target.checked })
                  }
                />
                Publish profile to public /team website page
              </label>
            </div>

            <Button type="submit" className="w-full">
              Save Member
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: CREATE TEAM */}
      <Dialog open={addTeamOpen} onOpenChange={setAddTeamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Agency Team</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTeam} className="space-y-3">
            <div>
              <Label>Team Name *</Label>
              <Input
                required
                placeholder="e.g. Next.js & React Core Team"
                value={teamForm.name}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Description / Specialty</Label>
              <Input
                placeholder="Specialized in building full-stack web platforms and client APIs."
                value={teamForm.description}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Assign Initial Team Leader</Label>
              <select
                value={teamForm.leaderName}
                onChange={(e) =>
                  setTeamForm({ ...teamForm, leaderName: e.target.value })
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">Select team leader</option>
                {employees.map((emp: { id: string; fullName: string }) => (
                  <option key={emp.id} value={emp.fullName}>
                    {emp.fullName}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full">
              Create Team
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: ASSIGN TEAM LEADER */}
      <Dialog open={assignLeaderOpen} onOpenChange={setAssignLeaderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Team Leader</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignLeader} className="space-y-4">
            <div>
              <Label>Select Team Leader</Label>
              <select
                value={selectedLeaderName}
                onChange={(e) => setSelectedLeaderName(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm mt-1.5"
              >
                <option value="">Choose employee...</option>
                {employees.map((emp: { id: string; fullName: string; designation: string }) => (
                  <option key={emp.id} value={emp.fullName}>
                    {emp.fullName} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              Team leaders can oversee all deliverables, milestones, and members assigned to their team.
            </p>
            <Button type="submit" className="w-full">
              Confirm Leader Assignment
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
