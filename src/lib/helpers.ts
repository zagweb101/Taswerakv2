// ====================================================================
// Shared utility helpers
// Reduces code duplication across pages and APIs
// ====================================================================

import type { CourseSummary } from "@/types";

/**
 * Format a number as Saudi Riyal with Arabic locale.
 */
export function formatCurrency(amount: number, currency: string = "SAR"): string {
  return `${amount.toLocaleString("ar-SA")} ${currency}`;
}

/**
 * Format a date in Arabic locale.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ar-SA");
}

/**
 * Format a datetime in Arabic locale.
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ar-SA");
}

/**
 * Calculate "time ago" in Arabic.
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `منذ ${day} يوم`;
  if (hr > 0) return `منذ ${hr} ساعة`;
  if (min > 0) return `منذ ${min} دقيقة`;
  return "الآن";
}

/**
 * Days since a date.
 */
export function daysSince(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get the display name for a course (Arabic preferred).
 */
export function getCourseName(course: { titleAr?: string | null; title: string }): string {
  return course.titleAr || course.title;
}

/**
 * Get the display price (discount if available, else regular).
 */
export function getDisplayPrice(course: { price: number; discountPrice?: number | null }): {
  price: number;
  originalPrice: number;
  hasDiscount: boolean;
} {
  const originalPrice = Number(course.price);
  const price = course.discountPrice ? Number(course.discountPrice) : originalPrice;
  return { price, originalPrice, hasDiscount: price < originalPrice };
}

/**
 * Format lesson duration (seconds → "Xد:Yث").
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/**
 * Get the first lesson ID from a course with sections.
 */
export function getFirstLessonId(course: { sections?: Array<{ lessons: Array<{ id: string }> }> }): string | null {
  if (!course.sections || course.sections.length === 0) return null;
  for (const s of course.sections) {
    if (s.lessons && s.lessons.length > 0) return s.lessons[0].id;
  }
  return null;
}

/**
 * Status label maps (Arabic).
 */
export const statusLabels = {
  enrollment: {
    PENDING_PAYMENT: "بانتظار الدفع",
    PENDING_APPROVAL: "قيد المراجعة",
    ACTIVE: "نشط",
    COMPLETED: "مكتمل",
    EXPIRED: "منتهي",
    CANCELLED: "ملغى",
    REFUNDED: "مُسترد",
  },
  payment: {
    PENDING: "قيد المراجعة",
    APPROVED: "معتمد",
    REJECTED: "مرفوض",
    NEEDS_REVIEW: "يحتاج مراجعة",
  },
  submission: {
    SUBMITTED: "مُسلَّم",
    UNDER_REVIEW: "قيد النقد",
    CRITIQUED: "تم النقد",
    RESUBMITTED: "إعادة تسليم",
    APPROVED: "معتمد",
  },
  courseStatus: {
    DRAFT: "مسودة",
    PUBLISHED: "منشور",
    UNLISTED: "غير مُدرج",
    ARCHIVED: "مؤرشف",
  },
  ticketStatus: {
    OPEN: "مفتوحة",
    IN_PROGRESS: "قيد المعالجة",
    RESOLVED: "تم الحل",
    CLOSED: "مغلقة",
  },
  roles: {
    STUDENT: "طالب",
    INSTRUCTOR: "مدرّب",
    ADMIN: "مدير",
    GUARDIAN: "ولي أمر",
  },
} as const;

/**
 * Status badge CSS classes.
 */
export const statusBadgeClasses = {
  enrollment: {
    PENDING_PAYMENT: "bg-amber-100 text-amber-700",
    PENDING_APPROVAL: "bg-blue-100 text-blue-700",
    ACTIVE: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-teal-100 text-teal-700",
    EXPIRED: "bg-red-100 text-red-700",
    CANCELLED: "bg-zinc-100 text-zinc-700",
    REFUNDED: "bg-purple-100 text-purple-700",
  },
  payment: {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
    NEEDS_REVIEW: "bg-blue-100 text-blue-700",
  },
  submission: {
    SUBMITTED: "bg-blue-100 text-blue-700",
    UNDER_REVIEW: "bg-amber-100 text-amber-700",
    CRITIQUED: "bg-teal-100 text-teal-700",
    RESUBMITTED: "bg-purple-100 text-purple-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
  },
} as const;

/**
 * Get status label + class for rendering.
 */
export function getStatusInfo(
  type: keyof typeof statusLabels,
  status: string
): { label: string; cls: string } {
  const labels = (statusLabels as any)[type] as Record<string, string>;
  const classes = (statusBadgeClasses as any)[type] as Record<string, string>;
  return {
    label: labels?.[status] || status,
    cls: classes?.[status] || "bg-muted text-muted-foreground",
  };
}
