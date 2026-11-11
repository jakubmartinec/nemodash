"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignOutButton({ locale, withLabel = false }: { locale: string; withLabel?: boolean }) {
  const t = useTranslations("auth");
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await fetch("/api/session", { method: "DELETE" });
    window.location.assign(`/${locale}/login`);
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      aria-label={t("signOut")}
      title={t("signOut")}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md p-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
        withLabel && "px-2.5"
      )}
    >
      <LogOut className="h-4 w-4" />
      {withLabel && <span>{t("signOut")}</span>}
    </button>
  );
}
