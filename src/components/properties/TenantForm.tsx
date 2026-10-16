"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { FormState } from "@/lib/data/actions";
import { Field, FormError, FormSection, inputClass, SubmitBar } from "@/components/forms/FormKit";

export default function TenantForm({
  action,
  cancelHref,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  cancelHref: string;
}) {
  const t = useTranslations("forms.tenant");
  const tTen = useTranslations("tenants");
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-3xl">
      <FormSection title={t("person")}>
        <Field label={tTen("fields.name")}>
          <input name="name" required autoComplete="off" className={inputClass} />
        </Field>
        <Field label={tTen("fields.type")}>
          <select name="type" defaultValue="tenant" className={inputClass}>
            <option value="tenant">{tTen("type.tenant")}</option>
            <option value="lessee">{tTen("type.lessee")}</option>
          </select>
        </Field>
        <Field label={tTen("fields.phone")} hint={t("phoneHint")}>
          <input name="phone" type="tel" inputMode="tel" placeholder="+420 777 123 456" className={inputClass} />
        </Field>
        <Field label={tTen("fields.email")} hint={t("emailHint")}>
          <input name="email" type="email" className={inputClass} />
        </Field>
      </FormSection>

      <FormSection title={t("contract")}>
        <Field label={tTen("fields.contractStart")}>
          <input name="contractStart" type="date" required className={inputClass} />
        </Field>
        <Field label={tTen("fields.contractEnd")} hint={t("contractEndHint")}>
          <input name="contractEnd" type="date" className={inputClass} />
        </Field>
        <Field label={t("monthlyRent")}>
          <input name="monthlyRent" inputMode="decimal" required className={inputClass} />
        </Field>
        <Field label={t("deposit")}>
          <input name="deposit" inputMode="decimal" className={inputClass} />
        </Field>
      </FormSection>

      <FormSection title={t("advances")}>
        <Field label={t("advanceWater")}>
          <input name="advanceWater" inputMode="decimal" className={inputClass} />
        </Field>
        <Field label={t("advanceGas")}>
          <input name="advanceGas" inputMode="decimal" className={inputClass} />
        </Field>
        <Field label={t("advanceElectricity")}>
          <input name="advanceElectricity" inputMode="decimal" className={inputClass} />
        </Field>
      </FormSection>

      <FormSection title={tTen("fields.notes")}>
        <Field label={tTen("fields.notes")} className="sm:col-span-2">
          <textarea name="notes" rows={2} className={inputClass} />
        </Field>
      </FormSection>

      <FormError error={state?.error} />
      <SubmitBar pending={pending} cancelHref={cancelHref} />
    </form>
  );
}
