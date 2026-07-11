import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function ReferralRedirectPage({ params }: PageProps) {
  const { code } = await params;

  // Optionally: track the referral click
  try {
    // Find user by referral code (we'll use a simple approach: code = base64 of userId)
    // For now, just redirect to signup with the code as query param
  } catch {
    // ignore errors
  }

  redirect(`/signup?ref=${encodeURIComponent(code)}`);
}
