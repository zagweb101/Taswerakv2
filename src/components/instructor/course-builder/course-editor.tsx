"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Loader2, Plus, Trash2, GripVertical, Video, FileText, X,
  Eye, EyeOff, ArrowRight, BookCopy, Layers, Play, Upload, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  type: string;
  videoUrl: string | null;
  pdfUrl: string | null;
  thumbnailUrl?: string | null;
  duration: number;
  order: number;
  isPreview: boolean;
  isPublished: boolean;
}

interface Section {
  id: string;
  title: string;
  titleAr: string | null;
  order: number;
  lessons: Lesson[];
}

interface CourseData {
  id?: string;
  title: string;
  titleAr: string | null;
  description: string;
  descriptionAr: string | null;
  price: number;
  discountPrice: number | null;
  currency: string;
  level: string;
  status: string;
  category: string | null;
  durationHours: number;
  thumbnailUrl: string | null;
  previewVideoUrl: string | null;
  isFeatured: boolean;
  sections?: Section[];
}

interface Props {
  mode: "create" | "edit";
  courseId?: string;
  initialData?: CourseData;
  instructorId: string;
}

export function CourseEditor({ mode, courseId, initialData, instructorId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [course, setCourse] = useState<CourseData>(
    initialData || {
      title: "",
      titleAr: "",
      description: "",
      descriptionAr: "",
      price: 499,
      discountPrice: null,
      currency: "SAR",
      level: "BEGINNER",
      status: "DRAFT",
      category: "",
      durationHours: 0,
      thumbnailUrl: null,
      previewVideoUrl: null,
      isFeatured: false,
      sections: [],
    }
  );
  const [sections, setSections] = useState<Section[]>(initialData?.sections || []);

  // ── Course metadata save ──────────────────────────────────────
  const saveCourse = async () => {
    if (!course.title || !course.description) {
      toast.error("العنوان والوصف مطلوبان");
      return;
    }
    startTransition(async () => {
      try {
        // Normalize: convert empty strings to null for optional URL fields
        // Zod url() validation rejects empty strings, so we must send null instead
        const normalizeUrl = (val: string | null | undefined): string | null => {
          if (!val || val.trim() === "") return null;
          return val.trim();
        };

        const payload = {
          title: course.title?.trim() || "",
          titleAr: course.titleAr?.trim() || null,
          description: course.description?.trim() || "",
          descriptionAr: course.descriptionAr?.trim() || null,
          price: Number(course.price) || 0,
          discountPrice: course.discountPrice ? Number(course.discountPrice) : null,
          currency: course.currency,
          level: course.level,
          category: course.category?.trim() || null,
          durationHours: Number(course.durationHours) || 0,
          thumbnailUrl: normalizeUrl(course.thumbnailUrl),
          previewVideoUrl: normalizeUrl(course.previewVideoUrl),
        };

        // Client-side validation before sending
        if (payload.title.length < 2) {
          toast.error("العنوان مطلوب (حرفان على الأقل)");
          return;
        }
        if (payload.description.length < 10) {
          toast.error("الوصف مطلوب (10 أحرف على الأقل)");
          return;
        }
        if (payload.price < 0) {
          toast.error("السعر يجب أن يكون صفر أو أكثر");
          return;
        }

        let res;
        if (mode === "create") {
          res = await fetch("/api/instructor/courses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          res = await fetch(`/api/instructor/courses/${courseId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "فشل الحفظ");

        toast.success(mode === "create" ? "تم إنشاء الدورة" : "تم تحديث الدورة");
        if (mode === "create" && data.course?.id) {
          router.push(`/instructor/courses/${data.course.id}/edit`);
        }
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  // ── Status change ─────────────────────────────────────────────
  const changeStatus = (status: string) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/instructor/courses/${courseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "فشل");
        setCourse({ ...course, status });
        toast.success(status === "PUBLISHED" ? "تم نشر الدورة" : status === "ARCHIVED" ? "تم الأرشفة" : "تم تحديث الحالة");
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  // ── Add section ───────────────────────────────────────────────
  const addSection = () => {
    const title = prompt("اسم القسم الجديد:");
    if (!title) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/instructor/sections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId,
            title,
            order: sections.length,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "فشل");
        setSections([...sections, { ...data.section, lessons: [] }]);
        toast.success("تم إضافة القسم");
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  // ── Delete section ────────────────────────────────────────────
  const deleteSection = (id: string) => {
    if (!confirm("حذف القسم سيحذف كل دروسه. متابعة؟")) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/instructor/sections/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "فشل");
        setSections(sections.filter((s) => s.id !== id));
        toast.success("تم حذف القسم");
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  // ── Add lesson ────────────────────────────────────────────────
  const addLesson = (sectionId: string) => {
    const title = prompt("عنوان الدرس:");
    if (!title) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/instructor/lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId,
            courseId,
            title,
            type: "VIDEO",
            order: sections.find((s) => s.id === sectionId)?.lessons.length || 0,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "فشل");
        setSections(sections.map((s) =>
          s.id === sectionId ? { ...s, lessons: [...s.lessons, data.lesson] } : s
        ));
        toast.success("تم إضافة الدرس");
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  // ── Delete lesson ─────────────────────────────────────────────
  const deleteLesson = (sectionId: string, lessonId: string) => {
    if (!confirm("حذف هذا الدرس؟")) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/instructor/lessons/${lessonId}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "فشل");
        setSections(sections.map((s) =>
          s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s
        ));
        toast.success("تم حذف الدرس");
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Course metadata */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookCopy className="h-5 w-5 text-[#0A9ED9]" />
            بيانات الدورة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">العنوان (إنجليزي) *</Label>
              <Input
                id="title"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                placeholder="Photography Fundamentals"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleAr">العنوان (عربي)</Label>
              <Input
                id="titleAr"
                value={course.titleAr || ""}
                onChange={(e) => setCourse({ ...course, titleAr: e.target.value })}
                placeholder="أساسيات التصوير"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="desc">الوصف *</Label>
              <Textarea
                id="desc"
                value={course.description}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                placeholder="وصف الدورة بالإنجليزي..."
                className="rounded-xl min-h-[80px]"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descAr">الوصف (عربي)</Label>
              <Textarea
                id="descAr"
                value={course.descriptionAr || ""}
                onChange={(e) => setCourse({ ...course, descriptionAr: e.target.value })}
                placeholder="وصف الدورة بالعربي..."
                className="rounded-xl min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">السعر (ر.س) *</Label>
              <Input
                id="price"
                type="number"
                value={course.price}
                onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">سعر مخفّض (اختياري)</Label>
              <Input
                id="discount"
                type="number"
                value={course.discountPrice || ""}
                onChange={(e) => setCourse({ ...course, discountPrice: e.target.value ? Number(e.target.value) : null })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>المستوى</Label>
              <Select value={course.level} onValueChange={(v) => setCourse({ ...course, level: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">مبتدئ</SelectItem>
                  <SelectItem value="INTERMEDIATE">متوسط</SelectItem>
                  <SelectItem value="ADVANCED">متقدّم</SelectItem>
                  <SelectItem value="PROFESSIONAL">احترافي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">التصنيف</Label>
              <Input
                id="category"
                value={course.category || ""}
                onChange={(e) => setCourse({ ...course, category: e.target.value })}
                placeholder="مثال: بيوتي"
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button
              onClick={saveCourse}
              disabled={pending}
              className="rounded-xl brand-gradient text-white hover:opacity-90"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 ml-1" />}
              {mode === "create" ? "إنشاء الدورة" : "حفظ التغييرات"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status + thumbnail (only in edit mode) */}
      {mode === "edit" && (
        <Card className="rounded-2xl border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#00A3AA]" />
              الحالة والنشر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={
                course.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" :
                course.status === "DRAFT" ? "bg-zinc-100 text-zinc-700" :
                course.status === "ARCHIVED" ? "bg-red-100 text-red-700" :
                "bg-amber-100 text-amber-700"
              }>
                {course.status === "PUBLISHED" ? "منشور" : course.status === "DRAFT" ? "مسودة" : course.status === "ARCHIVED" ? "مؤرشف" : "غير مُدرج"}
              </Badge>
              <div className="flex gap-2">
                {course.status !== "PUBLISHED" && (
                  <Button size="sm" onClick={() => changeStatus("PUBLISHED")} disabled={pending} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Eye className="h-3.5 w-3.5 ml-1" /> نشر
                  </Button>
                )}
                {course.status === "PUBLISHED" && (
                  <Button size="sm" variant="outline" onClick={() => changeStatus("UNLISTED")} disabled={pending} className="rounded-xl">
                    <EyeOff className="h-3.5 w-3.5 ml-1" /> إخفاء
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => changeStatus("ARCHIVED")} disabled={pending} className="rounded-xl border-red-300 text-red-600 hover:bg-red-50">
                  <Archive className="h-3.5 w-3.5 ml-1" /> أرشفة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections + Lessons (only in edit mode) */}
      {mode === "edit" && (
        <Card className="rounded-2xl border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#D65221]" />
                  أقسام الدورة ({sections.length})
                </CardTitle>
                <CardDescription>أضف أقساماً ودروساً لبناء منهج الدورة</CardDescription>
              </div>
              <Button onClick={addSection} disabled={pending} size="sm" className="rounded-xl brand-gradient text-white">
                <Plus className="h-4 w-4 ml-1" /> قسم جديد
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sections.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                لا توجد أقسام بعد. اضغط "قسم جديد" للبدء.
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section, sIdx) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    index={sIdx}
                    pending={pending}
                    onAddLesson={() => addLesson(section.id)}
                    onDeleteSection={() => deleteSection(section.id)}
                    onDeleteLesson={(lessonId) => deleteLesson(section.id, lessonId)}
                    onUpdateLesson={async (lessonId, data) => {
                      try {
                        const res = await fetch(`/api/instructor/lessons/${lessonId}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(data),
                        });
                        const result = await res.json();
                        if (!res.ok || !result.ok) throw new Error(result.error || "فشل");
                        setSections(sections.map((s) =>
                          s.id === section.id
                            ? { ...s, lessons: s.lessons.map((l) => l.id === lessonId ? { ...l, ...data } : l) }
                            : s
                        ));
                        toast.success("تم تحديث الدرس");
                      } catch (err: any) {
                        toast.error(err.message);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Back link */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => router.push("/instructor/courses")} className="rounded-xl">
          <ArrowRight className="h-4 w-4 ml-1" /> العودة للدورات
        </Button>
      </div>
    </div>
  );
}

// ── Section Card (with lessons) ────────────────────────────────
function SectionCard({
  section, index, pending, onAddLesson, onDeleteSection, onDeleteLesson, onUpdateLesson,
}: {
  section: Section;
  index: number;
  pending: boolean;
  onAddLesson: () => void;
  onDeleteSection: () => void;
  onDeleteLesson: (lessonId: string) => void;
  onUpdateLesson: (lessonId: string, data: any) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(section.title);

  const saveSectionTitle = async () => {
    setEditingTitle(false);
    if (title === section.title) return;
    try {
      const res = await fetch(`/api/instructor/sections/${section.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "فشل");
      toast.success("تم تحديث القسم");
    } catch (err: any) {
      toast.error(err.message);
      setTitle(section.title);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden">
      <div className="bg-muted/30 p-3 flex items-center gap-3">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
        <div className="h-7 w-7 rounded-lg brand-gradient text-white text-xs font-bold flex items-center justify-center">
          {(index + 1).toLocaleString("ar-SA")}
        </div>
        {editingTitle ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveSectionTitle}
            className="rounded-lg flex-1 h-8"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="font-semibold flex-1 text-right hover:bg-muted/50 px-2 py-1 rounded"
          >
            {section.title}
          </button>
        )}
        <span className="text-xs text-muted-foreground">{section.lessons.length} درس</span>
        <Button size="sm" variant="ghost" onClick={onAddLesson} disabled={pending} className="rounded-lg h-8">
          <Plus className="h-3.5 w-3.5 ml-1" /> درس
        </Button>
        <button onClick={onDeleteSection} className="text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg flex items-center justify-center" title="حذف القسم">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="divide-y divide-border/40">
        {section.lessons.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground text-center">لا توجد دروس في هذا القسم</div>
        ) : (
          section.lessons.map((lesson, lIdx) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              index={lIdx}
              pending={pending}
              onDelete={() => onDeleteLesson(lesson.id)}
              onUpdate={(data) => onUpdateLesson(lesson.id, data)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Lesson Row (with edit dialog) ──────────────────────────────
function LessonRow({
  lesson, index, pending, onDelete, onUpdate,
}: {
  lesson: Lesson;
  index: number;
  pending: boolean;
  onDelete: () => void;
  onUpdate: (data: any) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description || "");
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || "");
  const [duration, setDuration] = useState(lesson.duration);
  const [isPreview, setIsPreview] = useState(lesson.isPreview);
  const [uploading, setUploading] = useState(false);

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "lessons/videos");
      const res = await fetch("/api/instructor/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        // Show clear error message from API (including "storage not configured")
        throw new Error(data.error || "فشل الرفع");
      }
      setVideoUrl(data.url);
      toast.success("تم رفع الفيديو");
    } catch (err: any) {
      toast.error(err.message || "تعذّر رفع الملف");
    } finally {
      setUploading(false);
    }
  };

  const save = () => {
    // Normalize: empty strings → null for optional URL fields
    const normalizeUrl = (val: string): string | null => {
      if (!val || val.trim() === "") return null;
      return val.trim();
    };

    onUpdate({
      title: title?.trim() || "",
      description: description?.trim() || null,
      videoUrl: normalizeUrl(videoUrl),
      pdfUrl: normalizeUrl(lesson.pdfUrl || ""),
      thumbnailUrl: normalizeUrl(lesson.thumbnailUrl || ""),
      duration: Number(duration) || 0,
      isPreview,
    });
    setEditOpen(false);
  };

  return (
    <div className="p-3 flex items-center gap-3 hover:bg-muted/20">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <div className="h-7 w-7 rounded-lg bg-muted text-muted-foreground text-xs font-medium flex items-center justify-center">
        {(index + 1).toLocaleString("ar-SA")}
      </div>
      {lesson.videoUrl ? (
        <Video className="h-4 w-4 text-[#0A9ED9]" />
      ) : lesson.pdfUrl ? (
        <FileText className="h-4 w-4 text-[#D65221]" />
      ) : (
        <Play className="h-4 w-4 text-muted-foreground" />
      )}
      <button onClick={() => setEditOpen(true)} className="flex-1 text-right hover:underline">
        <span className="font-medium">{lesson.title}</span>
        {lesson.videoUrl && (
          <span className="text-xs text-muted-foreground mr-2">· فيديو {Math.floor(lesson.duration / 60)}د</span>
        )}
      </button>
      {lesson.isPreview && <Badge className="bg-[#00A3AA]/10 text-[#00A3AA]">معاينة مجانية</Badge>}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="rounded-lg h-8">تحرير</Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto nice-scroll">
          <DialogHeader>
            <DialogTitle>تحرير الدرس</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان الدرس</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl min-h-[80px]" />
            </div>
            <div className="space-y-2">
              <Label>رابط الفيديو</Label>
              <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="rounded-xl" dir="ltr" placeholder="https://..." />
              <div className="flex items-center gap-2 mt-1">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    className="sr-only"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
                  />
                  <span className="block text-center text-xs px-3 py-2 rounded-xl border border-dashed border-border hover:bg-muted/40 cursor-pointer">
                    {uploading ? <Loader2 className="h-3 w-3 animate-spin inline" /> : <Upload className="h-3 w-3 inline ml-1" />}
                    رفع فيديو (حتى 500MB)
                  </span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>المدة (ثانية)</Label>
                <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>معاينة مجانية؟</Label>
                <Button
                  type="button"
                  variant={isPreview ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreview(!isPreview)}
                  className="rounded-xl w-full"
                >
                  {isPreview ? <CheckCircle2 className="h-3.5 w-3.5 ml-1" /> : null}
                  {isPreview ? "نعم" : "لا"}
                </Button>
              </div>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <Button variant="outline" onClick={onDelete} className="rounded-xl text-red-600 border-red-300 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5 ml-1" /> حذف الدرس
              </Button>
              <Button onClick={save} disabled={pending} className="rounded-xl brand-gradient text-white">
                <Save className="h-3.5 w-3.5 ml-1" /> حفظ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Archive icon (since lucide doesn't have one imported above)
function Archive({ className }: { className?: string }) {
  return <Layers className={className} />;
}
