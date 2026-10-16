import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createSettlement } from "@/lib/data/actions";
import { getDataset } from "@/lib/data/store";
import { propertyById, settlementsByProperty, tenantsByProperty } from "@/lib/data/selectors";
import { getToday } from "@/lib/constants";
import type { UtilityKind } from "@/lib/types";
import SettlementForm, { type SettlementTenantOption } from "@/components/settlements/SettlementForm";
import { PageHeader } from "@/components/forms/FormKit";

const iso = (d: Date) => d.toISOString().slice(0, 10);

export default async function NewSettlementPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const ds = await getDataset();
  const property = propertyById(ds, id);
  if (!property) notFound();
  const t = await getTranslations({ locale, namespace: "forms.settlement" });

  const previous = settlementsByProperty(ds, id); // nejnovější první

  // Předvyplnění: záloha z karty nájemníka, počáteční stav = konečný stav z minula
  const tenants: SettlementTenantOption[] = tenantsByProperty(ds, id).map((tenant) => {
    const lastMeterEnd: Partial<Record<UtilityKind, number>> = {};
    for (const s of previous) {
      if (s.tenantId === tenant.id && lastMeterEnd[s.utility] === undefined) lastMeterEnd[s.utility] = s.meterEnd;
    }
    return { id: tenant.id, name: tenant.name, advances: tenant.advances ?? {}, lastMeterEnd };
  });

  const today = getToday();
  const year = today.getUTCFullYear();
  const issuedThisYear = ds.settlements.filter((s) => s.issuedDate.startsWith(String(year))).length;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={property.name} />
      <SettlementForm
        action={createSettlement.bind(null, locale, id)}
        cancelHref={`/${locale}/properties/${id}?tab=tenants`}
        tenants={tenants}
        defaults={{
          issuedDate: iso(today),
          dueDate: iso(new Date(today.getTime() + 30 * 86_400_000)),
          variableSymbol: `${year}${String(issuedThisYear + 1).padStart(3, "0")}`,
          supplier: previous[0]?.supplier ?? "",
        }}
      />
    </div>
  );
}
