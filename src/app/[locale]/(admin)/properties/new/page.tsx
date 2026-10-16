import { getTranslations } from "next-intl/server";
import { createProperty } from "@/lib/data/actions";
import PropertyForm from "@/components/properties/PropertyForm";
import { PageHeader } from "@/components/forms/FormKit";

export default async function NewPropertyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "forms.property" });

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />
      <PropertyForm action={createProperty.bind(null, locale)} cancelHref={`/${locale}/properties`} />
    </div>
  );
}
