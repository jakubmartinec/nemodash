"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Payment, PaymentStatus } from "@/lib/types";
import { formatCZK, formatDate } from "@/lib/format";

interface PaymentsTabProps {
  payments: Payment[];
}

const STATUS_PILL = {
  paid: "bg-success-soft text-success border-success/30",
  pending: "bg-warning-soft text-warning border-warning/30",
  overdue: "bg-danger-soft text-danger border-danger/30",
} as const;

type Filter = "all" | PaymentStatus;

export default function PaymentsTab({ payments }: PaymentsTabProps) {
  const t = useTranslations("properties");
  const tPay = useTranslations("payments");

  const [filter, setFilter] = useState<Filter>("all");

  const sorted = useMemo(
    () => [...payments].sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    [payments]
  );

  const filtered = useMemo(
    () => (filter === "all" ? sorted : sorted.filter((p) => p.status === filter)),
    [sorted, filter]
  );

  const totalAmount = filtered.reduce(
    (sum, p) => (p.direction === "incoming" ? sum + p.amount : sum - p.amount),
    0
  );

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t("paymentFilterAll") },
    { key: "paid", label: tPay("status.paid") },
    { key: "pending", label: tPay("status.pending") },
    { key: "overdue", label: tPay("status.overdue") },
  ];

  if (payments.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t("noPayments")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filtry */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium border transition-colors",
              filter === key
                ? "bg-brand-soft text-brand-text border-brand/40"
                : "bg-background text-muted-foreground border-border hover:border-foreground/30"
            )}
          >
            {label}
            {key !== "all" && (
              <span className="ml-1.5 opacity-60">
                ({payments.filter((p) => p.status === key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tabulka — scroll na mobilu */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                {tPay("fields.type")}
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                {tPay("fields.amount")}
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                {tPay("fields.dueDate")}
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                {tPay("fields.status")}
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">
                {tPay("fields.period")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((payment) => (
              <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {payment.direction === "incoming" ? (
                      <ArrowDownLeft className="h-3.5 w-3.5 text-success shrink-0" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5 text-danger shrink-0" />
                    )}
                    <span className="truncate max-w-[130px]">
                      {tPay(`type.${payment.type}` as Parameters<typeof tPay>[0])}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap">
                  <span
                    className={
                      payment.direction === "incoming" ? "text-success" : "text-foreground"
                    }
                  >
                    {payment.direction === "incoming" ? "+" : "−"}
                    {formatCZK(payment.amount)}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(payment.dueDate)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded border",
                      STATUS_PILL[payment.status]
                    )}
                  >
                    {tPay(`status.${payment.status}` as Parameters<typeof tPay>[0])}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                  {payment.period ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Celková částka filtrovaných */}
      <div className="flex justify-end text-sm">
        <span className="text-muted-foreground mr-2">{t("total")}:</span>
        <span
          className={cn(
            "font-bold tabular-nums",
            totalAmount >= 0 ? "text-success" : "text-danger"
          )}
        >
          {totalAmount >= 0 ? "+" : ""}
          {formatCZK(totalAmount)}
        </span>
      </div>
    </div>
  );
}
