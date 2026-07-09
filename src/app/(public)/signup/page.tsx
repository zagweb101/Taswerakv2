import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { brandGradientText } from "@/lib/brand";

export default function SignupPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background — soft brand gradient blobs */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-bl from-[#0A9ED9]/8 via-[#00A3AA]/6 to-[#D65221]/8" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-[#0A9ED9]/15 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-[#D65221]/15 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-11 w-11 rounded-xl brand-gradient flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
            ت
          </div>
          <span className={`text-3xl font-extrabold ${brandGradientText}`}>
            تصويرك
          </span>
        </Link>

        <SignupForm />
      </div>
    </main>
  );
}
