import Link from "next/link";
import { ArrowLeft, Camera, Target, Heart, Sparkles, Award } from "lucide-react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";
import { brandGradientText } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "عن تصويرك | Taswerak",
  description: "تعرّف على قصة منصة تصويرك ورسالتها في تعليم التصوير الفوتوغرافي.",
};

const values = [
  {
    icon: Target,
    title: "رسالتنا",
    text: "تمكين الجيل القادم من المصورين السعوديين من احتراف فن التصوير عبر تعليم عملي ومنظّم.",
    color: "#0A9ED9",
  },
  {
    icon: Heart,
    title: "قيمنا",
    text: "نؤمن بأن التصوير لغة بصرية يجب أن تُتعلّم بالتطبيق لا بال theory فقط — لذلك كل دورة فيها نقد تفصيلي.",
    color: "#00A3AA",
  },
  {
    icon: Sparkles,
    title: "رؤيتنا",
    text: "أن نكون المنصة العربية الأولى لتعليم التصوير الفوتوغرافي الاحترافي، انطلاقاً من جدة.",
    color: "#D65221",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNavbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 -z-10 brand-gradient-soft" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0A9ED9]/15 rounded-full blur-3xl -z-10" />
          <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24 text-center">
            <Camera className="h-12 w-12 mx-auto text-[#0A9ED9] mb-4" />
            <h1 className="text-4xl lg:text-5xl font-extrabold">
              <span className={brandGradientText}>قصتنا</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
              منصة تصويرك وُلدت من شغف بالتصوير، لتنقل هذا الشغف لكل من يريد تعلّمه.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl mx-auto space-y-6 text-lg leading-relaxed text-foreground/90">
            <p>
              بدأت قصة <span className="font-bold brand-gradient-text">تصويرك</span> من
              جدة، المملكة العربية السعودية، حين لاحظ المدرّب{" "}
              <span className="font-bold">أحمد زغلول</span> خلال سنوات خبرته أن
              المصورين المبتدئين يعانون من فجوة بين المحتوى النظري المتوفّر
              والتطبيق العملي الذي يحتاجونه فعلاً.
            </p>
            <p>
              كثير من المصورين يشاهدون ساعات من المحتوى دون أن يحصلوا على نقد
              حقيقي على أعمالهم، فيبقون في نفس المستوى. من هنا جاءت فكرة تصويرك:
              منصة لا تكتفي ببث المحاضرات، بل تتبع كل طالب في رحلته عبر نقد
              تفصيلي على صوره بـ Pin Comments، حتى يرى بنفسه أين يتحسّن.
            </p>
            <p>
              اليوم، تضم المنصة ثلاث دورات متكاملة — أساسيات التصوير، تصوير
              البيوتي في 12 محاضرة، وميكب توتوريال — مع مئات الطلاب الذين
              تحوّل شغفهم إلى مهارة قابلة للتسويق. ورغم أننا نبدأ بمدرّب واحد،
              فإن المنصة مصمّمة لتستوعب لاحقاً مدرّبين متخصصين في مجالات أخرى
              من التصوير.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="container mx-auto px-4 lg:px-8 pb-16 lg:pb-20">
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl bg-card border border-border/60 p-6 hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${v.color}15` }}
                >
                  <v.icon className="h-6 w-6" style={{ color: v.color }} />
                </div>
                <h3 className="text-xl font-bold mb-2">{v.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Numbers */}
        <section className="container mx-auto px-4 lg:px-8 pb-16 lg:pb-20">
          <div className="rounded-2xl brand-gradient-soft border border-border/60 p-8 lg:p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <Stat number="+10" label="سنوات خبرة" />
              <Stat number="+500" label="طالب وطالبة" />
              <Stat number="+200" label="شهادة موثّقة" />
              <Stat number="+50" label="محاضرة متخصصة" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 lg:px-8 pb-20">
          <div className="text-center max-w-xl mx-auto">
            <Award className="h-12 w-12 mx-auto text-[#D65221] mb-4" />
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">
              جاهز تنضم لعائلة تصويرك؟
            </h2>
            <p className="text-muted-foreground mb-6">
              ابدأ رحلتك اليوم وكن جزءاً من قصص النجاح القادمة.
            </p>
            <Link href="/signup">
              <Button className="rounded-xl brand-gradient text-white hover:opacity-90 h-12 px-8">
                ابدأ الآن
                <ArrowLeft className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-3xl lg:text-4xl font-extrabold brand-gradient-text">
        {number}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
