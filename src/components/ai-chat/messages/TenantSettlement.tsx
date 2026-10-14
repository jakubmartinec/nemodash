import { useLocale, useTranslations } from "next-intl";
import type { ChatMessage } from "@/lib/ai-chat/types";
import type { UtilitySettlement } from "@/lib/types";
import { computeSettlement } from "@/lib/settlement";
import { formatCZK, formatNumber } from "@/lib/format";
import { getTenantById } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface TenantSettlementProps {
  message: ChatMessage;
}

export default function TenantSettlement({ message }: TenantSettlementProps) {
  const t = useTranslations("aiChat");
  const tSet = useTranslations("settlement");
  const locale = useLocale();
  const settlements = (message.data?.settlements ?? []) as UtilitySettlement[];
  if (settlements.length === 0) return null;

  return (
    <div className="flex items-start gap-2">
      {/* AI avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-600 mb-2">
          {t("settlementDescription", { count: settlements.length })}
        </p>
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {settlements.map((s) => {
            const r = computeSettlement(s);
            return (
              <div key={s.id} className="px-4 py-3 space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{getTenantById(s.tenantId)?.name}</p>
                  <p
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      r.outcome === "underpaid" ? "text-danger" : r.outcome === "overpaid" ? "text-success" : ""
                    )}
                  >
                    {r.outcome === "underpaid" ? "+" : r.outcome === "overpaid" ? "−" : ""}
                    {formatCZK(Math.abs(r.balance), locale, true)}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  {t("settlementRow", {
                    consumption: formatNumber(r.consumption, locale),
                    cost: formatCZK(r.cost, locale, true),
                    advances: formatCZK(r.advancesPaid, locale),
                  })}
                </p>
                <p className="text-xs text-gray-500">{tSet(r.outcome)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
