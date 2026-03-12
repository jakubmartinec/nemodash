"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { useAIChatContext } from "./AIChatProvider";

export default function AIChatFAB() {
  const t = useTranslations("aiChat");
  const { openChat } = useAIChatContext();

  return (
    <button
      onClick={openChat}
      aria-label={t("title")}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
    >
      <Sparkles className="w-6 h-6" />
    </button>
  );
}
