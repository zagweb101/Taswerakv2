import { db } from "@/lib/db";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { brandGradientText } from "@/lib/brand";

export async function ReviewsSection({ courseId }: { courseId: string }) {
  if (!courseId) return null;

  let reviews: any[] = [];
  let avgRating = 0;
  let count = 0;

  try {
    reviews = await db.review.findMany({
      where: { courseId, isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        role: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });
    count = reviews.length;
    if (count > 0) {
      avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / count;
    }
  } catch {
    // DB unavailable
    return null;
  }

  if (count === 0) return null;

  return (
    <section className="container mx-auto px-4 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-extrabold">
          آراء <span className={brandGradientText}>الطلاب</span>
        </h2>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-5 w-5 ${
                  s <= Math.round(avgRating)
                    ? "fill-[#D65221] text-[#D65221]"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="font-bold text-lg">{avgRating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({count} تقييم)</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <Card key={r.id} className="rounded-2xl border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full brand-gradient flex items-center justify-center text-white font-bold">
                  {r.name?.charAt(0) || "؟"}
                </div>
                <div>
                  <div className="font-semibold text-sm">{r.name}</div>
                  {r.role && <div className="text-xs text-muted-foreground">{r.role}</div>}
                </div>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3.5 w-3.5 ${
                      s <= r.rating ? "fill-[#D65221] text-[#D65221]" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              {r.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  "{r.comment}"
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
