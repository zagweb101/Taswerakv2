import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ContactForm } from "@/components/landing/contact-form";
import { brandGradientText } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "تواصل معنا | تصويرك",
  description: "تواصل مع فريق تصويرك — نحن هنا للإجابة عن استفساراتك.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNavbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 -z-10 brand-gradient-soft" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#00A3AA]/15 rounded-full blur-3xl -z-10" />
          <div className="container mx-auto px-4 lg:px-8 py-14 lg:py-20 text-center">
            <h1 className="text-4xl lg:text-5xl font-extrabold">
              <span className={brandGradientText}>تواصل معنا</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
              لديك سؤال عن دورة، طريقة الدفع، أو أي استفسار آخر؟ فريقنا جاهز
              لمساعدتك خلال 24 ساعة.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="container mx-auto px-4 lg:px-8 py-10 lg:py-14">
          <ContactForm />
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
