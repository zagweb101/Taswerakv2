import {
  LayoutDashboard,
  Wallet,
  BookCopy,
  Image,
  BarChart3,
  Settings,
  Bell,
} from "lucide-react";
import type { NavItem } from "@/components/dashboard/dashboard-shell";

export const instructorNav: NavItem[] = [
  { href: "/instructor", label: "نظرة عامة", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/instructor/payments", label: "صندوق المدفوعات", icon: <Wallet className="h-4 w-4" /> },
  { href: "/instructor/courses", label: "دوراتي", icon: <BookCopy className="h-4 w-4" /> },
  { href: "/instructor/critiques", label: "نقد الأعمال", icon: <Image className="h-4 w-4" /> },
  { href: "/instructor/analytics", label: "التحليلات", icon: <BarChart3 className="h-4 w-4" /> },
  { href: "/instructor/notifications", label: "الإشعارات", icon: <Bell className="h-4 w-4" /> },
  { href: "/instructor/settings", label: "الإعدادات", icon: <Settings className="h-4 w-4" /> },
];
