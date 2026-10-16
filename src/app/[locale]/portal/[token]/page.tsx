import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isLiveData } from "@/lib/data/store";
import { mockTenants } from "@/lib/mock-data";
import TenantPortalView from "@/components/portal/TenantPortalView";

// Osobní odkaz nesmí skončit ve vyhledávačích
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Tajný odkaz funguje jen v demu — s ostrými daty se nájemník přihlašuje
export default async function TenantPortalTokenPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  if (isLiveData()) redirect(`/${locale}/portal`);

  const tenant = mockTenants.find((t) => t.portalToken === token);
  return <TenantPortalView locale={locale} tenantId={tenant?.id} />;
}
