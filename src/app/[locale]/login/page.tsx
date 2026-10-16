import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Building2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { isLiveData } from "@/lib/data/store";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Demo běží bez přihlášení
  if (!isLiveData()) redirect(`/${locale}/dashboard`);

  const session = await getSession();
  if (session) redirect(`/${locale}/${session.role === "admin" ? "dashboard" : "portal"}`);

  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <main className="min-h-screen bg-muted/40 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-10 w-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <LoginForm locale={locale} />
        </div>
      </div>
    </main>
  );
}
