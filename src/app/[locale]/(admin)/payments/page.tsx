import { getTranslations } from "next-intl/server";
import { mockPayments, mockProperties } from "@/lib/mock-data";
import PaymentsClient from "@/components/payments/PaymentsClient";

export default async function PaymentsPage() {
  const t = await getTranslations("payments");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
      </div>
      <PaymentsClient payments={mockPayments} properties={mockProperties} />
    </div>
  );
}
