"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Check, ExternalLink, Save } from "lucide-react";
import { useAIChatContext } from "@/components/ai-chat/AIChatProvider";
import type { ChatMessage, InvoiceData } from "@/lib/ai-chat/types";
import type { UtilitySettlement } from "@/lib/types";
import { computeSettlement } from "@/lib/settlement";
import { formatCZK, formatDate } from "@/lib/format";
import { getTenantById } from "@/lib/mock-data";

interface ActionProposalData {
  propertyId: string;
  propertyName: string;
  invoice: InvoiceData;
  settlements: UtilitySettlement[];
}

interface ActionProposalProps {
  message: ChatMessage;
}

export default function ActionProposal({ message }: ActionProposalProps) {
  const t = useTranslations("aiChat");
  const locale = useLocale();
  const { saved: isSaved, saveAll } = useAIChatContext();
  const data = message.data as unknown as ActionProposalData;
  if (!data) return null;

  const { invoice, settlements, propertyName } = data;
  const tenants = settlements.map((s) => ({ s, r: computeSettlement(s), tenant: getTenantById(s.tenantId) }));

  const actions = [
    {
      label: t("paymentEntry", { type: "vodné a stočné", amount: invoice.toPay }),
      sub: t("paymentEntrySub", { dueDate: invoice.dueDate }),
    },
    ...tenants
      .filter(({ r }) => r.outcome !== "even")
      .map(({ s, r, tenant }) => ({
        label: t(r.outcome === "underpaid" ? "receivableEntry" : "refundEntry", {
          name: tenant?.name ?? "",
          amount: formatCZK(Math.abs(r.balance), locale, true),
        }),
        sub: t("receivableEntrySub", {
          advances: formatCZK(r.advancesPaid, locale),
          actual: formatCZK(r.cost, locale, true),
          dueDate: formatDate(s.dueDate, locale),
        }),
      })),
    {
      label: t("documentEntry", { number: invoice.invoiceNumber }),
      sub: t("documentEntrySub", { property: propertyName }),
    },
    {
      label: t("portalEntry"),
      sub: t("portalEntrySub"),
    },
  ];

  function handleSave() {
    saveAll();
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
              {/* Odkazy na pohled nájemníka */}
              <div className="mt-2 flex flex-wrap gap-2">
                {tenants
                  .filter(({ tenant }) => tenant?.portalToken)
                  .map(({ tenant }) => (
                    <Link
                      key={tenant!.id}
                      href={`/${locale}/portal/${tenant!.portalToken}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {t("openPortal", { name: tenant!.name })}
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
