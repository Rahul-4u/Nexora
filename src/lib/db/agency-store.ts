import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  isCompleted: boolean;
  dueDate: string | null;
  position: number;
}

export interface ProjectMember {
  id: string;
  role: string;
  user: { id: string; name: string };
}

export interface AgencyProject {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: "PLANNING" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
  progress: number;
  budget: number | null;
  startDate: string | null;
  deadline: string | null;
  companyId?: string | null;
  company: { id: string; name: string } | null;
  teamName?: string | null;
  teamLeader?: string | null;
  members: ProjectMember[];
  milestones: ProjectMilestone[];
  _count: { tasks: number; invoices: number };
  createdAt: string;
}

export interface AgencyTeam {
  id: string;
  name: string;
  description: string | null;
  leaderId: string | null;
  leaderName: string | null;
  memberCount: number;
  activeProjects: number;
  createdAt: string;
}

export interface AgencyEmployee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  designation: string;
  role: string;
  departmentId: string | null;
  department: { id: string; name: string } | null;
  isTeamLeader: boolean;
  isPublicProfile: boolean;
  skills: string[];
  joinedAt: string;
}

export interface AgencyUserMembership {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    lastLoginAt: string | null;
  };
  role: {
    id: string;
    code: string;
    name: string;
  };
}

