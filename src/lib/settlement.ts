// Výpočet vyúčtování záloh nájemníka
import type { UtilitySettlement } from "./types";
import { getToday } from "./constants";

export type SettlementOutcome = "underpaid" | "overpaid" | "even";
export type SettlementStatus = "open" | "overdue" | "settled";

export interface SettlementResult {
  consumption: number; // spotřeba nájemníka (m³)
  unitPrice: number; // Kč/m³ vč. DPH
  cost: number; // podíl nájemníka na nákladech
  advancesPaid: number; // zálohy zaplacené za období
  balance: number; // > 0 nedoplatek (nájemník doplácí), < 0 přeplatek
  monthlyActual: number; // skutečný měsíční náklad
  outcome: SettlementOutcome;
  status: SettlementStatus;
}

const round2 = (x: number) => Math.round(x * 100) / 100;

export function computeSettlement(s: UtilitySettlement): SettlementResult {
  const consumption = s.meterEnd - s.meterStart;
  const cost = round2((s.totalCost * consumption) / s.totalConsumption);
  const advancesPaid = s.monthlyAdvance * s.months;
  const balance = round2(cost - advancesPaid);

  let status: SettlementStatus = "open";
  if (s.settledDate) status = "settled";
  else if (new Date(s.dueDate) < getToday()) status = "overdue";

  return {
    consumption,
    unitPrice: round2(s.totalCost / s.totalConsumption),
    cost,
    advancesPaid,
    balance,
    monthlyActual: round2(cost / s.months),
    // rozdíl pod 1 Kč se nevymáhá ani nevrací
    outcome: Math.abs(balance) < 1 ? "even" : balance > 0 ? "underpaid" : "overpaid",
    status,
  };
}
