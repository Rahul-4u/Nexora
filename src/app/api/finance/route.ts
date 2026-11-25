import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { expenseSchema, invoiceSchema } from "@/lib/validations/modules";
import { createAuditLog } from "@/lib/services/audit";
import type { InvoiceStatus } from "@prisma/client";

export async function GET() {
  const auth = await requireApiAuth(PERMISSIONS.FINANCE_READ);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const [invoices, expenses, companies, projects] = await Promise.all([
    prisma.invoice.findMany({
      where: { organizationId: orgId },
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true, email: true } },
        project: { select: { id: true, name: true } },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.findMany({
      where: { organizationId: orgId },
      orderBy: { expenseDate: "desc" },
    }),
    prisma.company.findMany({
      where: { organizationId: orgId, deletedAt: null },
      select: { id: true, name: true },
    }),
    prisma.project.findMany({
      where: { organizationId: orgId, deletedAt: null },
      select: { id: true, name: true },
    }),
  ]);

  const totalRevenue = invoices.reduce((sum, i) => sum + Number(i.amountPaid), 0);
  const pendingPayments = invoices
    .filter((i) => i.status !== "CANCELLED" && i.status !== "DRAFT")
    .reduce((sum, i) => sum + Math.max(0, Number(i.total) - Number(i.amountPaid)), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return NextResponse.json({
    invoices,
    expenses,
    companies,
    projects,
    summary: {
      totalRevenue,
      pendingPayments,
      totalExpenses,
      netCashflow: totalRevenue - totalExpenses,
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(PERMISSIONS.FINANCE_WRITE);
  if (auth.error) return auth.error;
  const orgId = auth.session.organizationId;

  const body = await req.json();

  if (body.kind === "expense") {
    const parsed = expenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid expense" },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const expense = await prisma.expense.create({
      data: {
        organizationId: orgId,
        title: d.title,
        category: d.category,
        amount: d.amount,
        expenseDate: d.expenseDate ? new Date(d.expenseDate) : new Date(),
        vendor: d.vendor || null,
        notes: d.notes || null,
      },
    });
    return NextResponse.json({ expense }, { status: 201 });
  }

  if (body.kind === "payment") {
    const invoice = await prisma.invoice.findFirst({
      where: { id: String(body.invoiceId), organizationId: orgId },
    });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    const payAmount = Number(body.amount);
    if (Number.isNaN(payAmount) || payAmount <= 0) {
      return NextResponse.json({ error: "Valid payment amount required" }, { status: 400 });
    }

    const newPaid = Number(invoice.amountPaid) + payAmount;
    const nextStatus: InvoiceStatus =
      newPaid >= Number(invoice.total) ? "PAID" : "PARTIALLY_PAID";

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: payAmount,
          method: String(body.method || "Bank Transfer"),
          reference: body.reference ? String(body.reference) : null,
        },
      }),
      prisma.invoice.update({
        where: { id: invoice.id },
        data: { amountPaid: newPaid, status: nextStatus },
      }),
    ]);

    return NextResponse.json({ success: true });
  }

  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid invoice data" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const subtotal = d.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * d.taxRate) / 100;
  const total = subtotal + taxAmount;
  const count = await prisma.invoice.count({ where: { organizationId: orgId } });
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      organizationId: orgId,
      companyId: d.companyId || null,
      contactId: d.contactId || null,
      projectId: d.projectId || null,
      invoiceNumber,
      dueDate: new Date(d.dueDate),
      status: d.status,
      subtotal,
      taxRate: d.taxRate,
      taxAmount,
      total,
      notes: d.notes || null,
      items: {
        create: d.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
        })),
      },
    },
    include: { items: true },
  });

  await createAuditLog({
    organizationId: orgId,
    userId: auth.session.userId,
    action: "CREATE_INVOICE",
    entity: "Invoice",
    entityId: invoice.id,
  });

  return NextResponse.json({ invoice }, { status: 201 });
}
