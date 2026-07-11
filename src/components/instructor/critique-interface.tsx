"use client";

import { useState, useRef, useTransition } from "react";
import { Loader2, Save, CheckCircle2, MessageSquare, X, Trash2, Pin } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PinComment {
  id: string;
  x: number; // 0-100 (%)
  y: number; // 0-100 (%)
  text: string;
  authorId: string;
  createdAt: string;
}

interface Props {
  submissionId: string;
  imageUrl: string;
  existingCritique: string | null;
  existingPinComments: PinComment[];
  currentStatus: string;
  reviewerId: string;
}

export function CritiqueInterface({
  submissionId,
  imageUrl,
  existingCritique,
  existingPinComments,
  currentStatus,
  reviewerId,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [critique, setCritique] = useState(existingCritique || "");
  const [pins, setPins] = useState<PinComment[]>(existingPinComments);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [pinText, setPinText] = useState("");
  const [newStatus, setNewStatus] = useState(currentStatus);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPin({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    setPinText("");
  };

  const addPin = () => {
    if (!pendingPin || !pinText.trim()) return;
    const newPin: PinComment = {
      id: `pin_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      x: pendingPin.x,
      y: pendingPin.y,
      text: pinText.trim(),
      authorId: reviewerId,
      createdAt: new Date().toISOString(),
    };
    setPins([...pins, newPin]);
    setPendingPin(null);
    setPinText("");
    toast.success("تم إضافة التعليق");
  };

  const removePin = (id: string) => {
    setPins(pins.filter((p) => p.id !== id));
  };

  const save = () => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/instructor/submissions/${submissionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            critique,
            pinComments: pins,
            status: newStatus,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "فشل الحفظ");
        }
        toast.success("تم حفظ النقد بنجاح");
        // Optionally redirect back to critiques list
        setTimeout(() => {
          window.location.href = "/instructor/critiques";
        }, 1000);
      } catch (err: any) {
        toast.error(err.message || "فشل الحفظ");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Image with pin comments */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Pin className="h-5 w-5 text-[#D65221]" />
            النقد على الصورة
          </CardTitle>
          <CardDescription>
            اضغط على أي مكان في الصورة لإضافة تعليق دقيق (Pin)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="relative inline-block w-full cursor-crosshair rounded-xl overflow-hidden border border-border bg-muted/30"
            onClick={onImageClick}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageUrl}
              alt="عمل الطالب"
              className="w-full h-auto select-none"
              draggable={false}
            />
            {/* Existing pins */}
            {pins.map((pin, idx) => (
              <div
                key={pin.id}
                className="absolute group"
                style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -50%)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-7 w-7 rounded-full brand-gradient text-white text-xs font-bold flex items-center justify-center shadow-md cursor-pointer ring-2 ring-white">
                  {(idx + 1).toLocaleString("ar-SA")}
                </div>
                <div className="absolute top-9 right-0 bg-card border border-border rounded-lg p-2 shadow-lg max-w-xs hidden group-hover:block z-10">
                  <div className="text-xs text-muted-foreground mb-1">
                    تعليق #{(idx + 1).toLocaleString("ar-SA")}
                  </div>
                  <p className="text-sm">{pin.text}</p>
                  <button
                    onClick={() => removePin(pin.id)}
                    className="mt-2 text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    حذف
                  </button>
                </div>
              </div>
            ))}
            {/* Pending pin (being added) */}
            {pendingPin && (
              <div
                className="absolute"
                style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%`, transform: "translate(-50%, -50%)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-7 w-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-md ring-2 ring-white animate-pulse">
                  +
                </div>
                <div className="absolute top-9 right-0 bg-card border border-border rounded-lg p-3 shadow-lg w-64 z-10">
                  <Textarea
                    autoFocus
                    value={pinText}
                    onChange={(e) => setPinText(e.target.value)}
                    placeholder="اكتب تعليقك هنا..."
                    className="rounded-lg min-h-[60px] text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" className="rounded-lg flex-1 h-8" onClick={addPin} disabled={!pinText.trim()}>
                      إضافة
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-lg h-8" onClick={() => setPendingPin(null)}>
                      إلغاء
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pin list */}
          {pins.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">
                التعليقات ({pins.length.toLocaleString("ar-SA")})
              </div>
              {pins.map((pin, idx) => (
                <div key={pin.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                  <div className="h-6 w-6 rounded-full brand-gradient text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {(idx + 1).toLocaleString("ar-SA")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{pin.text}</p>
                  </div>
                  <button
                    onClick={() => removePin(pin.id)}
                    className="text-red-600 hover:text-red-700 shrink-0"
                    aria-label="حذف"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Text critique */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#00A3AA]" />
            النقد الكتابي
          </CardTitle>
          <CardDescription>
            اكتب نقداً عاماً للعمل — سيُرسل للطالب عبر الإشعارات + البريد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="critique">نص النقد</Label>
            <Textarea
              id="critique"
              value={critique}
              onChange={(e) => setCritique(e.target.value)}
              className="rounded-xl min-h-[160px]"
              placeholder="مثال: التكوين جيد لكن الإضاءة على الجانب الأيمن قوية. جربي تقليل ISO إلى 200 وتعريض أطول..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Status + Save */}
      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>حالة التسليم بعد النقد</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNDER_REVIEW">قيد المراجعة (لم يكتمل النقد)</SelectItem>
                <SelectItem value="CRITIQUED">تم النقد — يحتاج عمل إضافي</SelectItem>
                <SelectItem value="APPROVED">معتمد — عمل ممتاز</SelectItem>
                <SelectItem value="RESUBMITTED">مطلوب إعادة التسليم</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => window.history.back()}
            >
              إلغاء
            </Button>
            <Button
              disabled={pending}
              onClick={save}
              className="rounded-xl brand-gradient text-white hover:opacity-90"
            >
              {pending ? (
                <><Loader2 className="h-4 w-4 animate-spin ml-1" /> جارٍ الحفظ...</>
              ) : (
                <><Save className="h-4 w-4 ml-1" /> حفظ النقد</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
