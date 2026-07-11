// ====================================================================
// Shared TypeScript types — used across the application
// Replaces `any` with proper types for better type safety
// ====================================================================

import { Role, CourseLevel, CourseStatus, LessonType, EnrollmentStatus, PaymentStatus, SubmissionStatus, CertificateStatus } from "@prisma/client";

// ── User types ──────────────────────────────────────────────────
export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
  isBanned: boolean;
  createdAt: Date;
}

// ── Course types ────────────────────────────────────────────────
export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  titleAr: string | null;
  description: string;
  descriptionAr: string | null;
  price: number;
  discountPrice: number | null;
  currency: string;
  level: CourseLevel;
  status: CourseStatus;
  category: string | null;
  durationHours: number;
  thumbnailUrl: string | null;
  isFeatured: boolean;
  instructorId: string;
}

export interface CourseWithSections extends CourseSummary {
  sections: SectionWithLessons[];
  instructor: { id: string; name: string | null; bio: string | null };
  _count?: { enrollments: number };
}

export interface SectionWithLessons {
  id: string;
  title: string;
  titleAr: string | null;
  order: number;
  lessons: LessonSummary[];
}

export interface LessonSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: LessonType;
  videoUrl: string | null;
  pdfUrl: string | null;
  thumbnailUrl: string | null;
  duration: number;
  order: number;
  isPreview: boolean;
  isPublished: boolean;
}

// ── Enrollment types ────────────────────────────────────────────
export interface EnrollmentWithCourse {
  id: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: Date;
  completedAt: Date | null;
  course: CourseSummary;
}

// ── Payment types ───────────────────────────────────────────────
export interface PaymentReceiptWithRelations {
  id: string;
  imageUrl: string;
  bankName: string;
  amount: number;
  currency: string;
  referenceNumber: string | null;
  status: PaymentStatus;
  notes: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  student: { id: string; name: string | null; email: string };
  enrollment: {
    course: { titleAr: string | null; title: string };
  };
}

// ── Submission types ────────────────────────────────────────────
export interface SubmissionWithRelations {
  id: string;
  imageUrl: string;
  caption: string | null;
  status: SubmissionStatus;
  exifData: Record<string, any> | null;
  critique: string | null;
  pinComments: any[] | null;
  attemptNumber: number;
  submittedAt: Date;
  student: { id: string; name: string | null; email: string };
  assignment: {
    id: string;
    title: string;
    course: { id: string; titleAr: string | null; title: string; instructorId: string };
    lesson: { id: string; title: string } | null;
  };
}

// ── Certificate types ───────────────────────────────────────────
export interface CertificateWithRelations {
  id: string;
  certificateNumber: string;
  issuedAt: Date;
  expiresAt: Date | null;
  grade: string | null;
  verifyToken: string;
  status: CertificateStatus;
  student: { id: string; name: string | null };
  course: { id: string; titleAr: string | null; title: string };
}

// ── Notification types ──────────────────────────────────────────
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
}

// ── Support ticket types ────────────────────────────────────────
export interface SupportTicketWithRelations {
  id: string;
  subject: string;
  body: string;
  category: string;
  priority: string;
  status: string;
  createdAt: Date;
  student: { name: string | null; email: string };
  course: { titleAr: string | null; title: string } | null;
  _count?: { replies: number };
}

// ── API response wrapper ────────────────────────────────────────
export interface ApiResponse<T = any> {
  ok: boolean;
  error?: string;
  message?: string;
  data?: T;
}

// ── Coupon types ────────────────────────────────────────────────
export interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  validFrom: Date;
  validUntil: Date | null;
  maxUses: number;
  usedCount: number;
  courseId: string | null;
  isActive: boolean;
}

// ── Chatbot types ───────────────────────────────────────────────
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Guardian types ──────────────────────────────────────────────
export interface GuardianStudentView {
  id: string;
  name: string | null;
  email: string;
  enrollments: EnrollmentWithCourse[];
  certificates: CertificateWithRelations[];
}
