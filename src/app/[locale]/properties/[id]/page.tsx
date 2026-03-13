import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import {
  getPropertyById,
  getTenantsByProperty,
  getPaymentsByProperty,
  getInspectionsByProperty,
  getInsurancesByProperty,
  getContractsByProperty,
  getDocumentsByProperty,
} from "@/lib/mock-data";
import PropertyDetail from "@/components/properties/PropertyDetail";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const tCommon = await getTranslations("common");

  const property = getPropertyById(id);
  if (!property) notFound();

  const tenants = getTenantsByProperty(id);
  const payments = getPaymentsByProperty(id);
  const inspections = getInspectionsByProperty(id);
  const insurances = getInsurancesByProperty(id);
  const contracts = getContractsByProperty(id);
  const documents = getDocumentsByProperty(id);

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
      />
    </Suspense>
  );
}
