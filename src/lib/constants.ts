// Konstanty a enum mapování

// Typy jsou importovány dle potřeby z ./types

// Referenční „dnešek“ demo dat — všechny stavy se počítají vůči němu.
// S ostrými daty (Firestore) platí skutečné dnešní datum.
export const REFERENCE_DATE = "2026-03-08";

export const IS_LIVE_DATA = process.env.NEXT_PUBLIC_LIVE_DATA === "1";

export function getToday(): Date {
  if (!IS_LIVE_DATA) return new Date(REFERENCE_DATE);
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - getToday().getTime()) / (1000 * 60 * 60 * 24));
}

// Počet dní pro stavové indikátory
export const INSPECTION_EXPIRING_THRESHOLD_DAYS = 60;
export const CONTRACT_EXPIRING_THRESHOLD_DAYS = 90;

// Barvy stavů (Tailwind třídy)
export const STATUS_COLORS = {
  valid: "text-success bg-success-soft border-success/30",
  expiring_soon: "text-warning bg-warning-soft border-warning/30",
  expired: "text-danger bg-danger-soft border-danger/30",
  paid: "text-success bg-success-soft border-success/30",
  pending: "text-warning bg-warning-soft border-warning/30",
  overdue: "text-danger bg-danger-soft border-danger/30",
} as const;

// Výpočet stavu revize podle data
export function getInspectionStatus(nextDueDate: string): "valid" | "expiring_soon" | "expired" {
  const diffDays = daysUntil(nextDueDate);

  if (diffDays < 0) return "expired";
  if (diffDays <= INSPECTION_EXPIRING_THRESHOLD_DAYS) return "expiring_soon";
  return "valid";
}

// Výpočet stavu smlouvy podle data
export function getContractStatus(endDate?: string): "active" | "expiring_soon" | "expired" {
  if (!endDate) return "active";

  const diffDays = daysUntil(endDate);

  if (diffDays < 0) return "expired";
  if (diffDays <= CONTRACT_EXPIRING_THRESHOLD_DAYS) return "expiring_soon";
  return "active";
}
