import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getDataset } from "@/lib/data/store";
import {
  propertyById,
  tenantsByProperty,
  paymentsByProperty,
  inspectionsByProperty,
  insurancesByProperty,
  contractsByProperty,
  documentsByProperty,
  settlementsByProperty,
} from "@/lib/data/selectors";
import PropertyDetail from "@/components/properties/PropertyDetail";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const tCommon = await getTranslations("common");

  const ds = await getDataset();
  const property = propertyById(ds, id);
  if (!property) notFound();

  const tenants = tenantsByProperty(ds, id);
  const payments = paymentsByProperty(ds, id);
  const inspections = inspectionsByProperty(ds, id);
  const insurances = insurancesByProperty(ds, id);
  const contracts = contractsByProperty(ds, id);
  const documents = documentsByProperty(ds, id);
  const settlements = settlementsByProperty(ds, id);

  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground text-sm">{tCommon("loading")}</div>}>
      <PropertyDetail
        locale={locale}
        property={property}
        tenants={tenants}
        payments={payments}
        inspections={inspections}
        insurances={insurances}
        contracts={contracts}
        documents={documents}
        settlements={settlements}
      />
    </Suspense>
  );
}
