import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/config";
import AppShell from "@/components/layout/AppShell";
import AIChatProvider from "@/components/ai-chat/AIChatProvider";
import AIChatFAB from "@/components/ai-chat/AIChatFAB";
import AIChatPanel from "@/components/ai-chat/AIChatPanel";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "cs" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <AIChatProvider>
            <AppShell locale={locale}>
              {children}
            </AppShell>
            <AIChatFAB />
            <AIChatPanel />
          </AIChatProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
