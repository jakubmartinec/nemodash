import { getTranslations } from "next-intl/server";
import {
  mockProperties,
  getPaymentsByProperty,
  getInspectionsByProperty,
  getInsurancesByProperty,
  getTenantsByProperty,
} from "@/lib/mock-data";
import PropertiesList from "@/components/properties/PropertiesList";
import type { PropertyCardData } from "@/components/properties/PropertyCard";

const TODAY = new Date("2026-03-08");
const INSURANCE_WARNING_DAYS = 90;

export default async function PropertiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "properties" });

  const items: PropertyCardData[] = mockProperties.map((property) => {
    const payments = getPaymentsByProperty(property.id);
    const inspections = getInspectionsByProperty(property.id);
    const insurances = getInsurancesByProperty(property.id);
    const tenants = getTenantsByProperty(property.id);

    // Platby
    let paymentStatus: PropertyCardData["paymentStatus"] = "ok";
    if (payments.some((p) => p.status === "overdue")) paymentStatus = "danger";
    else if (payments.some((p) => p.status === "pending")) paymentStatus = "warning";

    // Revize
    let inspectionStatus: PropertyCardData["inspectionStatus"] = "none";
    if (inspections.length > 0) {
      if (inspections.some((i) => i.status === "expired")) inspectionStatus = "danger";
      else if (inspections.some((i) => i.status === "expiring_soon")) inspectionStatus = "warning";
      else inspectionStatus = "ok";
    }

    // Pojištění
    let insuranceStatus: PropertyCardData["insuranceStatus"] = "none";
    if (insurances.length > 0) {
      const threshold = new Date(
        TODAY.getTime() + INSURANCE_WARNING_DAYS * 24 * 60 * 60 * 1000
      );
      if (insurances.some((i) => new Date(i.endDate) < TODAY)) {
        insuranceStatus = "danger";
      } else if (insurances.some((i) => new Date(i.endDate) <= threshold)) {
        insuranceStatus = "warning";
      } else {
        insuranceStatus = "ok";
      }
    }

    const tenantCount = tenants.filter((t) => t.type === "tenant").length;
    const lesseeCount = tenants.filter((t) => t.type === "lessee").length;

    return { property, tenantCount, lesseeCount, paymentStatus, inspectionStatus, insuranceStatus };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <PropertiesList locale={locale} items={items} />
    </div>
  );
}
