import { getTranslations } from "next-intl/server";
import { mockInspections, mockProperties } from "@/lib/mock-data";
import InspectionsClient from "@/components/inspections/InspectionsClient";

export default async function InspectionsPage() {
  const t = await getTranslations("inspections");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
      </div>
      <InspectionsClient inspections={mockInspections} properties={mockProperties} />
    </div>
  );
}
