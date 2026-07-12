// ====================================================================
// POST /api/instructor/upload
// Upload a course asset (video, thumbnail, PDF) to storage
//   1. Validate auth (must be INSTRUCTOR or ADMIN)
//   2. Parse multipart form data (file + folder path)
//   3. Read buffer and call uploadFile
//   4. Return the public URL
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadFile, makeObjectKey } from "@/lib/services/minio";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "غير مسجّل" }, { status: 401 });
    }
    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "صلاحيات غير كافية" }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const folder = (form.get("folder") as string | null) || "lessons/videos";

    if (!file) {
      return NextResponse.json({ ok: false, error: "الملف مطلوب" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const objectKey = makeObjectKey(folder, file.name || "asset.mp4");
    const { url, provider } = await uploadFile(buffer, objectKey, file.type);

    return NextResponse.json({ ok: true, url, provider });
  } catch (err) {
    console.error("[instructor/upload] error:", err);
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع أثناء الرفع" }, { status: 500 });
  }
}
