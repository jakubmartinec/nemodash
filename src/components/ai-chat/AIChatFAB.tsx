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
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-pop hover:bg-primary/90 transition-colors flex items-center justify-center"
    >
      <Sparkles className="w-6 h-6" />
    </button>
  );
}
