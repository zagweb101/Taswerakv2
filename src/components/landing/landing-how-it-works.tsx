import { UserPlus, Wallet, BookOpen, Award } from "lucide-react";
import { brandGradientText } from "@/lib/brand";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    icon: UserPlus,
    title: "أنشئ حساباً",
    desc: "سجّل كطالب في أقل من دقيقة — بريد وكلمة مرور فقط.",
    color: "#0A9ED9",
    num: "١",
  },
  {
    icon: Wallet,
    title: "ادفع يدوياً",
    desc: "حوّل الرسوم بنكيًا وارفع صورة الإيصال — اعتماد يدوي من المدرّب.",
    color: "#00A3AA",
    num: "٢",
  },
  {
    icon: BookOpen,
    title: "تعلّم وطبّق",
    desc: "شاهد المحاضرات، رفع أعمالك مع EXIF، واستلم نقداً تفصيلياً بـ Pin.",
    color: "#D65221",
    num: "٣",
  },
  {
    icon: Award,
    title: "احصل على شهادتك",
    desc: "بعد إتمام الدورة، استلم شهادة موثّقة بـ QR قابلة للمشاركة.",
    color: "#0A9ED9",
    num: "٤",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge className="bg-[#00A3AA]/10 text-[#00A3AA] hover:bg-[#00A3AA]/15">
          كيف تعمل
        </Badge>
        <h2 className="text-3xl lg:text-4xl font-extrabold mt-4">
          من <span className={brandGradientText}>التسجيل للاحتراف</span> في 4 خطوات
        </h2>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          مسار واضح ومنظّم — تعرف بالضبط ماذا تنتظر في كل مرحلة
        </p>
      </div>

      <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Connector line */}
        <div className="hidden lg:block absolute top-1/2 right-0 left-0 h-0.5 bg-gradient-to-l from-[#0A9ED9]/30 via-[#00A3AA]/30 to-[#D65221]/30 -z-10" />

        {steps.map((step) => (
          <div
            key={step.title}
            className="relative rounded-2xl bg-card border border-border/60 p-6 hover:shadow-lg transition-shadow"
          >
            {/* Step number */}
            <div className="absolute -top-3 -right-3 h-9 w-9 rounded-full brand-gradient text-white font-bold text-sm flex items-center justify-center shadow-md">
              {step.num}
            </div>

            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${step.color}15` }}
            >
              <step.icon className="h-6 w-6" style={{ color: step.color }} />
            </div>

            <h3 className="font-bold text-lg mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
