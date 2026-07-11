// ====================================================================
// Shared Zod validation schemas
// Centralized so all APIs use the same validation rules
// ====================================================================

import { z } from "zod";

// ── Auth ────────────────────────────────────────────────────────
export const signupSchema = z.object({
  name: z.string().min(2, "الاسم قصير جداً"),
  email: z.string().email("بريد غير صحيح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  phone: z.string().max(20).optional(),
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("بريد غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("بريد غير صحيح"),
});

// ── Course ──────────────────────────────────────────────────────
export const createCourseSchema = z.object({
  title: z.string().min(2, "العنوان مطلوب").max(120),
  titleAr: z.string().max(120).optional().nullable(),
  description: z.string().min(10, "الوصف مطلوب").max(2000),
  descriptionAr: z.string().max(2000).optional().nullable(),
  price: z.number().min(0, "السعر مطلوب"),
  discountPrice: z.number().min(0).optional().nullable(),
  currency: z.string().default("SAR"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "PROFESSIONAL"]).default("BEGINNER"),
  category: z.string().max(60).optional().nullable(),
  durationHours: z.number().min(0).default(0),
  capacity: z.number().min(1).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  previewVideoUrl: z.string().url().optional().nullable(),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  status: z.enum(["DRAFT", "PUBLISHED", "UNLISTED", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
});

// ── Section ─────────────────────────────────────────────────────
export const createSectionSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1).max(120),
  titleAr: z.string().max(120).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  order: z.number().min(0).default(0),
});

export const updateSectionSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  titleAr: z.string().max(120).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  order: z.number().min(0).optional(),
  isPublished: z.boolean().optional(),
});

// ── Lesson ──────────────────────────────────────────────────────
export const createLessonSchema = z.object({
  sectionId: z.string().min(1),
  courseId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(["VIDEO", "TEXT", "PDF", "LIVE"]).default("VIDEO"),
  videoUrl: z.string().url().optional().nullable(),
  pdfUrl: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  duration: z.number().min(0).default(0),
  order: z.number().min(0).default(0),
  isPreview: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export const updateLessonSchema = createLessonSchema.partial();

// ── Payment ─────────────────────────────────────────────────────
export const paymentReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().optional(),
}).refine(
  (v) => v.action === "APPROVE" || (v.action === "REJECT" && v.rejectionReason && v.rejectionReason.trim().length > 0),
  { message: "سبب الرفض مطلوب" }
);

// ── Submission / Critique ───────────────────────────────────────
export const critiqueSchema = z.object({
  critique: z.string().max(5000).optional(),
  pinComments: z.array(z.object({
    id: z.string(),
    x: z.number(),
    y: z.number(),
    text: z.string(),
    authorId: z.string(),
    createdAt: z.string(),
  })).optional(),
  status: z.enum(["UNDER_REVIEW", "CRITIQUED", "APPROVED", "RESUBMITTED"]).optional(),
});

// ── Coupon ──────────────────────────────────────────────────────
export const createCouponSchema = z.object({
  code: z.string().min(2).max(50).transform((s) => s.toUpperCase().trim()),
  type: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  value: z.number().min(1).max(10000),
  validFrom: z.string().optional(),
  validUntil: z.string().optional().nullable(),
  maxUses: z.number().min(1).max(100000).default(100),
  courseId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1).max(50).transform((s) => s.toUpperCase().trim()),
  courseId: z.string().min(1),
  amount: z.number().min(0),
});

// ── Review ──────────────────────────────────────────────────────
export const createReviewSchema = z.object({
  courseId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().max(2000).optional().default(""),
});

// ── Support Ticket ──────────────────────────────────────────────
export const createTicketSchema = z.object({
  subject: z.string().min(3, "الموضوع مطلوب").max(200),
  body: z.string().min(10, "الرسالة قصيرة جداً").max(5000),
  category: z.enum(["GENERAL", "TECHNICAL", "PAYMENT", "REFUND", "OTHER"]).default("GENERAL"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  courseId: z.string().optional().nullable(),
});

export const ticketReplySchema = z.object({
  body: z.string().min(1, "الرد مطلوب").max(5000),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
});

// ── Contact ─────────────────────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(2, "الاسم قصير جداً"),
  email: z.string().email("بريد غير صحيح"),
  phone: z.string().max(20).optional(),
  subject: z.string().min(2, "الموضوع مطلوب"),
  message: z.string().min(10, "الرسالة قصيرة جداً").max(5000),
});

// ── Chatbot ─────────────────────────────────────────────────────
export const chatbotSchema = z.object({
  message: z.string().min(1, "الرسالة مطلوبة").max(1000),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).max(10).optional().default([]),
});

// ── User ban/unban ──────────────────────────────────────────────
export const banUserSchema = z.object({
  isBanned: z.boolean(),
});

// ── Lesson progress ─────────────────────────────────────────────
export const lessonProgressSchema = z.object({
  lessonId: z.string().min(1),
  courseId: z.string().min(1),
  watchedSeconds: z.number().min(0).optional(),
  completed: z.boolean().optional(),
});

// ── Enrollment progress ─────────────────────────────────────────
export const enrollmentProgressSchema = z.object({
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  completed: z.boolean(),
});
