import {
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  ScrollText,
  Settings,
  ShieldCheck,
  Ticket,
  MessageSquare,
} from "lucide-react";
import type { NavItem } from "@/components/dashboard/dashboard-shell";

export const adminNav: NavItem[] = [
  { href: "/admin", label: "المؤشرات", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/users", label: "المستخدمون", icon: <Users className="h-4 w-4" /> },
  { href: "/admin/finance", label: "المالية", icon: <Wallet className="h-4 w-4" /> },
  { href: "/admin/coupons", label: "الكوبونات", icon: <Ticket className="h-4 w-4" /> },
  { href: "/admin/cms", label: "إدارة المحتوى", icon: <FileText className="h-4 w-4" /> },
  { href: "/admin/audit", label: "سجل التدقيق", icon: <ScrollText className="h-4 w-4" /> },
  { href: "/admin/support", label: "تذاكر الدعم", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/admin/settings", label: "الإعدادات", icon: <Settings className="h-4 w-4" /> },
];
