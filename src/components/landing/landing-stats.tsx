import { Users, BookOpen, Award, Camera } from "lucide-react";

const stats = [
  { icon: Users, label: "طالب وطالبة", value: "+500", tint: "text-[#0A9ED9]", bg: "bg-[#0A9ED9]/10" },
  { icon: BookOpen, label: "محاضرة متخصصة", value: "+50", tint: "text-[#00A3AA]", bg: "bg-[#00A3AA]/10" },
  { icon: Award, label: "شهادة موثّقة", value: "+200", tint: "text-[#D65221]", bg: "bg-[#D65221]/10" },
  { icon: Camera, label: "دورة متكاملة", value: "3+", tint: "text-purple-600", bg: "bg-purple-100" },
];

export function LandingStats() {
  return (
    <section className="container mx-auto px-4 lg:px-8 -mt-4 lg:-mt-8 relative z-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl glass border-white/60 p-5 text-center hover:shadow-lg transition-shadow"
          >
            <div className={`mx-auto h-12 w-12 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`h-6 w-6 ${s.tint}`} />
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold">
              {s.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
