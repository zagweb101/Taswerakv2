import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { CouponsManager } from "@/components/admin/coupons-manager";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin");

  let coupons: any[] = [];
  let dbError = false;
  try {
    coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (err) {
    console.error("[admin/coupons] DB error:", err);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="إدارة الكوبونات"
        description="أنشئ وأدر كوبونات الخصم للعروض التسويقية"
      />
      <CouponsManager initialCoupons={coupons as any} dbError={dbError} />
    </div>
  );
}
