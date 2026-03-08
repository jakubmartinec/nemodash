"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ArrowDownLeft, ArrowUpRight, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Payment, Property, PaymentType, PaymentStatus, PaymentDirection } from "@/lib/types";

interface PaymentsClientProps {
  payments: Payment[];
  properties: Property[];
}

type SortField = "property" | "type" | "amount" | "dueDate" | "paidDate" | "status";
type SortDir = "asc" | "desc";

const STATUS_PILL = {
  paid: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
} as const;

function formatCZK(amount: number) {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function formatPeriodLabel(ym: string): string {
  const [year, month] = ym.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const label = new Intl.DateTimeFormat("cs-CZ", { month: "long", year: "numeric" }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const PAYMENT_TYPES: PaymentType[] = [
  "rent", "lease", "energy_electricity", "energy_gas", "energy_water",
  "waste", "tax", "insurance", "maintenance", "other",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["paid", "pending", "overdue"];
const PAYMENT_DIRECTIONS: PaymentDirection[] = ["incoming", "outgoing"];

export default function PaymentsClient({ payments, properties }: PaymentsClientProps) {
  const t = useTranslations("payments");

  const [propertyFilter, setPropertyFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({
    field: "dueDate",
    dir: "desc",
  });

  const propName = useCallback(
    (id: string) => properties.find((p) => p.id === id)?.name ?? id,
    [properties]
  );

  // Unikátní období z dat
  const periods = useMemo(() => {
    const seen = new Set<string>();
    payments.forEach((p) => seen.add(p.dueDate.slice(0, 7)));
    return [...seen].sort().reverse();
  }, [payments]);

  const filtered = useMemo(() => {
    let result = [...payments];
    if (propertyFilter) result = result.filter((p) => p.propertyId === propertyFilter);
    if (typeFilter) result = result.filter((p) => p.type === typeFilter);
    if (statusFilter) result = result.filter((p) => p.status === statusFilter);
    if (directionFilter) result = result.filter((p) => p.direction === directionFilter);
    if (periodFilter) result = result.filter((p) => p.dueDate.startsWith(periodFilter));
    return result;
  }, [payments, propertyFilter, typeFilter, statusFilter, directionFilter, periodFilter]);

  const sorted = useMemo(() => {
    const { field, dir } = sort;
    return [...filtered].sort((a, b) => {
      let va: string | number;
      let vb: string | number;
      if (field === "property") { va = propName(a.propertyId); vb = propName(b.propertyId); }
      else if (field === "amount") { va = a.amount; vb = b.amount; }
      else if (field === "dueDate") { va = a.dueDate; vb = b.dueDate; }
      else if (field === "paidDate") { va = a.paidDate ?? ""; vb = b.paidDate ?? ""; }
      else if (field === "status") { va = a.status; vb = b.status; }
      else { va = a.type; vb = b.type; }
      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sort, propName]);

  const summary = useMemo(() => {
    const income = filtered
      .filter((p) => p.direction === "incoming")
      .reduce((s, p) => s + p.amount, 0);
    const expenses = filtered
      .filter((p) => p.direction === "outgoing")
      .reduce((s, p) => s + p.amount, 0);
    const unpaid = filtered.filter((p) => p.status === "pending" || p.status === "overdue").length;
    return { income, expenses, unpaid };
  }, [filtered]);

  function toggleSort(field: SortField) {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { field, dir: "desc" }
    );
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sort.field !== field) return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-30" />;
    return sort.dir === "asc"
      ? <ChevronUp className="h-3 w-3 ml-1" />
      : <ChevronDown className="h-3 w-3 ml-1" />;
  }

  const selectCls =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="space-y-5">
      {/* ── Souhrn ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">{t("summaryIncome")}</p>
          <p className="text-lg font-bold text-green-700">{formatCZK(summary.income)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">{t("summaryExpenses")}</p>
          <p className="text-lg font-bold">{formatCZK(summary.expenses)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">{t("fields.status")}</p>
          <p
            className={cn(
              "text-lg font-bold",
              summary.unpaid > 0 ? "text-red-600" : "text-green-700"
            )}
          >
            {t("unpaidCount", { count: summary.unpaid })}
          </p>
        </div>
      </div>

      {/* ── Filtry ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className={selectCls}
          aria-label={t("fields.property")}
        >
          <option value="">{t("filterAllProperties")}</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={selectCls}
          aria-label={t("fields.type")}
        >
          <option value="">{t("filterAllTypes")}</option>
          {PAYMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`type.${type}` as Parameters<typeof t>[0])}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={selectCls}
          aria-label={t("fields.status")}
        >
          <option value="">{t("filterAllStatuses")}</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}` as Parameters<typeof t>[0])}
            </option>
          ))}
        </select>

        <select
          value={directionFilter}
          onChange={(e) => setDirectionFilter(e.target.value)}
          className={selectCls}
          aria-label={t("fields.direction")}
        >
          <option value="">{t("filterAllDirections")}</option>
          {PAYMENT_DIRECTIONS.map((d) => (
            <option key={d} value={d}>
              {t(`direction.${d}` as Parameters<typeof t>[0])}
            </option>
          ))}
        </select>

        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className={selectCls}
          aria-label={t("fields.period")}
        >
          <option value="">{t("filterAllPeriods")}</option>
          {periods.map((ym) => (
            <option key={ym} value={ym}>{formatPeriodLabel(ym)}</option>
          ))}
        </select>
      </div>

      {sorted.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{t("noResults")}</p>
      ) : (
        <>
          {/* ── Tabulka (sm+) ──────────────────────────── */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {(
                    [
                      ["property", t("fields.property")],
                      ["type", t("fields.type")],
                      ["amount", t("fields.amount")],
                      ["dueDate", t("fields.dueDate")],
                      ["paidDate", t("fields.paidDate")],
                      ["status", t("fields.status")],
                    ] as [SortField, string][]
                  ).map(([field, label]) => (
                    <th
                      key={field}
                      className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap hover:text-foreground"
                      onClick={() => toggleSort(field)}
                    >
                      <span className="inline-flex items-center">
                        {label}
                        <SortIcon field={field} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 max-w-[160px]">
                      <span className="truncate block text-sm font-medium">
                        {propName(payment.propertyId)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {t(`type.${payment.type}` as Parameters<typeof t>[0])}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 justify-end">
                        {payment.direction === "incoming" ? (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span
                          className={
                            payment.direction === "incoming" ? "text-green-700" : ""
                          }
                        >
                          {formatCZK(payment.amount)}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(payment.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {payment.paidDate ? formatDate(payment.paidDate) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded border",
                          STATUS_PILL[payment.status]
                        )}
                      >
                        {t(`status.${payment.status}` as Parameters<typeof t>[0])}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Card view (mobil) ──────────────────────── */}
          <div className="sm:hidden space-y-2">
            {sorted.map((payment) => (
              <div
                key={payment.id}
                className="rounded-lg border border-border bg-card p-4 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{propName(payment.propertyId)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(`type.${payment.type}` as Parameters<typeof t>[0])}
                    {" · "}
                    {formatDate(payment.dueDate)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={cn(
                      "font-bold text-sm tabular-nums",
                      payment.direction === "incoming" ? "text-green-700" : ""
                    )}
                  >
                    {payment.direction === "incoming" ? (
                      <ArrowDownLeft className="inline h-3.5 w-3.5 mr-0.5" />
                    ) : (
                      <ArrowUpRight className="inline h-3.5 w-3.5 mr-0.5" />
                    )}
                    {formatCZK(payment.amount)}
                  </p>
                  <span
                    className={cn(
                      "mt-1 inline-block text-xs font-medium px-1.5 py-0.5 rounded border",
                      STATUS_PILL[payment.status]
                    )}
                  >
                    {t(`status.${payment.status}` as Parameters<typeof t>[0])}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Počet výsledků */}
      <p className="text-xs text-muted-foreground text-right">
        {sorted.length} / {payments.length}
      </p>
    </div>
  );
}
