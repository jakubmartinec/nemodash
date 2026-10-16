import { getTranslations } from "next-intl/server";
import { saveLandlord } from "@/lib/data/actions";
import { getDataset } from "@/lib/data/store";
import LandlordForm from "@/components/settings/LandlordForm";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "settings" });
  const { landlord } = await getDataset();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
      </div>
      <LandlordForm action={saveLandlord.bind(null, locale)} landlord={landlord} />
    </div>
  );
}
