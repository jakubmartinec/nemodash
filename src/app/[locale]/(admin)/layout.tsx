import AppShell from "@/components/layout/AppShell";
import AIChatProvider from "@/components/ai-chat/AIChatProvider";
import AIChatFAB from "@/components/ai-chat/AIChatFAB";
import AIChatPanel from "@/components/ai-chat/AIChatPanel";
import { requireAdmin } from "@/lib/auth/session";
import { getDataset, isLiveData } from "@/lib/data/store";
import { notificationCount } from "@/lib/data/selectors";

// Rozložení správce: sidebar, horní lišta a AI asistent
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);

  const live = isLiveData();
  const ds = await getDataset();
  const propertyNames = Object.fromEntries(ds.properties.map((p) => [p.id, p.name]));

  const shell = (
    <AppShell
      locale={locale}
      notificationCount={notificationCount(ds)}
      propertyNames={propertyNames}
      canSignOut={live}
    >
      {children}
    </AppShell>
  );

  // AI asistent je zatím prototyp nad demo daty — s ostrými daty se nezobrazuje
  if (live) return shell;

  return (
    <AIChatProvider>
      {shell}
      <AIChatFAB />
      <AIChatPanel />
    </AIChatProvider>
  );
}
