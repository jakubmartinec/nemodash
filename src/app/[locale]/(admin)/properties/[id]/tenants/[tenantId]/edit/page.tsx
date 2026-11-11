import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { updateTenant } from "@/lib/data/actions";
import { getAdminDataset } from "@/lib/auth/session";
import { propertyById, tenantById } from "@/lib/data/selectors";
import TenantForm from "@/components/properties/TenantForm";
import { PageHeader } from "@/components/forms/FormKit";

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; tenantId: string }>;
}) {
  const { locale, id, tenantId } = await params;
  const ds = await getAdminDataset(locale);
  const property = propertyById(ds, id);
  const tenant = tenantById(ds, tenantId);
  if (!property || tenant?.propertyId !== id) notFound();
  const t = await getTranslations({ locale, namespace: "forms.tenant" });

  return (
    <div className="space-y-6">
      <PageHeader title={t("editTitle", { name: tenant.name })} subtitle={property.name} />
      <TenantForm
        action={updateTenant.bind(null, locale, id, tenantId)}
        cancelHref={`/${locale}/properties/${id}?tab=tenants`}
        initial={tenant}
        defaultLeaseArea={property.type === "land" ? property.area : undefined}
      />
    </div>
  );
}
