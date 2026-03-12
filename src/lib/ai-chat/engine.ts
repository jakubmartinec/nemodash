import type { InvoiceData, SettlementData } from "./types";
import type { Tenant } from "@/lib/types";

// Spočítá vyúčtování záloh nájemníka na vodu
export function computeSettlement(
  invoice: InvoiceData,
  tenant: Tenant,
  newSupplierAdvance: number
): SettlementData {
  const monthlyAdvance = tenant.advances?.water ?? 0;
  const { periodMonths: months, toPayNumber: actualCost } = invoice;
  const totalAdvances = monthlyAdvance * months;
  const difference = actualCost - totalAdvances;
  const monthlyActual = Math.round(actualCost / months);
  // Zaokrouhlit nahoru na stovky
  const suggestedNewAdvance = Math.ceil(monthlyActual / 100) * 100;

  return {
    tenantName: tenant.name,
    monthlyAdvance,
    months,
    totalAdvances,
    actualCost,
    difference,
    isUnderpaid: difference > 0,
    suggestedNewAdvance,
    newSupplierAdvance,
  };
}

// Fáze 1 — automatické kroky od spuštění dema (delay v ms)
export const PHASE1_DELAYS = [
  { delay: 600,  type: "text" as const,              contentKey: "analyzing" },
  { delay: 1800, type: "text" as const,              contentKey: "recognizing" },
  { delay: 2800, type: "text" as const,              contentKey: "extracting" },
  { delay: 4200, type: "invoice_extraction" as const, contentKey: null },
  { delay: 5800, type: "property_match" as const,     contentKey: null },
];

// Fáze 2 — kroky po potvrzení přiřazení nemovitosti
export const PHASE2_DELAYS = {
  settlement: 800,
  proposal: 1800,
};

// Formátování CZK
export function formatCZK(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(amount);
}
