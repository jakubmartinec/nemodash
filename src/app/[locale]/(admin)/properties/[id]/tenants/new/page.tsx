import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createTenant } from "@/lib/data/actions";
import { getDataset } from "@/lib/data/store";
import { propertyById } from "@/lib/data/selectors";
import TenantForm from "@/components/properties/TenantForm";
import { PageHeader } from "@/components/forms/FormKit";

export default async function NewTenantPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const property = propertyById(await getDataset(), id);
  if (!property) notFound();
  const t = await getTranslations({ locale, namespace: "forms.tenant" });

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={property.name} />
      <TenantForm
        action={createTenant.bind(null, locale, id)}
        cancelHref={`/${locale}/properties/${id}?tab=tenants`}
      />
    </div>
  );
}
