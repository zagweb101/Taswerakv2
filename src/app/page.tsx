import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingStats } from "@/components/landing/landing-stats";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingCourses } from "@/components/landing/landing-courses";
import { LandingInstructor } from "@/components/landing/landing-instructor";
import { LandingTestimonials } from "@/components/landing/landing-testimonials";
import { LandingCTA } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNavbar />
      <main className="flex-1">
        <LandingHero />
        <LandingStats />
        <LandingHowItWorks />
        <LandingCourses />
        <LandingInstructor />
        <LandingTestimonials />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
