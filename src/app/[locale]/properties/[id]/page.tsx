import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getPropertyById,
  getTenantsByProperty,
  getPaymentsByProperty,
  getInspectionsByProperty,
  getInsurancesByProperty,
  getContractsByProperty,
} from "@/lib/mock-data";
import PropertyDetail from "@/components/properties/PropertyDetail";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const property = getPropertyById(id);
  if (!property) notFound();

  const tenants = getTenantsByProperty(id);
  const payments = getPaymentsByProperty(id);
  const inspections = getInspectionsByProperty(id);
  const insurances = getInsurancesByProperty(id);
  const contracts = getContractsByProperty(id);

  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground text-sm">Načítání…</div>}>
      <PropertyDetail
        locale={locale}
        property={property}
        tenants={tenants}
        payments={payments}
        inspections={inspections}
        insurances={insurances}
        contracts={contracts}
      />
    </Suspense>
  );
}
