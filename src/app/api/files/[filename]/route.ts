// ====================================================================
// GET /api/files/:filename
// Serves files from the local fallback storage (.upload/ directory).
// Used when MinIO is unreachable and files are stored locally.
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Map file extensions to MIME types
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Prevent directory traversal attacks — only use the basename
    const safeFilename = path.basename(filename);

    // Reject if filename changed (attempted traversal)
    if (safeFilename !== filename || safeFilename.includes("..")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const filePath = path.join(process.cwd(), ".upload", safeFilename);

    // Check file exists
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    const buffer = await fs.readFile(filePath);

    // Determine MIME type from extension
    const ext = path.extname(safeFilename).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[api/files] error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
