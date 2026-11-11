import { getTranslations } from "next-intl/server";
import { getAdminDataset } from "@/lib/auth/session";
import InspectionsClient from "@/components/inspections/InspectionsClient";

export default async function InspectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("inspections");
  const { inspections, properties } = await getAdminDataset(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
      </div>
      <InspectionsClient inspections={inspections} properties={properties} />
    </div>
  );
}
