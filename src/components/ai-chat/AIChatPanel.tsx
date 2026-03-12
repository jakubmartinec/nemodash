"use client";

import { useTranslations } from "next-intl";
import { X, Sparkles } from "lucide-react";
import { useAIChatContext } from "./AIChatProvider";
import AIChatMessages from "./AIChatMessages";
import AIChatInput from "./AIChatInput";
import PropertySelector from "./PropertySelector";

export default function AIChatPanel() {
  const t = useTranslations("aiChat");
  const { isOpen, closeChat, messages, isTyping, selectorOpen } = useAIChatContext();

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[420px] max-h-[600px] max-sm:inset-0 max-sm:w-full max-sm:max-h-full max-sm:bottom-0 max-sm:right-0 rounded-2xl max-sm:rounded-none shadow-2xl border border-gray-200 bg-white flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl max-sm:rounded-none px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">{t("title")}</p>
          <p className="text-xs text-indigo-200 leading-tight">{t("subtitle")}</p>
        </div>
        <button
          onClick={closeChat}
          aria-label="Zavřít"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Obsah — zprávy + input, relativní pozice pro PropertySelector overlay */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <AIChatMessages messages={messages} isTyping={isTyping} />
        <AIChatInput />
        {selectorOpen && <PropertySelector />}
      </div>
    </div>
  );
}
