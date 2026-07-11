// ====================================================================
// QR code generation service
// Uses `qrcode` npm package to generate real scannable QR codes
// ====================================================================

import QRCode from "qrcode";
import { promises as fs } from "fs";
import path from "path";

/**
 * Generate a QR code as a PNG data URL.
 * @param text The text/URL to encode
 * @returns data URL (e.g., "data:image/png;base64,...")
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      width: 300,
      color: {
        dark: "#0A9ED9",
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    console.error("[qr] generation failed:", err);
    throw err;
  }
}

/**
 * Generate a QR code as a PNG Buffer (for saving to MinIO).
 */
export async function generateQrBuffer(text: string): Promise<Buffer> {
  try {
    const dataUrl = await generateQrDataUrl(text);
    const base64 = dataUrl.split(",")[1];
    return Buffer.from(base64, "base64");
  } catch (err) {
    console.error("[qr] buffer generation failed:", err);
    throw err;
  }
}

/**
 * Generate a random verification token (URL-safe).
 */
export function generateVerifyToken(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Generate a human-readable certificate number.
 * Format: TAS-YYYY-NNNNNN
 */
export function generateCertificateNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const seq = String(sequence).padStart(6, "0");
  return `TAS-${year}-${seq}`;
}
