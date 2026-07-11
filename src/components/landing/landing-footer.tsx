import Link from "next/link";
import { MapPin, Mail, Phone, Instagram, Youtube, Twitter } from "lucide-react";
import { brandGradientText, brand } from "@/lib/brand";
import { getCmsValues } from "@/lib/services/cms";

export async function LandingFooter() {
  const cms = await getCmsValues(["footer_note", "contact_email", "contact_phone", "city"]);
  const footerNote = cms.footer_note || `© 2026 ${brand.name} — جميع الحقوق محفوظة`;
  const contactEmail = cms.contact_email || "info@taswerak.com";
  const contactPhone = cms.contact_phone || "+966 5X XXX XXXX";
  const city = cms.city || brand.city;
  return (
    <footer className="mt-20 border-t border-border/60 bg-card/40">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg brand-gradient flex items-center justify-center text-white font-bold text-base">
                ت
              </div>
              <span className={`text-xl font-extrabold ${brandGradientText}`}>
                {brand.name}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              منصة تعليمية متخصصة في تعليم التصوير الفوتوغرافي من الصفر للاحتراف.
              أسسها المدرّب أحمد زغلول في جدة، السعودية.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-[#00A3AA]" />
              {city}، {brand.country}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">المنصة</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#courses" className="text-muted-foreground hover:text-foreground transition-colors">الدورات</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">عن تصويرك</Link></li>
              <li><Link href="/#instructor" className="text-muted-foreground hover:text-foreground transition-colors">المدرّب</Link></li>
              <li><Link href="/#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">آراء الطلاب</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">تواصل معنا</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">المساعدة</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">تسجيل الدخول</Link></li>
              <li><Link href="/signup" className="text-muted-foreground hover:text-foreground transition-colors">إنشاء حساب</Link></li>
              <li><span className="text-muted-foreground">طريقة الدفع</span></li>
              <li><span className="text-muted-foreground">الأسئلة الشائعة</span></li>
            </ul>
          </div>

          {/* Contact + Social */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">تواصل</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#0A9ED9]" />
                <span dir="ltr">{contactEmail}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#00A3AA]" />
                <span dir="ltr">{contactPhone}</span>
              </li>
            </ul>
            <div className="flex items-center gap-2 pt-2">
              <SocialIcon href="#" label="Instagram">
                <Instagram className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href="#" label="YouTube">
                <Youtube className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href="#" label="Twitter">
                <Twitter className="h-4 w-4" />
              </SocialIcon>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>{footerNote}</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-foreground">سياسة الخصوصية</Link>
            <Link href="#" className="hover:text-foreground">الشروط والأحكام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="h-9 w-9 rounded-lg bg-muted/60 hover:brand-gradient hover:text-white flex items-center justify-center text-muted-foreground transition-all"
    >
      {children}
    </a>
  );
}
