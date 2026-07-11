import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { legalLastUpdated, termsOfService } from "@/lib/legal-content";
import { brandGradientText } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `${termsOfService.title} | تصويرك`,
  description: "الشروط والأحكام لاستخدام منصة تصويرك",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNavbar />
      <main className="flex-1">
        <article className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 max-w-3xl">
          <header className="mb-10 text-center">
            <h1 className={`text-3xl lg:text-4xl font-extrabold ${brandGradientText}`}>
              {termsOfService.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-3">
              آخر تحديث: {legalLastUpdated}
            </p>
          </header>

          <div className="space-y-8">
            {termsOfService.sections.map((section, i) => (
              <section key={i}>
                <h2 className="text-xl font-bold mb-3 text-foreground">
                  {i + 1}. {section.heading}
                </h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm lg:text-base">
                  {section.body}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
            ⚠️ <strong>تنبيه:</strong> هذه وثيقة قانونية احترافية لكنها ليست بديلاً عن مراجعة محامٍ سعودي مُرخَّص. يُنصح بمراجعتها قبل الاعتماد النهائي.
          </div>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
