// ====================================================================
// GET /api/admin/finance/export
// Export payment receipts as an Excel file.
// Query params: ?range=THIS_MONTH&status=APPROVED
// Uses exceljs (already installed).
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/services/audit";

const RANGES: Record<string, () => { start: Date; end: Date }> = {
  THIS_WEEK: () => {
    const now = new Date();
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return { start, end };
  },
  THIS_MONTH: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end };
  },
  LAST_MONTH: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end };
  },
  THIS_QUARTER: () => {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), q * 3, 1);
    const end = new Date(now.getFullYear(), q * 3 + 3, 1);
    return { start, end };
  },
  THIS_YEAR: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear() + 1, 0, 1);
    return { start, end };
  },
  ALL: () => {
    const start = new Date(2020, 0, 1);
    const end = new Date(2100, 0, 1);
    return { start, end };
  },
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "صلاحيات غير كافية" }, { status: 403 });
    }

    const url = new URL(req.url);
    const rangeKey = (url.searchParams.get("range") || "THIS_MONTH") as keyof typeof RANGES;
    const statusFilter = url.searchParams.get("status") || "ALL";

    const rangeFn = RANGES[rangeKey] || RANGES.THIS_MONTH;
    const { start, end } = rangeFn();

    const where: any = {
      createdAt: { gte: start, lt: end },
    };
    if (statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    const receipts = await db.paymentReceipt.findMany({
      where,
      include: {
        student: { select: { name: true, email: true } },
        enrollment: {
          select: {
            course: {
              select: { titleAr: true, title: true, instructor: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Build workbook
    const wb = new ExcelJS.Workbook();
    wb.creator = "Taswerak Admin";
    wb.created = new Date();

    // Sheet 1: Transactions
    const ws = wb.addWorksheet("المعاملات", {
      views: [{ rightToLeft: true }],
      properties: { defaultRowHeight: 22 },
    });

    ws.columns = [
      { header: "#", key: "idx", width: 6 },
      { header: "التاريخ", key: "date", width: 16 },
      { header: "الطالب", key: "student", width: 28 },
      { header: "البريد", key: "email", width: 32 },
      { header: "الدورة", key: "course", width: 32 },
      { header: "المدرّب", key: "instructor", width: 22 },
      { header: "البنك", key: "bank", width: 22 },
      { header: "المرجع", key: "ref", width: 20 },
      { header: "المبلغ", key: "amount", width: 12 },
      { header: "العملة", key: "currency", width: 8 },
      { header: "الحالة", key: "status", width: 14 },
      { header: "تاريخ المراجعة", key: "reviewedAt", width: 16 },
    ];

    // Style header
    ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    ws.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0A9ED9" },
    };
    ws.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

    const statusLabels: Record<string, string> = {
      PENDING: "قيد المراجعة",
      APPROVED: "معتمد",
      REJECTED: "مرفوض",
      NEEDS_REVIEW: "يحتاج مراجعة",
    };

    receipts.forEach((r, i) => {
      const row = ws.addRow({
        idx: i + 1,
        date: new Date(r.createdAt).toLocaleDateString("en-GB"),
        student: r.student?.name || "—",
        email: r.student?.email || "—",
        course: r.enrollment?.course?.titleAr || r.enrollment?.course?.title || "—",
        instructor: r.enrollment?.course?.instructor?.name || "—",
        bank: r.bankName,
        ref: r.referenceNumber || "—",
        amount: Number(r.amount),
        currency: r.currency,
        status: statusLabels[r.status] || r.status,
        reviewedAt: r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString("en-GB") : "—",
      });
      row.alignment = { vertical: "middle" };

      // Color the status cell
      const statusCell = row.getCell(11);
      if (r.status === "APPROVED") {
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } };
        statusCell.font = { color: { argb: "FF065F46" }, bold: true };
      } else if (r.status === "REJECTED") {
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
        statusCell.font = { color: { argb: "FF991B1B" }, bold: true };
      } else if (r.status === "PENDING") {
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
        statusCell.font = { color: { argb: "FF92400E" }, bold: true };
      }
    });

    // Add total row
    const totalRow = ws.addRow({
      student: "الإجمالي",
      amount: receipts.reduce((s, r) => s + Number(r.amount), 0),
    });
    totalRow.font = { bold: true, size: 12 };
    totalRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0F2FE" } };

    // Sheet 2: Summary
    const summary = wb.addWorksheet("الملخص", {
      views: [{ rightToLeft: true }],
    });
    summary.columns = [
      { header: "البند", key: "label", width: 30 },
      { header: "القيمة", key: "value", width: 22 },
    ];
    summary.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    summary.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF00A3AA" },
    };

    const approved = receipts.filter((r) => r.status === "APPROVED");
    const approvedTotal = approved.reduce((s, r) => s + Number(r.amount), 0);
    const platformShare = approvedTotal * 0.1;
    const instructorsShare = approvedTotal * 0.9;

    summary.addRows([
      { label: "النطاق الزمني", value: `${start.toLocaleDateString("en-GB")} → ${end.toLocaleDateString("en-GB")}` },
      { label: "فلتر الحالة", value: statusFilter === "ALL" ? "الكل" : statusLabels[statusFilter] || statusFilter },
      { label: "إجمالي المعاملات", value: receipts.length },
      { label: "معاملات معتمدة", value: approved.length },
      { label: "إجمالي الإيرادات المعتمدة", value: `${approvedTotal.toFixed(2)} SAR` },
      { label: "حصة المنصة (10%)", value: `${platformShare.toFixed(2)} SAR` },
      { label: "حصة المدرّبين (90%)", value: `${instructorsShare.toFixed(2)} SAR` },
      { label: "تاريخ التصدير", value: new Date().toLocaleString("en-GB") },
    ]);

    // Make label column bold
    summary.getColumn(1).font = { bold: true };

    // Generate buffer
    const buffer = await wb.xlsx.writeBuffer();

    await writeAudit({
      userId: session.user.id,
      action: "FINANCE_EXPORT",
      entity: "PaymentReceipt",
      metadata: {
        range: rangeKey,
        status: statusFilter,
        count: receipts.length,
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    const filename = `taswerak-finance-${rangeKey}-${statusFilter}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[finance/export] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ أثناء التصدير" }, { status: 500 });
  }
}
