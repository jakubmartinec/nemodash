"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { FormState } from "@/lib/data/actions";
import { Field, FormError, FormSection, inputClass, SubmitBar } from "@/components/forms/FormKit";

export default function PropertyForm({
  action,
  cancelHref,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  cancelHref: string;
}) {
  const t = useTranslations("forms.property");
  const tProp = useTranslations("properties");
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-3xl">
      <FormSection title={t("basics")}>
        <Field label={t("type")}>
          <select name="type" defaultValue="house" className={inputClass}>
            <option value="house">{tProp("type.house")}</option>
            <option value="land">{tProp("type.land")}</option>
          </select>
        </Field>
        <Field label={t("ownership")}>
          <select name="ownership" defaultValue="owned" className={inputClass}>
            <option value="owned">{tProp("ownership.owned")}</option>
            <option value="rented">{tProp("ownership.rented")}</option>
          </select>
        </Field>
        <Field label={t("name")} hint={t("nameHint")} className="sm:col-span-2">
          <input name="name" required className={inputClass} />
        </Field>
        <Field label={t("address")} className="sm:col-span-2">
          <input name="address" autoComplete="street-address" className={inputClass} />
        </Field>
      </FormSection>

      <FormSection title={t("cadastre")}>
        <Field label={t("cadastralNumber")}>
          <input name="cadastralNumber" className={inputClass} />
        </Field>
        <Field label={t("parcelNumbers")} hint={t("parcelNumbersHint")}>
          <input name="parcelNumbers" className={inputClass} />
        </Field>
        <Field label={t("area")}>
          <input name="area" inputMode="decimal" className={inputClass} />
        </Field>
      </FormSection>

      <FormSection title={t("other")}>
        <Field label={t("description")} className="sm:col-span-2">
          <textarea name="description" rows={2} className={inputClass} />
        </Field>
        <Field label={t("notes")} className="sm:col-span-2">
          <textarea name="notes" rows={2} className={inputClass} />
        </Field>
      </FormSection>

      <FormError error={state?.error} />
      <SubmitBar pending={pending} cancelHref={cancelHref} />
    </form>
  );
}
