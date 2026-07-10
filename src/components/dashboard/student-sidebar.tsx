import {
  LayoutDashboard,
  BookOpen,
  ReceiptText,
  Award,
  Settings,
  Bell,
} from "lucide-react";
import type { NavItem } from "@/components/dashboard/dashboard-shell";

export const studentNav: NavItem[] = [
  { href: "/student", label: "نظرة عامة", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/student/courses", label: "دوراتي", icon: <BookOpen className="h-4 w-4" /> },
  { href: "/student/payments", label: "إيصالات الدفع", icon: <ReceiptText className="h-4 w-4" /> },
  { href: "/student/certificates", label: "شهاداتي", icon: <Award className="h-4 w-4" /> },
  { href: "/student/notifications", label: "الإشعارات", icon: <Bell className="h-4 w-4" /> },
  { href: "/student/settings", label: "الإعدادات", icon: <Settings className="h-4 w-4" /> },
];
