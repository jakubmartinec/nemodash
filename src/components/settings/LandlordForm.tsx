"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { FormState } from "@/lib/data/actions";
import type { Landlord } from "@/lib/types";
import { Field, FormError, FormSection, inputClass, SubmitBar } from "@/components/forms/FormKit";

export default function LandlordForm({
  action,
  landlord,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  landlord: Landlord;
}) {
  const t = useTranslations("forms.landlord");
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-3xl">
      <FormSection title={t("title")}>
        <p className="sm:col-span-2 text-sm text-muted-foreground -mt-1">{t("hint")}</p>
        <Field label={t("name")}>
          <input name="name" required defaultValue={landlord.name} className={inputClass} />
        </Field>
        <Field label={t("email")}>
          <input name="email" type="email" required defaultValue={landlord.email} className={inputClass} />
        </Field>
        <Field label={t("phone")}>
          <input name="phone" type="tel" defaultValue={landlord.phone} className={inputClass} />
        </Field>
        <Field label={t("bankAccount")} hint={t("bankAccountHint")}>
          <input name="bankAccount" required defaultValue={landlord.bankAccount} className={inputClass} />
        </Field>
      </FormSection>
      <FormError error={state?.error} />
      {state?.saved && <p role="status" className="text-sm text-success">{t("saved")}</p>}
      <SubmitBar pending={pending} />
    </form>
  );
}
