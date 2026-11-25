import { PrismaClient, RoleCode } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSION_DEFS = [
  { key: "dashboard:view", module: "dashboard", description: "View dashboard analytics" },
  { key: "crm:read", module: "crm", description: "Read CRM leads, contacts, companies, deals" },
  { key: "crm:write", module: "crm", description: "Create and edit CRM records" },
  { key: "crm:delete", module: "crm", description: "Delete CRM records" },
  { key: "projects:read", module: "projects", description: "View agency projects" },
  { key: "projects:write", module: "projects", description: "Create and update projects" },
  { key: "hr:read", module: "hr", description: "View employees and HR logs" },
  { key: "hr:write", module: "hr", description: "Manage employees, attendance, leave" },
  { key: "recruitment:read", module: "recruitment", description: "View job listings and applicants" },
  { key: "recruitment:write", module: "recruitment", description: "Manage recruitment pipeline" },
  { key: "finance:read", module: "finance", description: "View invoices, payments, expenses" },
  { key: "finance:write", module: "finance", description: "Create and edit financial records" },
  { key: "cms:read", module: "cms", description: "View CMS content" },
  { key: "cms:write", module: "cms", description: "Edit CMS content" },
  { key: "cms:publish", module: "cms", description: "Publish or archive CMS content" },
  { key: "reports:read", module: "reports", description: "View executive reports" },
  { key: "settings:manage", module: "settings", description: "Manage organization settings" },
  { key: "users:manage", module: "users", description: "Manage users and roles" },
];

const ROLE_CONFIGS: Array<{
  code: RoleCode;
  name: string;
  perms: string[];
}> = [
  { code: "SUPER_ADMIN", name: "Super Admin", perms: PERMISSION_DEFS.map((p) => p.key) },
  { code: "ORG_ADMIN", name: "Organization Admin", perms: PERMISSION_DEFS.map((p) => p.key) },
  {
    code: "SALES_MANAGER",
    name: "Sales Manager",
    perms: ["dashboard:view", "crm:read", "crm:write", "crm:delete", "reports:read", "projects:read"],
  },
  { code: "SALES_REP", name: "Sales Representative", perms: ["dashboard:view", "crm:read", "crm:write"] },
  {
    code: "MARKETING",
    name: "Marketing",
    perms: ["dashboard:view", "crm:read", "cms:read", "cms:write", "cms:publish", "reports:read"],
  },
  {
    code: "HR_MANAGER",
    name: "HR Manager",
    perms: ["dashboard:view", "hr:read", "hr:write", "recruitment:read", "recruitment:write"],
  },
  {
    code: "FINANCE_MANAGER",
    name: "Finance Manager",
    perms: ["dashboard:view", "finance:read", "finance:write", "crm:read", "reports:read"],
  },
  {
    code: "PROJECT_MANAGER",
    name: "Project Manager",
    perms: ["dashboard:view", "projects:read", "projects:write", "crm:read", "hr:read"],
  },
  { code: "EMPLOYEE", name: "Employee", perms: ["dashboard:view", "projects:read", "hr:read"] },
  { code: "CLIENT", name: "Client", perms: ["dashboard:view", "projects:read", "finance:read"] },
];

