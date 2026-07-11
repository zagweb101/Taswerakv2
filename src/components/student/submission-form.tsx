"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, X, FileImage, CheckCircle2, Camera, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Submission {
  id: string;
  imageUrl: string;
  caption: string | null;
  status: string;
}

interface Props {
  assignmentId: string;
  enrollmentId: string;
  lessonId: string | null;
  studentId: string;
  existingSubmission: Submission | null;
}

export function SubmissionForm({
  assignmentId,
  enrollmentId,
  lessonId,
  studentId,
  existingSubmission,
}: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [success, setSuccess] = useState(false);
  const [exifData, setExifData] = useState<Record<string, any> | null>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("الملف يجب أن يكون صورة");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن لا يتجاوز 10 ميجابايت");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);

    // Extract EXIF
    try {
      const exifr = (await import("exifr")).default;
      const data = await exifr.parse(f, ["Make", "Model", "LensModel", "ISO", "FNumber", "ExposureTime", "FocalLength", "DateTimeOriginal"]);
      if (data) {
        const cleaned: Record<string, any> = {};
        if (data.Make) cleaned.camera = `${data.Make} ${data.Model || ""}`.trim();
        if (data.LensModel) cleaned.lens = data.LensModel;
        if (data.ISO) cleaned.iso = data.ISO;
        if (data.FNumber) cleaned.aperture = `f/${data.FNumber}`;
        if (data.ExposureTime) cleaned.shutter = `1/${Math.round(1 / data.ExposureTime)}s`;
        if (data.FocalLength) cleaned.focalLength = `${data.FocalLength}mm`;
        if (data.DateTimeOriginal) cleaned.capturedAt = data.DateTimeOriginal.toISOString();
        if (Object.keys(cleaned).length > 0) {
          setExifData(cleaned);
          toast.success("تم استخراج بيانات EXIF من الصورة");
        }
      }
    } catch {
      // EXIF extraction optional
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("الرجاء رفع صورة");
      return;
    }

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("image", file);
        fd.append(
          "metadata",
          JSON.stringify({
            assignmentId,
            caption,
            exifData,
          })
        );

        const res = await fetch("/api/student/submissions", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "فشل التسليم");
        }

        setSuccess(true);
        toast.success("تم تسليم الواجب بنجاح! سيتم إشعار المدرّب.");
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } catch (err: any) {
        toast.error(err.message || "فشل التسليم");
      }
    });
  };

  if (success) {
    return (
      <Card className="rounded-2xl border-emerald-200 bg-emerald-50/40">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-600 mb-3" />
          <p className="font-semibold">تم تسليم واجبك بنجاح</p>
          <p className="text-sm text-muted-foreground mt-1">
            سيقوم المدرّب بمراجعة عملك وإضافة نقد تفصيلي قريباً
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5 text-[#0A9ED9]" />
          {existingSubmission ? "إعادة تسليم الواجب" : "تسليم الواجب"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Image upload */}
          <div className="space-y-2">
            <Label>صورة عملك *</Label>
            {preview ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                { }
                <img src={preview} alt="معاينة" className="w-full max-h-96 object-contain bg-muted/30" />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); setExifData(null); }}
                  className="absolute top-2 left-2 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70"
                  aria-label="إزالة"
                >
                  <X className="h-4 w-4" />
                </button>
                {exifData && (
                  <div className="absolute bottom-2 right-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
                    <div className="flex items-center gap-1 mb-1 font-medium">
                      <Camera className="h-3 w-3" />
                      بيانات EXIF
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      {Object.entries(exifData).slice(0, 6).map(([k, v]) => (
                        <div key={k}>
                          <span className="opacity-70">{k}: </span>
                          <span className="font-medium">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed border-border hover:border-[#0A9ED9]/40 hover:bg-[#0A9ED9]/5 cursor-pointer transition-colors">
                <FileImage className="h-12 w-12 text-muted-foreground" />
                <span className="text-sm font-medium">انقر لاختيار صورة</span>
                <span className="text-xs text-muted-foreground">JPG أو PNG، حتى 10 ميجابايت</span>
                <span className="text-xs text-[#0A9ED9] mt-1">سيتم استخراج بيانات EXIF تلقائياً</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={onFileChange}
                  className="sr-only"
                />
              </label>
            )}
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">وصف العمل (اختياري)</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="rounded-xl min-h-[80px]"
              placeholder="اكتب ملاحظاتك عن الصورة: الإعداد، الإضاءة، الفكرة..."
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={pending}
              className="rounded-xl brand-gradient text-white hover:opacity-90"
            >
              {pending ? (
                <><Loader2 className="h-4 w-4 animate-spin ml-1" /> جارٍ التسليم...</>
              ) : (
                <><Upload className="h-4 w-4 ml-1" /> تسليم الواجب</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
