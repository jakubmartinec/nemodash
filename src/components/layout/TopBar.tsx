"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Menu, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPropertyById } from "@/lib/mock-data";
import { getDashboardStats } from "@/lib/mock-data";

interface TopBarProps {
  locale: string;
  onMenuOpen: () => void;
}

// Mapování URL segmentů na i18n klíče
const SEGMENT_KEYS: Record<string, string> = {
  dashboard: "nav.dashboard",
  properties: "nav.properties",
  payments: "nav.payments",
  inspections: "nav.inspections",
  settings: "nav.settings",
};

interface Crumb {
  label: string;
  href?: string;
}

function useBreadcrumbs(pathname: string, locale: string, t: ReturnType<typeof useTranslations>): Crumb[] {
  // Odstraní locale prefix, např. /cs/properties/prop-1 → ['properties', 'prop-1']
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .slice(1); // přeskočit locale segment

  if (segments.length === 0) return [{ label: t("nav.dashboard") }];

  const crumbs: Crumb[] = [];

  segments.forEach((seg, idx) => {
    const isLast = idx === segments.length - 1;
    const href = `/${locale}/${segments.slice(0, idx + 1).join("/")}`;

    if (SEGMENT_KEYS[seg]) {
      crumbs.push({ label: t(SEGMENT_KEYS[seg] as Parameters<typeof t>[0]), href: isLast ? undefined : href });
    } else {
      // Dynamický segment — zkusíme to jako propertyId
      const property = getPropertyById(seg);
      crumbs.push({ label: property?.name ?? t("layout.propertyDetail"), href: isLast ? undefined : href });
    }
  });

  return crumbs;
}

export default function TopBar({ locale, onMenuOpen }: TopBarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const crumbs = useBreadcrumbs(pathname, locale, t);

  const stats = getDashboardStats();
  const notifCount = stats.overduePayments + stats.expiredInspections;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      {/* Hamburger — jen mobilní */}
      <button
        onClick={onMenuOpen}
        aria-label={t("layout.openMenu")}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex-1 min-w-0">
        <ol className="flex items-center gap-1 text-sm text-muted-foreground overflow-hidden">
          {crumbs.map((crumb, idx) => (
            <li key={idx} className="flex items-center gap-1 min-w-0">
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium truncate">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Pravá sekce: notifikace + uživatel */}
      <div className="flex items-center gap-1">
        {/* Notifikace */}
        <button
          aria-label={
            notifCount > 0
              ? t("layout.notificationsCount", { count: notifCount })
              : t("layout.notifications")
          }
          className="relative rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="h-5 w-5" />
          {notifCount > 0 && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold leading-none text-white",
                notifCount >= 5 ? "bg-red-500" : "bg-yellow-500"
              )}
            >
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
        </button>

        {/* Uživatelské menu — placeholder */}
        <button
          aria-label={t("layout.userMenu")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
