// ====================================================================
// Taswerak — MinIO (S3-compatible) storage client
// Used for: payment receipts, assignment submissions, certificates QR
// Falls back to local file storage if MinIO is unreachable.
// ====================================================================

import { Client, BucketItem } from "minio";
import { promises as fs } from "fs";
import path from "path";

const endpoint = process.env.MINIO_ENDPOINT || "http://localhost:9000";
const port = parseInt(process.env.MINIO_PORT || "9000", 10);
const useSSL = process.env.MINIO_USE_SSL === "true";
const accessKey = process.env.MINIO_ACCESS_KEY || "";
const secretKey = process.env.MINIO_SECRET_KEY || "";
const bucket = process.env.MINIO_BUCKET || "taswerak-uploads";
const publicUrl = process.env.MINIO_PUBLIC_URL || endpoint;

let client: Client | null = null;
let clientInitFailed = false;

try {
  if (accessKey && secretKey) {
    client = new Client({
      endPoint: endpoint.replace(/^https?:\/\//, ""),
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }
} catch (err) {
  console.warn("[minio] init failed, will use local fallback:", err);
  clientInitFailed = true;
}

/**
 * Upload a file to MinIO (or local fallback).
 * @returns the public URL of the uploaded file
 */
export async function uploadFile(
  buffer: Buffer,
  objectKey: string,
  contentType: string
): Promise<{ url: string; provider: "minio" | "local" }> {
  // Try MinIO first
  if (client) {
    try {
      await ensureBucket();
      await client.putObject(bucket, objectKey, buffer, buffer.length, {
        "Content-Type": contentType,
      });
      const url = `${publicUrl}/${bucket}/${objectKey}`;
      return { url, provider: "minio" };
    } catch (err) {
      console.warn("[minio] upload failed, falling back to local:", err);
    }
  }

  // Local fallback — write to /home/z/my-project/upload/
  const localDir = "/home/z/my-project/upload";
  await fs.mkdir(localDir, { recursive: true });
  const localPath = path.join(localDir, objectKey.replace(/\//g, "_"));
  await fs.writeFile(localPath, buffer);
  return { url: `/api/files/${objectKey.replace(/\//g, "_")}`, provider: "local" };
}

/**
 * Generate a unique object key for a file.
 * Pattern: {folder}/{yyyy}/{mm}/{cuid}.{ext}
 */
export function makeObjectKey(folder: string, filename: string): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const random = Math.random().toString(36).slice(2, 10);
  return `${folder}/${yyyy}/${mm}/${random}_${safeName}`;
}

/**
 * Ensure the bucket exists (creates if missing).
 */
async function ensureBucket(): Promise<void> {
  if (!client) return;
  try {
    const exists = await client.bucketExists(bucket);
    if (!exists) {
      await client.makeBucket(bucket);
      // Make bucket publicly readable for image URLs
      await client.setBucketPolicy(
        bucket,
        JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        })
      );
    }
  } catch (err) {
    // Bucket policy may fail in some MinIO versions — non-fatal
    console.warn("[minio] ensureBucket warning:", err);
  }
}

export const storageStatus = {
  minioAvailable: !!client && !clientInitFailed,
  bucket,
  publicUrl,
};
