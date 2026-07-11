// ====================================================================
// Certificate PDF generator
// Generates a branded PDF certificate with QR code
// Uses Puppeteer (headless Chrome) — install with: npm install puppeteer
//
// Fallback: if Puppeteer not available, generates a simple HTML
// that the browser can print as PDF.
// ====================================================================

import { generateQrDataUrl } from "@/lib/services/qr";

export interface CertificateData {
  studentName: string;
  courseName: string;
  certificateNumber: string;
  issuedAt: Date;
  grade?: string | null;
  verifyToken?: string;
  verifyUrl: string;
  instructorName?: string | null;
}

/**
 * Generate PDF certificate as a Buffer.
 * Uses Puppeteer if available, otherwise returns null (caller falls back to HTML).
 */
export async function generateCertificatePdf(data: CertificateData): Promise<Buffer | null> {
  // Try Puppeteer (lazy import — package may not be installed)
  try {
    // @ts-ignore — puppeteer is optional
    const puppeteer = (await import(/* webpackIgnore: true */ /* @vite-ignore */ "puppeteer")).default;
    const html = await generateCertificateHtml(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    await browser.close();
    return Buffer.from(pdf);
  } catch (err) {
    console.warn("[pdf] Puppeteer not available, falling back to HTML:", (err as Error).message);
    return null;
  }
}

/**
 * Generate certificate as HTML (for browser print-to-PDF fallback).
 */
export async function generateCertificateHtml(data: CertificateData): Promise<string> {
  const qrDataUrl = await generateQrDataUrl(data.verifyUrl);
  const issuedDateStr = data.issuedAt.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>شهادة - ${data.studentName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&family=Tajawal:wght@400;500;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Tajawal', sans-serif;
      width: 297mm;
      height: 210mm;
      background: white;
      position: relative;
      overflow: hidden;
    }
    .certificate {
      width: 100%;
      height: 100%;
      padding: 40px 60px;
      position: relative;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 4px solid transparent;
      background-clip: padding-box;
    }
    .border-gradient {
      position: absolute;
      inset: 0;
      padding: 4px;
      background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221);
      border-radius: 0;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }
    .corner-decoration {
      position: absolute;
      width: 60px;
      height: 60px;
    }
    .corner-tl { top: 20px; right: 20px; border-top: 3px solid #0A9ED9; border-right: 3px solid #0A9ED9; }
    .corner-tr { top: 20px; left: 20px; border-top: 3px solid #00A3AA; border-left: 3px solid #00A3AA; }
    .corner-bl { bottom: 20px; right: 20px; border-bottom: 3px solid #D65221; border-right: 3px solid #D65221; }
    .corner-br { bottom: 20px; left: 20px; border-bottom: 3px solid #0A9ED9; border-left: 3px solid #0A9ED9; }
    .logo {
      text-align: center;
      margin-top: 20px;
    }
    .logo-circle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 70px;
      height: 70px;
      border-radius: 16px;
      background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221);
      color: white;
      font-family: 'Cairo', sans-serif;
      font-size: 32px;
      font-weight: 800;
    }
    .brand-name {
      font-family: 'Cairo', sans-serif;
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #0A9ED9, #00A3AA, #D65221);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-top: 8px;
    }
    .title {
      text-align: center;
      font-family: 'Cairo', sans-serif;
      font-size: 16px;
      color: #6b7280;
      margin-top: 30px;
      letter-spacing: 2px;
    }
    .student-name {
      text-align: center;
      font-family: 'Cairo', sans-serif;
      font-size: 42px;
      font-weight: 800;
      color: #1f2937;
      margin-top: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e5e7eb;
      display: inline-block;
      min-width: 60%;
    }
    .student-name-wrap { text-align: center; }
    .completion-text {
      text-align: center;
      font-size: 16px;
      color: #6b7280;
      margin-top: 16px;
    }
    .course-name {
      text-align: center;
      font-family: 'Cairo', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #0A9ED9;
      margin-top: 12px;
    }
    .footer {
      position: absolute;
      bottom: 50px;
      left: 60px;
      right: 60px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .signature-block { text-align: center; }
    .signature-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .signature-name {
      font-family: 'Cairo', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
    }
    .signature-line {
      width: 150px;
      border-top: 1px solid #9ca3af;
      margin: 8px 0;
    }
    .qr-block { text-align: center; }
    .qr-img {
      width: 80px;
      height: 80px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 4px;
    }
    .cert-number {
      font-family: monospace;
      font-size: 10px;
      color: #6b7280;
      margin-top: 4px;
    }
    .verify-text {
      font-size: 10px;
      color: #6b7280;
      max-width: 200px;
      text-align: center;
    }
    .grade-badge {
      display: inline-block;
      background: linear-gradient(135deg, #0A9ED9, #00A3AA);
      color: white;
      padding: 4px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 16px;
    }
    .seal {
      position: absolute;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      width: 90px;
      height: 90px;
      border: 3px solid #D65221;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #D65221;
      font-family: 'Cairo', sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-align: center;
      opacity: 0.6;
      transform: translateX(-50%) rotate(-15deg);
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="border-gradient"></div>
    <div class="corner-decoration corner-tl"></div>
    <div class="corner-decoration corner-tr"></div>
    <div class="corner-decoration corner-bl"></div>
    <div class="corner-decoration corner-br"></div>

    <div class="logo">
      <div class="logo-circle">ت</div>
      <div class="brand-name">تصويرك</div>
    </div>

    <div class="title">شهادة إتمام دورة</div>

    <div class="student-name-wrap">
      <span class="student-name">${data.studentName}</span>
    </div>

    <div class="completion-text">تم بنجاح إكمال دورة</div>
    <div class="course-name">${data.courseName}</div>

    ${data.grade ? `<div style="text-align:center;"><span class="grade-badge">التقدير: ${data.grade}</span></div>` : ""}

    <div class="seal">تصويرك<br>معتمد</div>

    <div class="footer">
      <div class="signature-block">
        <div class="signature-label">تاريخ الإصدار</div>
        <div class="signature-line"></div>
        <div class="signature-name">${issuedDateStr}</div>
      </div>

      <div class="qr-block">
        <img src="${qrDataUrl}" alt="QR" class="qr-img" />
        <div class="verify-text">امسح للتحقق من صحة الشهادة</div>
        <div class="cert-number" dir="ltr">${data.certificateNumber}</div>
      </div>

      <div class="signature-block">
        <div class="signature-label">توقيع المدرّب</div>
        <div class="signature-line"></div>
        <div class="signature-name">${data.instructorName || "أحمد زغلول"}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
