import { getTranslations } from "next-intl/server";
import { getDataset } from "@/lib/data/store";
import PaymentsClient from "@/components/payments/PaymentsClient";

export default async function PaymentsPage() {
  const t = await getTranslations("payments");
  const { payments, properties } = await getDataset();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
      </div>
      <PaymentsClient payments={payments} properties={properties} />
    </div>
  );
}
