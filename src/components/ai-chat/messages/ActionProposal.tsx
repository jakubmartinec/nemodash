"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Save } from "lucide-react";
import { useAIChatContext } from "@/components/ai-chat/AIChatProvider";
import type { ChatMessage, InvoiceData, SettlementData } from "@/lib/ai-chat/types";
import { formatCZK } from "@/lib/ai-chat/engine";

interface ActionProposalData {
  propertyId: string;
  propertyName: string;
  invoice: InvoiceData;
  settlement: SettlementData;
}

interface ActionProposalProps {
  message: ChatMessage;
}

export default function ActionProposal({ message }: ActionProposalProps) {
  const t = useTranslations("aiChat");
  const { saved, saveAll } = useAIChatContext();
  const [localSaved, setLocalSaved] = useState(false);
  const data = message.data as unknown as ActionProposalData;
  if (!data) return null;

  const { invoice, settlement, propertyName } = data;
  const isSaved = saved || localSaved;

  const actions = [
    {
      label: t("paymentEntry", { type: "vodné a stočné", amount: invoice.toPay }),
      sub: t("paymentEntrySub", { dueDate: invoice.dueDate }),
    },
    {
      label: t("receivableEntry", { name: settlement.tenantName, amount: formatCZK(Math.abs(settlement.difference)) }),
      sub: t("receivableEntrySub", {
        advances: formatCZK(settlement.totalAdvances),
        actual: formatCZK(settlement.actualCost),
      }),
    },
    {
      label: t("documentEntry", { number: invoice.invoiceNumber }),
      sub: t("documentEntrySub", { property: propertyName }),
    },
    {
      label: t("reminderEntry"),
      sub: t("reminderEntrySub", { invoiceDate: invoice.dueDate, tenantDate: "30.04.2026" }),
    },
    {
      label: t("advanceChangeEntry", {
        old: formatCZK(settlement.monthlyAdvance),
        new: formatCZK(settlement.suggestedNewAdvance),
      }),
      sub: t("advanceChangeEntrySub", {
        actual: formatCZK(Math.round(settlement.actualCost / settlement.months)),
      }),
    },
  ];

  function handleSave() {
    setLocalSaved(true);
    saveAll(propertyName);
  }

  return (
    <div className="flex items-start gap-2">
      {/* AI avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">{t("proposalTitle")}</h3>
          </div>
          <ul className="px-4 py-3 space-y-3">
            {actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSaved ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <Check className={`w-3 h-3 ${isSaved ? "text-green-600" : "text-gray-400"}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900">{action.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{action.sub}</p>
                </div>
              </li>
            ))}
          </ul>
          {!isSaved ? (
            <div className="px-4 pb-4">
              <button
                onClick={handleSave}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t("saveAll")}
              </button>
            </div>
          ) : (
            <div className="px-4 pb-4">
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-xs text-green-700 font-medium">
                  {t("saved", { property: propertyName })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
