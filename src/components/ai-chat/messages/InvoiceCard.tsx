import { useTranslations } from "next-intl";
import { Receipt } from "lucide-react";
import type { ChatMessage, InvoiceData } from "@/lib/ai-chat/types";

interface InvoiceCardProps {
  message: ChatMessage;
}

export default function InvoiceCard({ message }: InvoiceCardProps) {
  const t = useTranslations("aiChat");
  const invoice = message.data as unknown as InvoiceData;
  if (!invoice) return null;

  return (
    <div className="flex items-start gap-2">
      {/* AI avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-600 mb-2">{t("foundData")}</p>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {/* Záhlaví karty */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-sm font-semibold text-gray-900">{t("invoiceTitle")}</span>
          </div>
          {/* Položky faktury */}
          <div className="px-4 py-3 space-y-2">
            <Row label={t("provider")} value={invoice.provider} />
            <Row label={t("invoiceNumber")} value={invoice.invoiceNumber} mono />
            <Row label={t("period")} value={invoice.period} />
            {invoice.items.map((item) => (
              <Row key={item.name} label={item.name} value={`${item.amount} — ${item.price}`} />
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2 space-y-1.5">
              <Row label={t("totalWithVat")} value={invoice.totalWithVat} />
              <Row label={t("includedDeposits")} value={invoice.deposits} muted />
              <Row label={t("toPay")} value={invoice.toPay} bold />
              <Row label={t("dueDate")} value={invoice.dueDate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold = false,
  muted = false,
  mono = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span
        className={`text-xs text-right ${bold ? "font-bold text-gray-900" : muted ? "text-gray-400" : "text-gray-700"} ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
