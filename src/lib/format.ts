// Sdílené formátování čísel a dat (Intl API)

function intlLocale(locale: string): string {
  return locale === "en" ? "en-GB" : "cs-CZ";
}

// Částka v Kč; `precise` zobrazí haléře (vyúčtování)
export function formatCZK(amount: number, locale = "cs", precise = false): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: precise ? 2 : 0,
    maximumFractionDigits: precise ? 2 : 0,
  }).format(amount);
}

export function formatDate(dateStr: string, locale = "cs"): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatNumber(value: number, locale = "cs", maximumFractionDigits = 0): string {
  return new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits }).format(value);
}
