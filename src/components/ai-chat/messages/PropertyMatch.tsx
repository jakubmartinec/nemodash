"use client";

import { useTranslations } from "next-intl";
import { Building2, Check, ChevronRight } from "lucide-react";
import { useAIChatContext } from "@/components/ai-chat/AIChatProvider";
import type { ChatMessage } from "@/lib/ai-chat/types";
import { getPropertyById } from "@/lib/mock-data";

interface PropertyMatchData {
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
}

interface PropertyMatchProps {
  message: ChatMessage;
}

export default function PropertyMatch({ message }: PropertyMatchProps) {
  const t = useTranslations("aiChat");
  const { matchConfirmed, confirmMatch, openSelector } = useAIChatContext();
  const data = message.data as unknown as PropertyMatchData;
  if (!data) return null;

  const property = getPropertyById(data.propertyId);

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
          {t("matchTitle", { address: data.propertyAddress })}
        </p>
        <div
          className={`rounded-xl border p-3 transition-colors ${
            matchConfirmed
              ? "bg-green-50 border-green-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {property?.name ?? data.propertyName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {property?.address ?? data.propertyAddress}
              </p>
            </div>
            {matchConfirmed && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-700 shrink-0">
                <Check className="w-3.5 h-3.5" />
                {t("confirmed")}
              </span>
            )}
          </div>

          {!matchConfirmed && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => confirmMatch(data.propertyId)}
                className="flex-1 bg-indigo-600 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                {t("confirm")}
              </button>
              <button
                onClick={openSelector}
                className="flex-1 border border-gray-300 text-gray-700 text-xs font-medium py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                {t("otherProperty")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
