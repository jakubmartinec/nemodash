import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { getDataset } from "@/lib/data/store";
import {
  paymentsByProperty,
  inspectionsByProperty,
  insurancesByProperty,
  tenantsByProperty,
} from "@/lib/data/selectors";
import PropertiesList from "@/components/properties/PropertiesList";
import type { PropertyCardData } from "@/components/properties/PropertyCard";
import { getToday } from "@/lib/constants";

const INSURANCE_WARNING_DAYS = 90;

export default async function PropertiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "properties" });
  const ds = await getDataset();
  const TODAY = getToday();

  const items: PropertyCardData[] = ds.properties.map((property) => {
    const payments = paymentsByProperty(ds, property.id);
    const inspections = inspectionsByProperty(ds, property.id);
    const insurances = insurancesByProperty(ds, property.id);
    const tenants = tenantsByProperty(ds, property.id);

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <Link
          href={`/${locale}/properties/new`}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("addProperty")}
        </Link>
      </div>

      <PropertiesList locale={locale} items={items} />
    </div>
  );
}