async function main() {
  console.log("Seeding Nexora PostgreSQL database...");

  // 1. Global Permissions
  const permissionRecords: Record<string, string> = {};
  for (const p of PERMISSION_DEFS) {
    const rec = await prisma.permission.upsert({
      where: { key: p.key },
      update: { module: p.module, description: p.description },
      create: p,
    });
    permissionRecords[p.key] = rec.id;
  }

  // 2. Organizations (Primary + Secondary Tenant for isolation verification)
  const org = await prisma.organization.upsert({
    where: { slug: "nexora" },
    update: { isDefault: true, name: "Nexora Digital Agency" },
    create: {
      name: "Nexora Digital Agency",
      slug: "nexora",
      domain: "nexora.agency",
      industry: "Digital Agency & SaaS Engineering",
      isDefault: true,
    },
  });

  const secondaryOrg = await prisma.organization.upsert({
    where: { slug: "apex-ventures" },
    update: { name: "Apex Ventures" },
    create: {
      name: "Apex Ventures",
      slug: "apex-ventures",
      domain: "apexventures.io",
      industry: "Venture Studio",
      isDefault: false,
    },
  });

  // 3. Roles & RolePermissions for Primary Org
  const roleMap: Partial<Record<RoleCode, string>> = {};
  for (const rc of ROLE_CONFIGS) {
    const role = await prisma.role.upsert({
      where: { organizationId_code: { organizationId: org.id, code: rc.code } },
      update: { name: rc.name },
      create: {
        organizationId: org.id,
        code: rc.code,
        name: rc.name,
        description: `${rc.name} role for ${org.name}`,
      },
    });
    roleMap[rc.code] = role.id;

    for (const permKey of rc.perms) {
      const permId = permissionRecords[permKey];
      if (!permId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
        update: {},
        create: { roleId: role.id, permissionId: permId },
      });
    }
  }

  const secondaryAdminRole = await prisma.role.upsert({
    where: { organizationId_code: { organizationId: secondaryOrg.id, code: "ORG_ADMIN" } },
    update: {},
    create: {
      organizationId: secondaryOrg.id,
      code: "ORG_ADMIN",
      name: "Organization Admin",
    },
  });

  // 4. Users & Memberships
  const passwordHash = await bcrypt.hash("Nexora@2026!", 12);

  const seedUsers: Array<{
    email: string;
    name: string;
    role: RoleCode;
    orgId: string;
    roleId: string;
  }> = [
    {
      email: "admin@nexora.agency",
      name: "Arlene McCoy",
      role: "SUPER_ADMIN",
      orgId: org.id,
      roleId: roleMap.SUPER_ADMIN!,
    },
    {
      email: "sales@nexora.agency",
      name: "Benny James",
      role: "SALES_MANAGER",
      orgId: org.id,
      roleId: roleMap.SALES_MANAGER!,
    },
    {
      email: "rep@nexora.agency",
      name: "Clara Wong",
      role: "SALES_REP",
      orgId: org.id,
      roleId: roleMap.SALES_REP!,
    },
    {
      email: "hr@nexora.agency",
      name: "Eva Green",
      role: "HR_MANAGER",
      orgId: org.id,
      roleId: roleMap.HR_MANAGER!,
    },
    {
      email: "finance@nexora.agency",
      name: "David Kim",
      role: "FINANCE_MANAGER",
      orgId: org.id,
      roleId: roleMap.FINANCE_MANAGER!,
    },
    {
      email: "pm@nexora.agency",
      name: "Leslie Alexander",
      role: "PROJECT_MANAGER",
      orgId: org.id,
      roleId: roleMap.PROJECT_MANAGER!,
    },
    {
      email: "marketing@nexora.agency",
      name: "Jenny Wilson",
      role: "MARKETING",
      orgId: org.id,
      roleId: roleMap.MARKETING!,
    },
    {
      email: "client@brightlabs.io",
      name: "Ryan Cooper",
      role: "CLIENT",
      orgId: org.id,
      roleId: roleMap.CLIENT!,
    },
    {
      email: "admin@apexventures.io",
      name: "Marcus Sterling",
      role: "ORG_ADMIN",
      orgId: secondaryOrg.id,
      roleId: secondaryAdminRole.id,
    },
  ];

  const userMap: Record<string, string> = {};
  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, isActive: true },
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        emailVerified: new Date(),
      },
    });
    userMap[u.email] = user.id;

    await prisma.membership.upsert({
      where: {
        organizationId_userId: {
          organizationId: u.orgId,
          userId: user.id,
        },
      },
      update: { roleId: u.roleId, status: "ACTIVE" },
      create: {
        organizationId: u.orgId,
        userId: user.id,
        roleId: u.roleId,
        status: "ACTIVE",
      },
    });
  }

  // 5. Departments & Employees (Public + Internal)
  const deptNames = ["Design Studio", "Engineering", "Growth & Marketing", "Operations"];
  const deptMap: Record<string, string> = {};
  for (const name of deptNames) {
    const dept = await prisma.department.upsert({
      where: { organizationId_name: { organizationId: org.id, name } },
      update: {},
      create: { organizationId: org.id, name },
    });
    deptMap[name] = dept.id;
  }

  const employeesData = [
    {
      employeeCode: "EMP-001",
      fullName: "Wade Warren",
      slug: "wade-warren",
      email: "wade@nexora.agency",
      designation: "Principal UX Designer & Research Lead",
      departmentId: deptMap["Design Studio"],
      bio: "Wade leads product discovery and human-centered design systems for high-growth SaaS and enterprise platforms.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      skills: ["Product Strategy", "Design Systems", "UX Research", "Figma"],
      experienceYears: 9,
      salary: 148000,
      isPublicProfile: true,
      displayOrder: 1,
      socialLinks: { linkedin: "https://linkedin.com", twitter: "https://x.com" },
    },
    {
      employeeCode: "EMP-002",
      fullName: "Leslie Alexander",
      slug: "leslie-alexander",
      email: "pm@nexora.agency",
      userId: userMap["pm@nexora.agency"],
      designation: "VP of Engineering & Architecture",
      departmentId: deptMap["Engineering"],
      bio: "Leslie architects resilient Next.js, PostgreSQL, and multi-tenant cloud systems built for scale.",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
      skills: ["Next.js", "PostgreSQL", "System Architecture", "Security"],
      experienceYears: 11,
      salary: 172000,
      isPublicProfile: true,
      displayOrder: 2,
      socialLinks: { linkedin: "https://linkedin.com", website: "https://nexora.agency" },
    },
    {
      employeeCode: "EMP-003",
      fullName: "Jenny Wilson",
      slug: "jenny-wilson",
      email: "marketing@nexora.agency",
      userId: userMap["marketing@nexora.agency"],
      designation: "Head of Digital Growth & Brand",
      departmentId: deptMap["Growth & Marketing"],
      bio: "Jenny blends creative brand storytelling with quantitative growth loops and conversion science.",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
      skills: ["Brand Strategy", "Technical SEO", "CRO", "Demand Gen"],
      experienceYears: 8,
      salary: 138000,
      isPublicProfile: true,
      displayOrder: 3,
      socialLinks: { linkedin: "https://linkedin.com", twitter: "https://x.com" },
    },
    {
      employeeCode: "EMP-004",
      fullName: "Benny James",
      slug: "benny-james",
      email: "sales@nexora.agency",
      userId: userMap["sales@nexora.agency"],
      designation: "Director of Revenue & Partnerships",
      departmentId: deptMap["Operations"],
      bio: "Oversees enterprise pipeline strategy and client partnerships.",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
      skills: ["Enterprise Sales", "CRM Strategy", "Account Growth"],
      experienceYears: 7,
      salary: 132000,
      isPublicProfile: false,
      displayOrder: 4,
    },
  ];

  const empMap: Record<string, string> = {};
  for (const e of employeesData) {
    const rec = await prisma.employee.upsert({
      where: { organizationId_employeeCode: { organizationId: org.id, employeeCode: e.employeeCode } },
      update: { isPublicProfile: e.isPublicProfile, designation: e.designation },
      create: { organizationId: org.id, ...e },
    });
    empMap[e.employeeCode] = rec.id;
  }

  // Attendance & Leave Requests
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId: empMap["EMP-001"], date: today } },
    update: {},
    create: {
      organizationId: org.id,
      employeeId: empMap["EMP-001"],
      date: today,
      checkIn: new Date(),
      status: "PRESENT",
    },
  });

  if ((await prisma.leaveRequest.count({ where: { organizationId: org.id } })) === 0) {
    await prisma.leaveRequest.create({
      data: {
        organizationId: org.id,
        employeeId: empMap["EMP-003"],
        leaveType: "Annual Leave",
        startDate: new Date(Date.now() + 7 * 86400000),
        endDate: new Date(Date.now() + 10 * 86400000),
        reason: "Scheduled family travel",
        status: "PENDING",
      },
    });
  }

  // 6. CRM: Lead Sources, Tags, Companies, Contacts, Leads, Pipeline, Deals
  const sources = [
    { name: "Website", color: "#3b82f6" },
    { name: "LinkedIn Ads", color: "#6366f1" },
    { name: "Referral", color: "#14b8a6" },
    { name: "Email Campaign", color: "#8b5cf6" },
    { name: "Events", color: "#f59e0b" },
  ];
  const sourceMap: Record<string, string> = {};
  for (const s of sources) {
    const rec = await prisma.leadSource.upsert({
      where: { organizationId_name: { organizationId: org.id, name: s.name } },
      update: { color: s.color },
      create: { organizationId: org.id, name: s.name, color: s.color },
    });
    sourceMap[s.name] = rec.id;
  }

  const pipeline = await prisma.pipeline.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Global Sales" } },
    update: { isDefault: true },
    create: { organizationId: org.id, name: "Global Sales", isDefault: true },
  });

  const stageDefs = [
    { name: "New", color: "#3b82f6", probability: 15, position: 1, isWonStage: false, isLostStage: false },
    { name: "Qualified", color: "#6366f1", probability: 35, position: 2, isWonStage: false, isLostStage: false },
    { name: "Proposal", color: "#8b5cf6", probability: 60, position: 3, isWonStage: false, isLostStage: false },
    { name: "Negotiation", color: "#f59e0b", probability: 80, position: 4, isWonStage: false, isLostStage: false },
    { name: "Closed Won", color: "#10b981", probability: 100, position: 5, isWonStage: true, isLostStage: false },
    { name: "Closed Lost", color: "#ef4444", probability: 0, position: 6, isWonStage: false, isLostStage: true },
  ];
  const stageMap: Record<string, string> = {};
  for (const st of stageDefs) {
    const rec = await prisma.pipelineStage.upsert({
      where: { pipelineId_position: { pipelineId: pipeline.id, position: st.position } },
      update: { name: st.name, probability: st.probability, color: st.color },
      create: { pipelineId: pipeline.id, ...st },
    });
    stageMap[st.name] = rec.id;
  }

  let brightLabs = await prisma.company.findFirst({
    where: { organizationId: org.id, name: "BrightLabs Inc." },
  });
  if (!brightLabs) {
    brightLabs = await prisma.company.create({
      data: {
        organizationId: org.id,
        name: "BrightLabs Inc.",
        website: "https://brightlabs.io",
        industry: "Enterprise SaaS",
        size: "50-200",
        email: "hello@brightlabs.io",
        city: "San Francisco",
        country: "USA",
      },
    });
  }

  let innovateTech = await prisma.company.findFirst({
    where: { organizationId: org.id, name: "InnovateTech" },
  });
  if (!innovateTech) {
    innovateTech = await prisma.company.create({
      data: {
        organizationId: org.id,
        name: "InnovateTech",
        website: "https://innovatetech.co",
        industry: "B2B Technology",
        size: "200-500",
        email: "partners@innovatetech.co",
        city: "Austin",
        country: "USA",
      },
    });
  }

  let ryanContact = await prisma.contact.findFirst({
    where: { organizationId: org.id, email: "ryan.cooper@brightlabs.io" },
  });
  if (!ryanContact) {
    ryanContact = await prisma.contact.create({
      data: {
        organizationId: org.id,
        companyId: brightLabs.id,
        ownerId: userMap["sales@nexora.agency"],
        firstName: "Ryan",
        lastName: "Cooper",
        email: "ryan.cooper@brightlabs.io",
        phone: "+1 (415) 555-0192",
        jobTitle: "VP of Revenue",
        isClient: true,
      },
    });
  }

  if ((await prisma.lead.count({ where: { organizationId: org.id } })) === 0) {
    const leadsSeed = [
      {
        name: "Ryan Cooper",
        email: "ryan.cooper@brightlabs.io",
        companyName: "BrightLabs Inc.",
        serviceInterest: "App Agency",
        sourceId: sourceMap["Website"],
        ownerId: userMap["admin@nexora.agency"],
        score: 85,
        estimatedValue: 8400,
        status: "QUALIFIED" as const,
      },
      {
        name: "Michael Smith",
        email: "m.smith@innovatetech.co",
        companyName: "InnovateTech",
        serviceInterest: "UX / UI Design",
        sourceId: sourceMap["LinkedIn Ads"],
        ownerId: userMap["sales@nexora.agency"],
        score: 90,
        estimatedValue: 12500,
        status: "PROPOSAL" as const,
      },
      {
        name: "Jessica Taylor",
        email: "jtaylor@futuresolutions.ai",
        companyName: "FutureSolutions",
        serviceInterest: "Brand Identity",
        sourceId: sourceMap["Referral"],
        ownerId: userMap["rep@nexora.agency"],
        score: 78,
        estimatedValue: 6200,
        status: "CONTACTED" as const,
      },
      {
        name: "Daniel Brooks",
        email: "dbrooks@greentech.io",
        companyName: "GreenTech",
        serviceInterest: "Digital Marketing",
        sourceId: sourceMap["Website"],
        ownerId: userMap["sales@nexora.agency"],
        score: 92,
        estimatedValue: 15000,
        status: "NEW" as const,
      },
      {
        name: "Grace Lee",
        email: "grace@visionaryco.com",
        companyName: "Visionary Co.",
        serviceInterest: "App Agency",
        sourceId: sourceMap["Events"],
        ownerId: userMap["admin@nexora.agency"],
        score: 95,
        estimatedValue: 18500,
        status: "CONVERTED" as const,
        convertedAt: new Date(),
        convertedCompanyId: brightLabs.id,
        convertedContactId: ryanContact.id,
      },
    ];

    for (const l of leadsSeed) {
      await prisma.lead.create({
        data: {
          organizationId: org.id,
          followUpDate: new Date(Date.now() + 3 * 86400000),
          ...l,
        },
      });
    }
  }

  // Secondary org lead (to prove strict tenant isolation)
  if ((await prisma.lead.count({ where: { organizationId: secondaryOrg.id } })) === 0) {
    await prisma.lead.create({
      data: {
        organizationId: secondaryOrg.id,
        name: "Apex Isolated Lead",
        email: "secret@apex-only.io",
        companyName: "Apex Secret Corp",
        status: "NEW",
        score: 70,
      },
    });
  }

  if ((await prisma.deal.count({ where: { organizationId: org.id } })) === 0) {
    const deal1 = await prisma.deal.create({
      data: {
        organizationId: org.id,
        pipelineId: pipeline.id,
        stageId: stageMap["Closed Won"],
        ownerId: userMap["sales@nexora.agency"],
        contactId: ryanContact.id,
        companyId: brightLabs.id,
        title: "BrightLabs RevOps & Web Platform",
        amount: 42000,
        probability: 100,
        status: "WON",
        closedAt: new Date(),
        expectedCloseDate: new Date(),
      },
    });

    await prisma.deal.createMany({
      data: [
        {
          organizationId: org.id,
          pipelineId: pipeline.id,
          stageId: stageMap["Proposal"],
          ownerId: userMap["sales@nexora.agency"],
          companyId: innovateTech.id,
          title: "InnovateTech Design System & Portal",
          amount: 28500,
          probability: 60,
          status: "OPEN",
          expectedCloseDate: new Date(Date.now() + 14 * 86400000),
        },
        {
          organizationId: org.id,
          pipelineId: pipeline.id,
          stageId: stageMap["Qualified"],
          ownerId: userMap["rep@nexora.agency"],
          companyId: brightLabs.id,
          title: "GreenTech Growth Retainer Q1",
          amount: 18000,
          probability: 35,
          status: "OPEN",
          expectedCloseDate: new Date(Date.now() + 21 * 86400000),
        },
        {
          organizationId: org.id,
          pipelineId: pipeline.id,
          stageId: stageMap["Negotiation"],
          ownerId: userMap["admin@nexora.agency"],
          companyId: innovateTech.id,
          title: "Visionary Co. Full-Stack Migration",
          amount: 55000,
          probability: 80,
          status: "OPEN",
          expectedCloseDate: new Date(Date.now() + 10 * 86400000),
        },
      ],
    });

    await prisma.activity.create({
      data: {
        organizationId: org.id,
        userId: userMap["sales@nexora.agency"],
        dealId: deal1.id,
        companyId: brightLabs.id,
        contactId: ryanContact.id,
        type: "MEETING",
        status: "COMPLETED",
        subject: "Executive Kickoff & Architecture Sign-off",
        description: "Finalized project deliverables and milestone schedule.",
        completedAt: new Date(),
      },
    });
  }

  // 7. Projects, Tasks & Meetings
  let flagshipProject = await prisma.project.findFirst({
    where: { organizationId: org.id, code: "PRJ-101" },
  });
  if (!flagshipProject) {
    flagshipProject = await prisma.project.create({
      data: {
        organizationId: org.id,
        companyId: brightLabs.id,
        contactId: ryanContact.id,
        name: "BrightLabs Enterprise Portal",
        code: "PRJ-101",
        description: "End-to-end redesign and Next.js CRM integration for BrightLabs.",
        status: "IN_PROGRESS",
        progress: 65,
        budget: 42000,
        startDate: new Date(Date.now() - 15 * 86400000),
        deadline: new Date(Date.now() + 30 * 86400000),
      },
    });

    await prisma.milestone.createMany({
      data: [
        { projectId: flagshipProject.id, title: "UX Wireframes & Design System", isCompleted: true, position: 1 },
        { projectId: flagshipProject.id, title: "Core API & Prisma Integration", isCompleted: true, position: 2 },
        { projectId: flagshipProject.id, title: "QA & Production Rollout", isCompleted: false, position: 3 },
      ],
    });

    await prisma.task.createMany({
      data: [
        {
          organizationId: org.id,
          assigneeId: userMap["pm@nexora.agency"],
          creatorId: userMap["admin@nexora.agency"],
          projectId: flagshipProject.id,
          title: "Finalize dashboard analytics queries",
          priority: "HIGH",
          status: "IN_PROGRESS",
          dueDate: new Date(Date.now() + 2 * 86400000),
        },
        {
          organizationId: org.id,
          assigneeId: userMap["sales@nexora.agency"],
          creatorId: userMap["admin@nexora.agency"],
          title: "Send revised SOW to InnovateTech",
          priority: "URGENT",
          status: "TODO",
          dueDate: new Date(Date.now() + 1 * 86400000),
        },
      ],
    });

    await prisma.meeting.create({
      data: {
        organizationId: org.id,
        organizerId: userMap["sales@nexora.agency"],
        title: "Q4 Pipeline Strategy Review",
        description: "Weekly agency revenue & deal progression sync.",
        startTime: new Date(Date.now() + 86400000),
        endTime: new Date(Date.now() + 86400000 + 3600000),
        location: "Zoom / SF Studio Room B",
        participants: ["admin@nexora.agency", "sales@nexora.agency", "pm@nexora.agency"],
      },
    });
  }

  // 8. Finance: Invoices & Expenses
  if ((await prisma.invoice.count({ where: { organizationId: org.id } })) === 0) {
    const inv = await prisma.invoice.create({
      data: {
        organizationId: org.id,
        companyId: brightLabs.id,
        contactId: ryanContact.id,
        projectId: flagshipProject.id,
        invoiceNumber: "INV-2026-001",
        dueDate: new Date(Date.now() + 15 * 86400000),
        status: "PARTIALLY_PAID",
        subtotal: 20000,
        taxRate: 8,
        taxAmount: 1600,
        total: 21600,
        amountPaid: 12000,
        notes: "Milestone 1 & 2 delivery invoice",
        items: {
          create: [
            { description: "UX/UI Design System Architecture", quantity: 1, unitPrice: 8000, amount: 8000 },
            { description: "Full-Stack Next.js Platform Sprint", quantity: 1, unitPrice: 12000, amount: 12000 },
          ],
        },
        payments: {
          create: [
            { amount: 12000, method: "ACH Wire", reference: "TXN-98412" },
          ],
        },
      },
    });

    await prisma.expense.createMany({
      data: [
        {
          organizationId: org.id,
          title: "Cloud Infrastructure & Managed PostgreSQL",
          category: "Infrastructure",
          amount: 640,
          vendor: "AWS / Vercel",
        },
        {
          organizationId: org.id,
          title: "Figma Organization Annual Seats",
          category: "Software",
          amount: 1440,
          vendor: "Figma",
        },
      ],
    });
    void inv;
  }

  // 9. Recruitment: Job Listings & Sample Application
  if ((await prisma.jobListing.count({ where: { organizationId: org.id } })) === 0) {
    const job1 = await prisma.jobListing.create({
      data: {
        organizationId: org.id,
        title: "Senior Full-Stack Next.js Engineer",
        slug: "senior-full-stack-nextjs-engineer",
        department: "Engineering",
        location: "San Francisco / Remote",
        employmentType: "Full-Time",
        salaryRange: "$145,000 – $180,000",
        description:
          "Join our core product engineering team building high-performance Next.js, TypeScript, and PostgreSQL applications for global clients.",
        requirements: [
          "5+ years with React, TypeScript, and Next.js App Router",
          "Deep expertise with PostgreSQL, Prisma ORM, and API security",
          "Strong eye for responsive UI and accessible component design",
        ],
        benefits: [
          "Flexible remote-first schedule",
          "Comprehensive health & wellness coverage",
          "Annual learning & hardware stipend",
        ],
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    await prisma.jobListing.create({
      data: {
        organizationId: org.id,
        title: "Senior Product UI/UX Designer",
        slug: "senior-product-ui-ux-designer",
        department: "Design Studio",
        location: "New York / Remote",
        employmentType: "Full-Time",
        salaryRange: "$125,000 – $155,000",
        description:
          "Shape conversion-driven agency experiences and enterprise SaaS dashboards with refined typography and systems thinking.",
        requirements: [
          "4+ years designing SaaS dashboards and marketing sites",
          "Mastery of Figma variables and design tokens",
        ],
        benefits: ["Flexible remote schedule", "401(k) matching"],
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    await prisma.jobApplication.create({
      data: {
        organizationId: org.id,
        jobListingId: job1.id,
        applicantName: "Jordan Mercer",
        email: "jordan.mercer@devmail.io",
        phone: "+1 (650) 555-0148",
        portfolioUrl: "https://github.com/jordanmercer",
        coverLetter: "Built multi-tenant Next.js + Prisma SaaS tools for 6 years.",
        status: "INTERVIEW",
      },
    });
  }

  // 10. CMS Content: Services, Portfolio, Testimonials, FAQs, Blog, Settings
  if ((await prisma.service.count({ where: { organizationId: org.id } })) === 0) {
    await prisma.service.createMany({
      data: [
        {
          organizationId: org.id,
          title: "Brand Identity",
          slug: "brand-identity",
          category: "Branding & Strategy",
          shortDescription: "Distinctive visual systems, brand architecture, and messaging frameworks engineered to command category authority.",
          description: "We partner with ambitious founders and enterprise marketing leaders to craft memorable brand identities that bridge strategic positioning with expressive visual design.",
          featuredImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
          iconName: "Palette",
          benefits: ["Comprehensive brand guidelines", "Competitor differentiation", "Conversion-ready visual hierarchy", "Cross-channel assets"],
          processSteps: [
            { step: "01", title: "Discovery & Audit", detail: "Stakeholder workshops and competitive audit." },
            { step: "02", title: "Identity System", detail: "Logo architecture, palette, typography, and grid rules." },
            { step: "03", title: "Launch Kit", detail: "Production brand guidelines and digital templates." },
          ],
          status: "PUBLISHED",
          displayOrder: 1,
        },
        {
          organizationId: org.id,
          title: "UX / UI Design",
          slug: "ux-ui-design",
          category: "Product Design",
          shortDescription: "Research-backed user experiences, interactive prototypes, and scalable design systems built for high conversion.",
          description: "From user journey mapping to pixel-accurate component libraries, our UX/UI studio turns complex product workflows into effortless digital experiences.",
          featuredImage: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&q=80",
          iconName: "Layout",
          benefits: ["Interactive Figma prototypes", "WCAG AA accessible systems", "Light & dark theme tokens", "Measurable funnel uplift"],
          status: "PUBLISHED",
          displayOrder: 2,
        },
        {
          organizationId: org.id,
          title: "App Agency",
          slug: "app-agency",
          category: "Software Engineering",
          shortDescription: "Full-stack web and mobile platforms engineered with Next.js, TypeScript, cloud-native APIs, and rock-solid security.",
          description: "Our engineering squads build resilient SaaS platforms, customer portals, and mobile applications designed for speed, security, and long-term scale.",
          featuredImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
          iconName: "Code2",
          benefits: ["Next.js & TypeScript full-stack", "Automated test pipelines", "RBAC & audit logging", "Sub-second performance"],
          status: "PUBLISHED",
          displayOrder: 3,
        },
        {
          organizationId: org.id,
          title: "Digital Marketing",
          slug: "digital-marketing",
          category: "Growth & SEO",
          shortDescription: "Full-funnel acquisition, technical SEO, paid media optimization, and CRM-connected revenue attribution.",
          description: "We connect creative storytelling with performance analytics to drive qualified pipeline and lower acquisition costs.",
          featuredImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
          iconName: "TrendingUp",
          benefits: ["Technical SEO & schema", "CRM revenue attribution", "CRO experimentation", "Executive ROI reporting"],
          status: "PUBLISHED",
          displayOrder: 4,
        },
      ],
    });
  }

  if ((await prisma.portfolioProject.count({ where: { organizationId: org.id } })) === 0) {
    await prisma.portfolioProject.createMany({
      data: [
        {
          organizationId: org.id,
          title: "Future Management Platform",
          slug: "future-management-platform",
          category: "Development",
          clientName: "BrightLabs Inc.",
          industry: "Enterprise SaaS",
          summary: "Unified analytics and revenue workspace built for high-velocity B2B sales teams.",
          challenge: "Fragmented spreadsheets and slow legacy reporting blocked executive visibility.",
          solution: "Engineered a multi-tenant Next.js + PostgreSQL platform with live pipeline analytics.",
          results: "42% faster deal velocity and 3.1x adoption across 18 regional teams.",
          technologies: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
          featuredImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
          isFeatured: true,
          status: "PUBLISHED",
        },
        {
          organizationId: org.id,
          title: "Creative Commerce Experience",
          slug: "creative-commerce-experience",
          category: "Design",
          clientName: "Velo Studio",
          industry: "Retail & D2C",
          summary: "High-converting omnichannel storefront and design system overhaul.",
          challenge: "High mobile checkout drop-off and inconsistent brand presentation.",
          solution: "Redesigned mobile-first buyer journeys with streamlined checkout.",
          results: "+68% mobile conversion rate within 90 days of launch.",
          technologies: ["React", "Figma", "Tailwind CSS", "Stripe"],
          featuredImage: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80",
          isFeatured: true,
          status: "PUBLISHED",
        },
        {
          organizationId: org.id,
          title: "Agency Growth Engine",
          slug: "agency-growth-engine",
          category: "Digital Marketing",
          clientName: "InnovateTech",
          industry: "B2B Technology",
          summary: "Full-funnel demand generation and organic search dominance program.",
          technologies: ["SEO", "Next.js", "Analytics"],
          featuredImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
          isFeatured: true,
          status: "PUBLISHED",
        },
        {
          organizationId: org.id,
          title: "FinTech Security Portal",
          slug: "fintech-security-portal",
          category: "Technology",
          clientName: "VaultPay",
          industry: "FinTech",
          summary: "Zero-trust client onboarding and compliance monitoring portal.",
          technologies: ["Next.js", "Prisma", "PostgreSQL"],
          featuredImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
          status: "PUBLISHED",
        },
      ],
    });
  }

  if ((await prisma.testimonial.count({ where: { organizationId: org.id } })) === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          organizationId: org.id,
          authorName: "Cameron Williamson",
          authorRole: "Chief Executive Officer",
          companyName: "BrightLabs Inc.",
          avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
          quote: "Nexora rebuilt our flagship web presence and connected it straight into our sales pipeline. Qualified inbound leads rose 68% in the very first quarter.",
          rating: 5,
          displayOrder: 1,
        },
        {
          organizationId: org.id,
          authorName: "Elena Rostova",
          authorRole: "VP of Marketing",
          companyName: "InnovateTech",
          avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80",
          quote: "Their blend of bold agency craft and disciplined full-stack execution is rare. Every sprint shipped on schedule with measurable revenue impact.",
          rating: 5,
          displayOrder: 2,
        },
        {
          organizationId: org.id,
          authorName: "Marcus Vance",
          authorRole: "Founder",
          companyName: "VaultPay",
          avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
          quote: "From brand positioning to our enterprise portal, Nexora operated as true strategic partners who cared deeply about our conversion metrics.",
          rating: 5,
          displayOrder: 3,
        },
      ],
    });
  }

  if ((await prisma.faq.count({ where: { organizationId: org.id } })) === 0) {
    await prisma.faq.createMany({
      data: [
        {
          organizationId: org.id,
          category: "Agency Services",
          question: "How does Nexora approach a new digital transformation project?",
          answer: "We begin with a focused discovery and funnel audit, followed by interactive prototypes, agile engineering sprints, and full QA verification.",
          displayOrder: 1,
        },
        {
          organizationId: org.id,
          category: "Agency Services",
          question: "Can we manage our website content and CRM leads in one place?",
          answer: "Yes! Nexora unifies your public CMS directly with your CRM leads, sales pipeline, projects, HR, and invoicing.",
          displayOrder: 2,
        },
        {
          organizationId: org.id,
          category: "Pricing & Timelines",
          question: "What is the typical timeline for an agency website and CRM launch?",
          answer: "Brand and marketing websites launch in 4–6 weeks, while custom full-stack SaaS and enterprise CRM platforms run 8–12 weeks.",
          displayOrder: 3,
        },
        {
          organizationId: org.id,
          category: "Technical & Security",
          question: "How do you ensure multi-tenant data isolation and security?",
          answer: "Every query is scoped by authenticated organization context on the server, backed by RBAC permissions, bcrypt hashing, HTTP-only cookies, and audit logs.",
          displayOrder: 4,
        },
      ],
    });
  }

  if ((await prisma.blogPost.count({ where: { organizationId: org.id } })) === 0) {
    const devCat = await prisma.blogCategory.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: "development" } },
      update: {},
      create: { organizationId: org.id, name: "Development", slug: "development" },
    });
    const uxCat = await prisma.blogCategory.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: "ux-ui" } },
      update: {},
      create: { organizationId: org.id, name: "UX/UI", slug: "ux-ui" },
    });

    await prisma.blogPost.createMany({
      data: [
        {
          organizationId: org.id,
          categoryId: devCat.id,
          authorId: userMap["admin@nexora.agency"],
          title: "The Power of Storytelling in Digital Branding",
          slug: "power-of-storytelling-in-digital-branding",
          excerpt: "How high-growth digital agencies craft cohesive brand narratives that convert skeptical enterprise buyers into long-term advocates.",
          content: "Great digital products begin with a clear story. When typography, motion, and product messaging reinforce a single strategic promise, conversion rates follow naturally.\n\nAt Nexora, every brand engagement starts by mapping the customer's inflection point and pairing crisp visual hierarchy with friction-free lead capture.",
          featuredImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
          readingTime: 5,
          isFeatured: true,
          status: "PUBLISHED",
          publishedAt: new Date("2026-10-21"),
        },
        {
          organizationId: org.id,
          categoryId: uxCat.id,
          authorId: userMap["marketing@nexora.agency"],
          title: "Why Your Brand Needs a Unified Digital Agency & CRM",
          slug: "why-brand-needs-unified-digital-agency-crm",
          excerpt: "Connecting your public marketing funnel directly to CRM workflows eliminates lead leakage and speeds up sales response time.",
          content: "Most organizations treat their marketing website and their CRM as separate worlds. Leads fill out a form, an email sits unread, and revenue slips away.\n\nWhen your public agency platform shares one normalized database with your CRM, HR, and project delivery teams, every contact submission immediately routes to the right account executive.",
          featuredImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1000&q=80",
          readingTime: 4,
          isFeatured: false,
          status: "PUBLISHED",
          publishedAt: new Date("2026-11-04"),
        },
      ],
    });
  }

  await prisma.siteSetting.upsert({
    where: { organizationId_key: { organizationId: org.id, key: "general" } },
    update: {},
    create: {
      organizationId: org.id,
      key: "general",
      value: {
        siteName: "Nexora",
        tagline: "Your Ultimate Digital Agency",
        phone: "+1 (415) 890-4320",
        email: "hello@nexora.agency",
        address: "548 Market Street, Suite 420, San Francisco, CA 94104",
      },
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
