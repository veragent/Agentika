import type { LucideIcon } from "lucide-react"
import { BookOpen, Home, PenLine, HelpCircle, Wrench } from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon?: LucideIcon
}

export const navItems: NavItem[] = [
  { title: "Blog", href: "/blog", icon: PenLine },
  { title: "Learn", href: "/learn", icon: BookOpen },
  { title: "AI Tools", href: "/ai-tools", icon: Wrench },
  { title: "FAQ", href: "/faq", icon: HelpCircle },
]

export const mobileNavItems: NavItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Blog", href: "/blog", icon: PenLine },
  { title: "Learn", href: "/learn", icon: BookOpen },
  { title: "AI Tools", href: "/ai-tools", icon: Wrench },
  { title: "FAQ", href: "/faq", icon: HelpCircle },
]
