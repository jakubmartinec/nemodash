import AppShell from "@/components/layout/AppShell";
import AIChatProvider from "@/components/ai-chat/AIChatProvider";
import AIChatFAB from "@/components/ai-chat/AIChatFAB";
import AIChatPanel from "@/components/ai-chat/AIChatPanel";

// Rozložení správce: sidebar, horní lišta a AI asistent
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <AIChatProvider>
      <AppShell locale={locale}>{children}</AppShell>
      <AIChatFAB />
      <AIChatPanel />
    </AIChatProvider>
  );
}
