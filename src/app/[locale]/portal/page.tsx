import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isLiveData } from "@/lib/data/store";
import { mockTenants } from "@/lib/mock-data";
import TenantPortalView from "@/components/portal/TenantPortalView";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Portál přihlášeného nájemníka. Správce si může zobrazit pohled nájemníka přes ?tenant=<id>.
export default async function TenantPortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tenant?: string }>;
}) {
  const { locale } = await params;

  if (!isLiveData()) {
    const demo = mockTenants.find((t) => t.portalToken);
    redirect(`/${locale}/portal/${demo?.portalToken ?? ""}`);
  }

  const session = await getSession();
  if (!session) redirect(`/${locale}/login`);

  const tenantId = session.role === "tenant" ? session.tenantId : (await searchParams).tenant;
  if (!tenantId) redirect(`/${locale}/dashboard`);

  return <TenantPortalView locale={locale} tenantId={tenantId} canSignOut={session.role === "tenant"} />;
}
