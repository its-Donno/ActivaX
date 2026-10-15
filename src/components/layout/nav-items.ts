import {
  Bell,
  Bookmark,
  Compass,
  Home,
  MessageCircle,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: "notifications" | "messages";
}

export const MAIN_NAV: NavItem[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/messages", label: "Messages", icon: MessageCircle, badge: "messages" },
  { href: "/activity", label: "Activity", icon: Bell, badge: "notifications" },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: User },
];

export const MOBILE_NAV: NavItem[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/activity", label: "Activity", icon: Bell, badge: "notifications" },
  { href: "/profile", label: "Profile", icon: User },
];
