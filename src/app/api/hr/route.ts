import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { employeeSchema } from "@/lib/validations/modules";
import { createAuditLog } from "@/lib/services/audit";
import { slugify } from "@/lib/utils";
import type { LeaveStatus, AttendanceStatus } from "@prisma/client";

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.HR_READ);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const [employees, departments, attendance, leaveRequests, workLogs] =
    await Promise.all([
      prisma.employee.findMany({
        where: { organizationId: orgId, deletedAt: null },
        include: { department: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.department.findMany({
        where: { organizationId: orgId },
        include: { _count: { select: { employees: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.attendance.findMany({
        where: { organizationId: orgId },
        include: { employee: { select: { fullName: true, employeeCode: true } } },
        orderBy: { date: "desc" },
        take: 30,
      }),
      prisma.leaveRequest.findMany({
        where: { organizationId: orgId },
        include: { employee: { select: { fullName: true, designation: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.workLog.findMany({
        where: { organizationId: orgId },
        include: {
          employee: { select: { fullName: true } },
          project: { select: { name: true } },
        },
        orderBy: { date: "desc" },
        take: 30,
      }),
    ]);

  return NextResponse.json({
    employees,
    departments,
    attendance,
    leaveRequests,
    workLogs,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.HR_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();

  if (body.action === "department") {
    const dept = await prisma.department.upsert({
      where: { organizationId_name: { organizationId: orgId, name: String(body.name) } },
      update: {},
      create: {
        organizationId: orgId,
        name: String(body.name),
        description: body.description ? String(body.description) : null,
      },
    });
    return NextResponse.json({ department: dept }, { status: 201 });
  }

  if (body.action === "attendance") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rec = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: String(body.employeeId),
          date: today,
        },
      },
      update: {
        status: (body.status as AttendanceStatus) || "PRESENT",
        notes: body.notes ? String(body.notes) : null,
      },
      create: {
        organizationId: orgId,
        employeeId: String(body.employeeId),
        date: today,
        checkIn: new Date(),
        status: (body.status as AttendanceStatus) || "PRESENT",
        notes: body.notes ? String(body.notes) : null,
      },
    });
    return NextResponse.json({ attendance: rec }, { status: 201 });
  }

  if (body.action === "leaveRequest") {
    const leave = await prisma.leaveRequest.create({
      data: {
        organizationId: orgId,
        employeeId: String(body.employeeId),
        leaveType: String(body.leaveType || "Annual Leave"),
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        reason: String(body.reason || ""),
        status: "PENDING",
      },
    });
    return NextResponse.json({ leaveRequest: leave }, { status: 201 });
  }

  if (body.action === "workLog") {
    const log = await prisma.workLog.create({
      data: {
        organizationId: orgId,
        employeeId: String(body.employeeId),
        projectId: body.projectId ? String(body.projectId) : null,
        date: body.date ? new Date(body.date) : new Date(),
        hours: Number(body.hours || 1),
        description: String(body.description || ""),
        billable: body.billable !== false,
      },
    });
    return NextResponse.json({ workLog: log }, { status: 201 });
  }

  const parsed = employeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid employee data" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const employee = await prisma.employee.create({
    data: {
      organizationId: orgId,
      employeeCode: d.employeeCode,
      fullName: d.fullName,
      slug: `${slugify(d.fullName)}-${Date.now().toString().slice(-4)}`,
      email: d.email,
      phone: d.phone || null,
      designation: d.designation,
      departmentId: d.departmentId || null,
      bio: d.bio || null,
      avatarUrl: d.avatarUrl || null,
      skills: d.skills,
      experienceYears: d.experienceYears,
      salary: d.salary ?? null,
      status: d.status,
      isPublicProfile: d.isPublicProfile,
    },
  });

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: "CREATE_EMPLOYEE",
    entity: "Employee",
    entityId: employee.id,
  });

  return NextResponse.json({ employee }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.HR_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();

  if (body.leaveId) {
    await prisma.leaveRequest.updateMany({
      where: { id: String(body.leaveId), organizationId: orgId },
      data: {
        status: body.status as LeaveStatus,
        reviewedBy: auth.session.name,
        reviewedAt: new Date(),
      },
    });
    return NextResponse.json({ success: true });
  }

  if (body.employeeId) {
    await prisma.employee.updateMany({
      where: { id: String(body.employeeId), organizationId: orgId },
      data: {
        ...(body.isPublicProfile !== undefined
          ? { isPublicProfile: Boolean(body.isPublicProfile) }
          : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid HR patch request" }, { status: 400 });
}
