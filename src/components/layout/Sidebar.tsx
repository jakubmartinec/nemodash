"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  ClipboardCheck,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  key: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ locale, isOpen, onClose }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { key: "dashboard", href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { key: "properties", href: `/${locale}/properties`, icon: Building2 },
    { key: "payments", href: `/${locale}/payments`, icon: CreditCard },
    { key: "inspections", href: `/${locale}/inspections`, icon: ClipboardCheck },
    { key: "settings", href: `/${locale}/settings`, icon: Settings },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold select-none">
          N
        </div>
        <span className="font-semibold text-sm tracking-tight">
          {t("layout.appName")}
        </span>
      </div>

      {/* Navigace */}
      <nav className="flex-1 px-2 py-3 space-y-0.5" aria-label={t("layout.appName")}>
        {navItems.map(({ key, href, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {t(`nav.${key}`)}
          </Link>
        ))}
      </nav>

      {/* Pata sidebaru */}
      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground">© 2026 NemoDash</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — fixní, vždy viditelný */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 border-r border-border bg-sidebar text-sidebar-foreground">
        {sidebarContent}
      </aside>

      {/* Mobilní overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Mobilní drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-sidebar text-sidebar-foreground border-r border-border transition-transform duration-200 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label={t("layout.appName")}
      >
        {/* Zavírací tlačítko */}
        <button
          onClick={onClose}
          aria-label={t("layout.closeMenu")}
          className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