export interface AgencyStoreState {
  projects: AgencyProject[];
  teams: AgencyTeam[];
  employees: AgencyEmployee[];
  memberships: AgencyUserMembership[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "agency-store.json");

const INITIAL_TEAMS: AgencyTeam[] = [
  {
    id: "team-1",
    name: "Frontend & Web Engineering",
    description: "Next.js, React, TypeScript, and modern responsive UI development.",
    leaderId: "emp-1",
    leaderName: "Alex Rivera",
    memberCount: 5,
    activeProjects: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "team-2",
    name: "Backend, Cloud & DevOps",
    description: "High-performance Node APIs, PostgreSQL, Docker, and AWS infra.",
    leaderId: "emp-2",
    leaderName: "David Chen",
    memberCount: 4,
    activeProjects: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "team-3",
    name: "UI/UX & Creative Product Studio",
    description: "Design systems, user experience journeys, Figma interactive mockups.",
    leaderId: "emp-3",
    leaderName: "Sarah Jenkins",
    memberCount: 3,
    activeProjects: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "team-4",
    name: "Digital Marketing & Growth Strategy",
    description: "SEO, conversion rate optimization, B2B campaigns, and lead acquisition.",
    leaderId: "emp-4",
    leaderName: "Liam O'Connor",
    memberCount: 3,
    activeProjects: 1,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_EMPLOYEES: AgencyEmployee[] = [
  {
    id: "emp-1",
    employeeCode: "NX-101",
    fullName: "Alex Rivera",
    email: "admin@nexora.agency",
    designation: "Head of Engineering & Principal Architect",
    role: "SUPER_ADMIN",
    departmentId: "team-1",
    department: { id: "team-1", name: "Frontend & Web Engineering" },
    isTeamLeader: true,
    isPublicProfile: true,
    skills: ["Next.js", "React 19", "TypeScript", "Tailwind CSS", "Architecture"],
    joinedAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "emp-2",
    employeeCode: "NX-102",
    fullName: "David Chen",
    email: "finance@nexora.agency",
    designation: "Lead Cloud & Database Engineer",
    role: "FINANCE_MANAGER",
    departmentId: "team-2",
    department: { id: "team-2", name: "Backend, Cloud & DevOps" },
    isTeamLeader: true,
    isPublicProfile: true,
    skills: ["PostgreSQL", "Node.js", "Prisma", "Docker", "DevOps"],
    joinedAt: "2024-03-01T00:00:00.000Z",
  },
  {
    id: "emp-3",
    employeeCode: "NX-103",
    fullName: "Sarah Jenkins",
    email: "pm@nexora.agency",
    designation: "Senior Project & Delivery Lead",
    role: "PROJECT_MANAGER",
    departmentId: "team-3",
    department: { id: "team-3", name: "UI/UX & Creative Product Studio" },
    isTeamLeader: true,
    isPublicProfile: true,
    skills: ["Scrum / Agile", "Client Delivery", "Figma", "Design Systems"],
    joinedAt: "2024-04-10T00:00:00.000Z",
  },
  {
    id: "emp-4",
    employeeCode: "NX-104",
    fullName: "Elena Rostova",
    email: "hr@nexora.agency",
    designation: "Director of People & Talent Acquisition",
    role: "HR_MANAGER",
    departmentId: "team-1",
    department: { id: "team-1", name: "Frontend & Web Engineering" },
    isTeamLeader: false,
    isPublicProfile: true,
    skills: ["Technical Recruitment", "Team Culture", "HR Policies", "Operations"],
    joinedAt: "2024-02-01T00:00:00.000Z",
  },
  {
    id: "emp-5",
    employeeCode: "NX-105",
    fullName: "Marcus Vance",
    email: "sales@nexora.agency",
    designation: "Enterprise Accounts & Sales Lead",
    role: "SALES_MANAGER",
    departmentId: "team-4",
    department: { id: "team-4", name: "Digital Marketing & Growth Strategy" },
    isTeamLeader: false,
    isPublicProfile: true,
    skills: ["Client Solutions", "B2B Deals", "CRM Pipeline", "Contracts"],
    joinedAt: "2024-05-15T00:00:00.000Z",
  },
  {
    id: "emp-6",
    employeeCode: "NX-106",
    fullName: "Liam O'Connor",
    email: "marketing@nexora.agency",
    designation: "Digital Growth & Content Strategist",
    role: "MARKETING",
    departmentId: "team-4",
    department: { id: "team-4", name: "Digital Marketing & Growth Strategy" },
    isTeamLeader: true,
    isPublicProfile: true,
    skills: ["Growth Hacking", "SEO Strategy", "Content Marketing", "Analytics"],
    joinedAt: "2024-06-01T00:00:00.000Z",
  },
];

const INITIAL_PROJECTS: AgencyProject[] = [
  {
    id: "prj-1",
    name: "NovaTech Multi-Tenant SaaS Platform",
    code: "NOV-01",
    description: "Full redesign and development of an enterprise cloud management dashboard with multi-tenant architecture.",
    status: "IN_PROGRESS",
    progress: 75,
    budget: 45000,
    startDate: "2026-09-01T00:00:00.000Z",
    deadline: "2026-12-15T00:00:00.000Z",
    company: { id: "cmp-1", name: "NovaTech Solutions" },
    teamName: "Frontend & Web Engineering",
    teamLeader: "Alex Rivera",
    members: [
      { id: "pm-1", role: "Project Lead", user: { id: "emp-1", name: "Alex Rivera" } },
      { id: "pm-2", role: "Senior Developer", user: { id: "emp-2", name: "David Chen" } },
    ],
    milestones: [
      { id: "ms-1", projectId: "prj-1", title: "Discovery, Wireframes & UX Flow", isCompleted: true, dueDate: "2026-09-20", position: 1 },
      { id: "ms-2", projectId: "prj-1", title: "Figma Component Design Tokens", isCompleted: true, dueDate: "2026-10-10", position: 2 },
      { id: "ms-3", projectId: "prj-1", title: "Full-Stack Dashboard Integration", isCompleted: true, dueDate: "2026-11-05", position: 3 },
      { id: "ms-4", projectId: "prj-1", title: "End-to-End QA, Security & Client Sign-off", isCompleted: false, dueDate: "2026-12-10", position: 4 },
    ],
    _count: { tasks: 8, invoices: 2 },
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "prj-2",
    name: "Apex Global Cloud Infrastructure & API",
    code: "APX-02",
    description: "Scalable microservices migration and PostgreSQL database optimization for high-concurrency workloads.",
    status: "IN_PROGRESS",
    progress: 45,
    budget: 68000,
    startDate: "2026-10-01T00:00:00.000Z",
    deadline: "2027-01-20T00:00:00.000Z",
    company: { id: "cmp-2", name: "Apex Design Co" },
    teamName: "Backend, Cloud & DevOps",
    teamLeader: "David Chen",
    members: [
      { id: "pm-3", role: "Technical Lead", user: { id: "emp-2", name: "David Chen" } },
    ],
    milestones: [
      { id: "ms-5", projectId: "prj-2", title: "Infrastructure Audit & Benchmarks", isCompleted: true, dueDate: "2026-10-15", position: 1 },
      { id: "ms-6", projectId: "prj-2", title: "Database Schema & Migration Scripts", isCompleted: true, dueDate: "2026-11-15", position: 2 },
      { id: "ms-7", projectId: "prj-2", title: "API Gateway & Load Testing", isCompleted: false, dueDate: "2026-12-20", position: 3 },
    ],
    _count: { tasks: 6, invoices: 1 },
    createdAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "prj-3",
    name: "Horizon Capital Brand Identity & Digital Presence",
    code: "HRZ-03",
    description: "Comprehensive luxury fintech brand guidelines, stationery, and conversion-focused web presence.",
    status: "COMPLETED",
    progress: 100,
    budget: 32000,
    startDate: "2026-08-01T00:00:00.000Z",
    deadline: "2026-10-30T00:00:00.000Z",
    company: { id: "cmp-3", name: "Horizon Capital" },
    teamName: "UI/UX & Creative Product Studio",
    teamLeader: "Sarah Jenkins",
    members: [
      { id: "pm-4", role: "Creative Director", user: { id: "emp-3", name: "Sarah Jenkins" } },
    ],
    milestones: [
      { id: "ms-8", projectId: "prj-3", title: "Brand Identity Guide & Logo System", isCompleted: true, dueDate: "2026-08-25", position: 1 },
      { id: "ms-9", projectId: "prj-3", title: "Marketing Collateral & Templates", isCompleted: true, dueDate: "2026-09-15", position: 2 },
      { id: "ms-10", projectId: "prj-3", title: "Final Asset Delivery & Deployment", isCompleted: true, dueDate: "2026-10-25", position: 3 },
    ],
    _count: { tasks: 5, invoices: 2 },
    createdAt: "2026-08-01T00:00:00.000Z",
  },
];

const INITIAL_MEMBERSHIPS: AgencyUserMembership[] = [
  {
    id: "mem-1",
    user: { id: "u-1", name: "Alex Rivera", email: "admin@nexora.agency", lastLoginAt: new Date().toISOString() },
    role: { id: "r-1", code: "SUPER_ADMIN", name: "Super Administrator" },
  },
  {
    id: "mem-2",
    user: { id: "u-2", name: "Elena Rostova", email: "hr@nexora.agency", lastLoginAt: new Date().toISOString() },
    role: { id: "r-2", code: "HR_MANAGER", name: "HR Manager" },
  },
  {
    id: "mem-3",
    user: { id: "u-3", name: "Sarah Jenkins", email: "pm@nexora.agency", lastLoginAt: new Date().toISOString() },
    role: { id: "r-3", code: "PROJECT_MANAGER", name: "Project Lead" },
  },
  {
    id: "mem-4",
    user: { id: "u-4", name: "David Chen", email: "finance@nexora.agency", lastLoginAt: new Date().toISOString() },
    role: { id: "r-4", code: "FINANCE_MANAGER", name: "Finance Manager" },
  },
  {
    id: "mem-5",
    user: { id: "u-5", name: "Marcus Vance", email: "sales@nexora.agency", lastLoginAt: new Date().toISOString() },
    role: { id: "r-5", code: "SALES_MANAGER", name: "Sales Manager" },
  },
  {
    id: "mem-6",
    user: { id: "u-6", name: "Liam O'Connor", email: "marketing@nexora.agency", lastLoginAt: new Date().toISOString() },
    role: { id: "r-6", code: "MARKETING", name: "Marketing Specialist" },
  },
];

class AgencyStore {
  private state: AgencyStoreState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AgencyStoreState {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, "utf-8");
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Failed to read agency store from disk:", e);
    }

    return {
      projects: INITIAL_PROJECTS,
      teams: INITIAL_TEAMS,
      employees: INITIAL_EMPLOYEES,
      memberships: INITIAL_MEMBERSHIPS,
    };
  }

  private saveState(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.state, null, 2), "utf-8");
    } catch (e) {
      console.warn("Failed to write agency store to disk:", e);
    }
  }

  // --- PROJECTS ---
  public getProjects(): AgencyProject[] {
    return this.state.projects;
  }

  public getProject(id: string): AgencyProject | undefined {
    return this.state.projects.find((p) => p.id === id);
  }

  public createProject(input: {
    name: string;
    code?: string;
    description?: string;
    status?: "PLANNING" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
    progress?: number;
    budget?: number | null;
    deadline?: string | null;
    startDate?: string | null;
    companyName?: string;
    teamName?: string;
    teamLeader?: string;
    initialMilestones?: string[];
  }): AgencyProject {
    const id = `prj-${crypto.randomBytes(3).toString("hex")}`;
    const code = input.code?.trim() || `PRJ-${Math.floor(100 + Math.random() * 900)}`;

    const milestones: ProjectMilestone[] = (input.initialMilestones || [
      "Requirements & Kickoff",
      "Design & Architecture Review",
      "Development Sprint",
      "Testing & Client Delivery",
    ]).map((title, idx) => ({
      id: `ms-${crypto.randomBytes(3).toString("hex")}`,
      projectId: id,
      title,
      isCompleted: idx === 0,
      dueDate: input.deadline || null,
      position: idx + 1,
    }));

    const newProject: AgencyProject = {
      id,
      name: input.name.trim(),
      code: code.toUpperCase(),
      description: input.description?.trim() || null,
      status: input.status || "PLANNING",
      progress: input.progress ?? (milestones.filter((m) => m.isCompleted).length / milestones.length) * 100,
      budget: input.budget ? Number(input.budget) : 25000,
      startDate: input.startDate || new Date().toISOString(),
      deadline: input.deadline || null,
      company: input.companyName ? { id: `cmp-${Date.now()}`, name: input.companyName } : { id: "cmp-default", name: "Direct Client" },
      teamName: input.teamName || "Engineering Team",
      teamLeader: input.teamLeader || "Alex Rivera",
      members: [
        {
          id: `pm-${Date.now()}`,
          role: "Team Lead",
          user: { id: "lead-1", name: input.teamLeader || "Alex Rivera" },
        },
      ],
      milestones,
      _count: { tasks: 4, invoices: 1 },
      createdAt: new Date().toISOString(),
    };

    this.state.projects.unshift(newProject);
    this.saveState();
    return newProject;
  }

  public updateProject(
    id: string,
    updates: Partial<AgencyProject>
  ): AgencyProject | null {
    const idx = this.state.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const existing = this.state.projects[idx];
    const updated = { ...existing, ...updates };

    // Recalculate progress if milestones changed
    if (updated.milestones && updated.milestones.length > 0) {
      const completed = updated.milestones.filter((m) => m.isCompleted).length;
      updated.progress = Math.round((completed / updated.milestones.length) * 100);
      if (updated.progress === 100) updated.status = "COMPLETED";
      else if (updated.progress > 0 && updated.status === "PLANNING") updated.status = "IN_PROGRESS";
    }

    this.state.projects[idx] = updated;
    this.saveState();
    return updated;
  }

  public toggleMilestone(projectId: string, milestoneId: string): boolean {
    const project = this.getProject(projectId);
    if (!project) return false;

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return false;

    milestone.isCompleted = !milestone.isCompleted;
    const completed = project.milestones.filter((m) => m.isCompleted).length;
    project.progress = Math.round((completed / project.milestones.length) * 100);
    if (project.progress === 100) project.status = "COMPLETED";
    else if (project.progress > 0 && project.status === "PLANNING") project.status = "IN_PROGRESS";

    this.saveState();
    return true;
  }

  public addMilestone(
    projectId: string,
    title: string,
    dueDate?: string | null
  ): ProjectMilestone | null {
    const project = this.getProject(projectId);
    if (!project) return null;

    const newMilestone: ProjectMilestone = {
      id: `ms-${crypto.randomBytes(3).toString("hex")}`,
      projectId,
      title: title.trim(),
      isCompleted: false,
      dueDate: dueDate || null,
      position: project.milestones.length + 1,
    };

    project.milestones.push(newMilestone);
    const completed = project.milestones.filter((m) => m.isCompleted).length;
    project.progress = Math.round((completed / project.milestones.length) * 100);
    this.saveState();
    return newMilestone;
  }

  public deleteProject(id: string): boolean {
    const before = this.state.projects.length;
    this.state.projects = this.state.projects.filter((p) => p.id !== id);
    if (this.state.projects.length !== before) {
      this.saveState();
      return true;
    }
    return false;
  }

  // --- TEAMS / DEPARTMENTS ---
  public getTeams(): AgencyTeam[] {
    return this.state.teams;
  }

  public createTeam(
    name: string,
    description?: string | null,
    leaderName?: string | null
  ): AgencyTeam {
    const newTeam: AgencyTeam = {
      id: `team-${crypto.randomBytes(3).toString("hex")}`,
      name: name.trim(),
      description: description?.trim() || null,
      leaderId: null,
      leaderName: leaderName?.trim() || "Unassigned",
      memberCount: 1,
      activeProjects: 0,
      createdAt: new Date().toISOString(),
    };

    this.state.teams.push(newTeam);
    this.saveState();
    return newTeam;
  }

  public assignTeamLeader(teamId: string, leaderName: string): boolean {
    const team = this.state.teams.find((t) => t.id === teamId);
    if (!team) return false;

    team.leaderName = leaderName.trim();

    // Also mark employee as team leader
    const emp = this.state.employees.find(
      (e) => e.fullName.toLowerCase() === leaderName.trim().toLowerCase()
    );
    if (emp) {
      emp.isTeamLeader = true;
      emp.role = "PROJECT_MANAGER";
    }

    this.saveState();
    return true;
  }

  // --- EMPLOYEES & USERS ---
  public getEmployees(): AgencyEmployee[] {
    return this.state.employees;
  }

  public createEmployee(input: {
    fullName: string;
    email: string;
    designation: string;
    departmentId?: string | null;
    role?: string;
    skills?: string[];
    isPublicProfile?: boolean;
    isTeamLeader?: boolean;
  }): AgencyEmployee {
    const dept = this.state.teams.find((t) => t.id === input.departmentId);
    const newEmp: AgencyEmployee = {
      id: `emp-${crypto.randomBytes(3).toString("hex")}`,
      employeeCode: `NX-${Math.floor(100 + Math.random() * 900)}`,
      fullName: input.fullName.trim(),
      email: input.email.toLowerCase().trim(),
      designation: input.designation.trim() || "Software Specialist",
      role: input.role || (input.isTeamLeader ? "PROJECT_MANAGER" : "EMPLOYEE"),
      departmentId: input.departmentId || null,
      department: dept ? { id: dept.id, name: dept.name } : null,
      isTeamLeader: !!input.isTeamLeader,
      isPublicProfile: input.isPublicProfile !== false,
      skills: input.skills && input.skills.length > 0 ? input.skills : ["React", "TypeScript", "Problem Solving"],
      joinedAt: new Date().toISOString(),
    };

    this.state.employees.push(newEmp);

    // Also create membership entry
    this.state.memberships.push({
      id: `mem-${Date.now()}`,
      user: {
        id: newEmp.id,
        name: newEmp.fullName,
        email: newEmp.email,
        lastLoginAt: null,
      },
      role: {
        id: `r-${newEmp.role}`,
        code: newEmp.role,
        name: newEmp.role.replace(/_/g, " "),
      },
    });

    if (dept) {
      dept.memberCount += 1;
      if (input.isTeamLeader) {
        dept.leaderName = newEmp.fullName;
        dept.leaderId = newEmp.id;
      }
    }

    this.saveState();
    return newEmp;
  }

  public toggleEmployeePublic(id: string): boolean {
    const emp = this.state.employees.find((e) => e.id === id);
    if (!emp) return false;
    emp.isPublicProfile = !emp.isPublicProfile;
    this.saveState();
    return emp.isPublicProfile;
  }

  // --- MEMBERSHIPS & ROLES ---
  public getMemberships(): AgencyUserMembership[] {
    return this.state.memberships;
  }

  public updateUserRole(userId: string, newRole: string): boolean {
    // 1. Update in memberships
    const mem = this.state.memberships.find(
      (m) => m.user.id === userId || m.user.email.toLowerCase() === userId.toLowerCase()
    );
    if (mem) {
      mem.role = {
        id: `r-${newRole}`,
        code: newRole,
        name: newRole.replace(/_/g, " "),
      };
    }

    // 2. Update in employees if exists
    const emp = this.state.employees.find(
      (e) => e.id === userId || e.email.toLowerCase() === userId.toLowerCase()
    );
    if (emp) {
      emp.role = newRole;
      if (newRole === "PROJECT_MANAGER") {
        emp.isTeamLeader = true;
      }
    }

    this.saveState();
    return true;
  }

  public registerNewUser(
    name: string,
    email: string,
    role: string = "EMPLOYEE"
  ): AgencyUserMembership {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = this.state.memberships.find(
      (m) => m.user.email.toLowerCase() === normalizedEmail
    );
    if (existing) return existing;

    const newMembership: AgencyUserMembership = {
      id: `mem-${crypto.randomBytes(3).toString("hex")}`,
      user: {
        id: `u-${crypto.randomBytes(3).toString("hex")}`,
        name: name.trim(),
        email: normalizedEmail,
        lastLoginAt: new Date().toISOString(),
      },
      role: {
        id: `r-${role}`,
        code: role,
        name: role.replace(/_/g, " "),
      },
    };

    this.state.memberships.push(newMembership);

    // Also add to employees as new team member
    this.state.employees.push({
      id: newMembership.user.id,
      employeeCode: `NX-${Math.floor(100 + Math.random() * 900)}`,
      fullName: name.trim(),
      email: normalizedEmail,
      designation: role === "ORG_ADMIN" ? "Agency Executive" : "Team Specialist",
      role,
      departmentId: "team-1",
      department: { id: "team-1", name: "Frontend & Web Engineering" },
      isTeamLeader: false,
      isPublicProfile: true,
      skills: ["Collaboration", "Agile", "TypeScript"],
      joinedAt: new Date().toISOString(),
    });

    this.saveState();
    return newMembership;
  }
}

// Global singleton instance
const globalForStore = globalThis as unknown as { agencyStore?: AgencyStore };
export const agencyStore = globalForStore.agencyStore ?? new AgencyStore();
if (process.cwd()) globalForStore.agencyStore = agencyStore;
