// ====================================================================
// External integrations — LinkedIn, Google Calendar, Webhooks
// ====================================================================

/**
 * Generate a LinkedIn "Add to Profile" link for a certificate.
 * Uses LinkedIn's certification URL format.
 * https://add.linkedin.com/certificate
 */
export function getLinkedInCertificateLink(opts: {
  certName: string;
  certNumber: string;
  issueDate: string; // ISO
  expirationDate?: string;
  organizationName?: string;
  url?: string;
}): string {
  const params = new URLSearchParams({
    "_sch": "cert",
    "_clientId": "taswerak",
    "name": opts.certName,
    "organizationName": opts.organizationName || "Taswerak",
    "issueDate": opts.issueDate,
    ...(opts.expirationDate && { "expirationDate": opts.expirationDate }),
    "certId": opts.certNumber,
    "certUrl": opts.url || "",
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

/**
 * Generate a Google Calendar event link.
 * For course start dates or assignment deadlines.
 */
export function getGoogleCalendarLink(opts: {
  title: string;
  description?: string;
  startDate: string; // ISO
  endDate?: string;
  location?: string;
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    details: opts.description || "",
    dates: `${formatGoogleDate(opts.startDate)}/${formatGoogleDate(opts.endDate || opts.startDate)}`,
    location: opts.location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatGoogleDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Add certificate to LinkedIn.
 */
export function shareCertificateToLinkedIn(cert: {
  studentName: string;
  courseName: string;
  certificateNumber: string;
  issuedAt: Date | string;
  verifyUrl: string;
}): string {
  const issueDateStr = typeof cert.issuedAt === "string" ? cert.issuedAt : cert.issuedAt.toISOString();
  return getLinkedInCertificateLink({
    certName: `${cert.courseName} — تصويرك`,
    certNumber: cert.certificateNumber,
    issueDate: issueDateStr,
    url: cert.verifyUrl,
  });
}

/**
 * Share course on social media.
 */
export function shareCourseLinks(courseName: string, courseUrl: string): {
  whatsapp: string;
  twitter: string;
  telegram: string;
  linkedin: string;
  facebook: string;
  copyLink: string;
} {
  const text = `تعلّم ${courseName} على منصة تصويرك! 📸`;
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + courseUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(courseUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(courseUrl)}&text=${encodeURIComponent(text)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(courseUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(courseUrl)}`,
    copyLink: courseUrl,
  };
}

// ====================================================================
// Webhook system — for Zapier/n8n/custom integrations
// ====================================================================

/**
 * Trigger a webhook to an external service.
 * Set WEBHOOK_URL env var to enable.
 */
export async function triggerWebhook(event: string, data: Record<string, any>): Promise<void> {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString(),
        source: "taswerak",
      }),
    });
  } catch (err) {
    console.warn("[webhook] trigger failed:", err);
  }
}

/**
 * Available webhook events.
 */
export const WEBHOOK_EVENTS = {
  STUDENT_SIGNUP: "student.signup",
  PAYMENT_APPROVED: "payment.approved",
  PAYMENT_REJECTED: "payment.rejected",
  COURSE_COMPLETED: "course.completed",
  CERTIFICATE_ISSUED: "certificate.issued",
  SUBMISSION_UPLOADED: "submission.uploaded",
  CRITIQUE_SUBMITTED: "critique.submitted",
  TICKET_CREATED: "ticket.created",
  REVIEW_SUBMITTED: "review.submitted",
} as const;
