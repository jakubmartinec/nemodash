// Konstanty a enum mapování

// Typy jsou importovány dle potřeby z ./types

// Referenční „dnešek“ mock dat — všechny stavy se počítají vůči němu.
// Po napojení na databázi stačí vrátit new Date().
export const REFERENCE_DATE = "2026-03-08";

export function getToday(): Date {
  return new Date(REFERENCE_DATE);
}

export function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - getToday().getTime()) / (1000 * 60 * 60 * 24));
}

// Počet dní pro stavové indikátory
export const INSPECTION_EXPIRING_THRESHOLD_DAYS = 60;
export const CONTRACT_EXPIRING_THRESHOLD_DAYS = 90;

// Barvy stavů (Tailwind třídy)
export const STATUS_COLORS = {
  valid: "text-green-600 bg-green-50 border-green-200",
  expiring_soon: "text-yellow-600 bg-yellow-50 border-yellow-200",
  expired: "text-red-600 bg-red-50 border-red-200",
  paid: "text-green-600 bg-green-50 border-green-200",
  pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
  overdue: "text-red-600 bg-red-50 border-red-200",
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
