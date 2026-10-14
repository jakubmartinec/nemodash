import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatCZK, formatDate, formatNumber } from "@/lib/format";
import { computeSettlement, type SettlementStatus } from "@/lib/settlement";
import type { UtilitySettlement } from "@/lib/types";

interface SettlementCardProps {
  settlement: UtilitySettlement;
  // tenant = "Nedoplatek", owner = "Nájemník doplatí"
  audience: "tenant" | "owner";
  compact?: boolean;
}

export const SETTLEMENT_STATUS_STYLES: Record<SettlementStatus, string> = {
  open: "bg-warning-soft text-warning border-warning/30",
  overdue: "bg-danger-soft text-danger border-danger/30",
  settled: "bg-success-soft text-success border-success/30",
};

export default function SettlementCard({ settlement: s, audience, compact = false }: SettlementCardProps) {
  const t = useTranslations("settlement");
  const locale = useLocale();
  const r = computeSettlement(s);
  const czk = (n: number) => formatCZK(n, locale, true);
  const amount = formatCZK(Math.abs(r.balance), locale, true);

  // Správce vidí celou větu („Nájemník doplatí …“), nájemník štítek a částku zvlášť
  const ownerSentence = audience === "owner" && r.outcome !== "even" && r.status !== "settled";
  // Vyrovnané vyúčtování už jen informuje, nesvítí jako dluh
  const tone = r.status === "settled" ? "even" : r.outcome;
  const resultLabel = ownerSentence
    ? t(r.outcome === "underpaid" ? "ownerUnderpaid" : "ownerOverpaid", { amount })
    : t(r.outcome);

  const header = (
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <p className="text-sm font-semibold">{t(`utility.${s.utility}`)}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(s.periodFrom, locale)} – {formatDate(s.periodTo, locale)}
        </p>
      </div>
      <span className={cn("text-xs font-medium px-2 py-0.5 rounded border", SETTLEMENT_STATUS_STYLES[r.status])}>
        {r.status === "settled" && s.settledDate
          ? t("settledOn", { date: formatDate(s.settledDate, locale) })
          : t(`status.${r.status}`)}
      </span>
    </div>
  );

  const result = (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-md px-3 py-2",
        tone === "underpaid" ? "bg-danger-soft" : tone === "overpaid" ? "bg-success-soft" : "bg-muted"
      )}
    >
      <span className="text-sm font-medium">{resultLabel}</span>
      {!ownerSentence && r.outcome !== "even" && (
        <span
          className={cn(
            "text-base font-bold tabular-nums",
            tone === "underpaid" ? "text-danger" : tone === "overpaid" ? "text-success" : ""
          )}
        >
          {amount}
        </span>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-2">
        {header}
        {result}
      </div>
    );
  }

  const rows: [string, string][] = [
    [t("meter"), `${formatNumber(s.meterStart, locale)} → ${formatNumber(s.meterEnd, locale)} m³`],
    [t("consumption"), `${formatNumber(r.consumption, locale)} m³`],
    [t("unitPrice"), czk(r.unitPrice)],
    [t("cost"), czk(r.cost)],
    [t("advancesPaid", { months: s.months, advance: formatCZK(s.monthlyAdvance, locale) }), `− ${czk(r.advancesPaid)}`],
  ];

  return (
    <div className="space-y-3">
      {header}
      <dl className="divide-y divide-border text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3 py-1.5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="tabular-nums text-right">{value}</dd>
          </div>
        ))}
      </dl>
      {result}
      <p className="text-xs text-muted-foreground">
        {t("method", { totalCost: czk(s.totalCost), totalConsumption: formatNumber(s.totalConsumption, locale) })}{" "}
        {s.supplier}, {t("invoice", { number: s.invoiceNumber })}.
      </p>
      {s.newMonthlyAdvance && s.newAdvanceFrom && (
        <p className="text-sm">
          {t("newAdvance", {
            date: formatDate(s.newAdvanceFrom, locale),
            amount: formatCZK(s.newMonthlyAdvance, locale),
          })}
        </p>
      )}
    </div>
  );
}
