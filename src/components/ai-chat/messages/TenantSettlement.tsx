import { useTranslations } from "next-intl";
import { TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import type { ChatMessage, SettlementData } from "@/lib/ai-chat/types";
import { formatCZK } from "@/lib/ai-chat/engine";

interface TenantSettlementProps {
  message: ChatMessage;
}

export default function TenantSettlement({ message }: TenantSettlementProps) {
  const t = useTranslations("aiChat");
  const data = message.data as unknown as {
    settlement: SettlementData;
    invoiceAddress: string;
  };
  if (!data) return null;

  const { settlement } = data;
  const monthlyActual = Math.round(settlement.actualCost / settlement.months);

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
          {t("settlementDescription", {
            name: settlement.tenantName,
            amount: formatCZK(settlement.monthlyAdvance),
            months: settlement.months,
          })}
        </p>

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">{t("settlementTitle")}</h3>
          </div>

          <div className="px-4 py-3 space-y-2">
            <SettlRow label={t("monthlyAdvance")} value={formatCZK(settlement.monthlyAdvance)} />
            <SettlRow label={t("monthCount")} value={`${settlement.months} měsíců`} />
            <SettlRow label={t("totalAdvances")} value={formatCZK(settlement.totalAdvances)} />
            <SettlRow label={t("actualCost")} value={formatCZK(settlement.actualCost)} />
          </div>

          {/* Nedoplatek / Přeplatek */}
          <div
            className={`mx-4 mb-3 rounded-lg p-3 flex items-center justify-between ${
              settlement.isUnderpaid ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {settlement.isUnderpaid ? (
                <TrendingUp className="w-4 h-4 text-red-500 shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-600 shrink-0" />
              )}
              <span className={`text-sm font-medium ${settlement.isUnderpaid ? "text-red-700" : "text-green-700"}`}>
                {settlement.isUnderpaid ? t("underpayment") : t("overpayment")}
              </span>
            </div>
            <span className={`text-sm font-bold ${settlement.isUnderpaid ? "text-red-600" : "text-green-600"}`}>
              {settlement.isUnderpaid ? "+" : "-"}
              {formatCZK(Math.abs(settlement.difference))}
            </span>
          </div>

          {/* Tip */}
          <div className="mx-4 mb-4 rounded-lg p-3 bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-1.5 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-xs font-semibold text-amber-800">{t("tip")}</span>
            </div>
            <p className="text-xs text-amber-700">
              {t("tipText", {
                monthlyActual: monthlyActual.toLocaleString("cs-CZ"),
                newSupplierAdvance: settlement.newSupplierAdvance.toLocaleString("cs-CZ"),
                oldAdvance: settlement.monthlyAdvance.toLocaleString("cs-CZ"),
                newAdvance: settlement.suggestedNewAdvance.toLocaleString("cs-CZ"),
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettlRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs text-gray-800 font-medium">{value}</span>
    </div>
  );
}
