"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { FormState } from "@/lib/data/actions";
import type { Tenant } from "@/lib/types";
import { annualLeaseRent, M2_PER_HECTARE, monthlyFromAnnual } from "@/lib/rent";
import { formatCZK, formatNumber } from "@/lib/format";
import { Field, FormError, FormSection, inputClass, SubmitBar } from "@/components/forms/FormKit";

// "1 234,5" → 1234.5; prázdné nebo neplatné → NaN
const parse = (v: string) => (v.trim() ? Number(v.replace(/\s/g, "").replace(",", ".")) : NaN);

export default function TenantForm({
  action,
  cancelHref,
  defaultType = "tenant",
  defaultLeaseArea,
  initial,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  cancelHref: string;
  defaultType?: Tenant["type"];
  defaultLeaseArea?: number; // výměra pozemku jako výchozí propachtovaná plocha
  initial?: Tenant; // úprava existujícího nájemníka
}) {
  const t = useTranslations("forms.tenant");
  const tTen = useTranslations("tenants");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(action, undefined);

  // Pacht: roční pachtovné = výměra × cena za hektar (dokud ho uživatel nepřepíše ručně)
  const str = (n?: number) => (n === undefined ? "" : String(n));
  const [type, setType] = useState<Tenant["type"]>(initial?.type ?? defaultType);
  const [leaseArea, setLeaseArea] = useState(str(initial ? initial.leaseArea : defaultLeaseArea));
  const [pricePerHectare, setPricePerHectare] = useState(str(initial?.pricePerHectare));
  // Uložené pachtovné, které neodpovídá výpočtu, se bere jako ruční přepis
  const [annualOverride, setAnnualOverride] = useState<string | null>(
    initial?.annualRent !== undefined &&
      !(initial.leaseArea !== undefined && initial.pricePerHectare !== undefined &&
        annualLeaseRent(initial.leaseArea, initial.pricePerHectare) === initial.annualRent)
      ? String(initial.annualRent)
      : null
  );
  const area = parse(leaseArea);
  const price = parse(pricePerHectare);
  const computedAnnual = Number.isFinite(area) && Number.isFinite(price) ? annualLeaseRent(area, price) : NaN;
  const annualValue = annualOverride ?? (Number.isFinite(computedAnnual) ? String(computedAnnual) : "");
  const annual = parse(annualValue);
  const isLease = type === "lessee";

  return (
    <form action={formAction} className="space-y-4 max-w-3xl">
      <FormSection title={t("person")}>
        <Field label={tTen("fields.name")}>
          <input name="name" required autoComplete="off" defaultValue={initial?.name} className={inputClass} />
        </Field>
        <Field label={tTen("fields.type")}>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as Tenant["type"])}
            className={inputClass}
          >
            <option value="tenant">{tTen("type.tenant")}</option>
            <option value="lessee">{tTen("type.lessee")}</option>
          </select>
        </Field>
        <Field label={tTen("fields.phone")} hint={t("phoneHint")}>
          <input name="phone" type="tel" inputMode="tel" placeholder="+420 777 123 456" defaultValue={initial?.phone} className={inputClass} />
        </Field>
        <Field label={tTen("fields.email")} hint={t("emailHint")}>
          <input name="email" type="email" defaultValue={initial?.email} className={inputClass} />
        </Field>
      </FormSection>

      <FormSection title={t("contract")}>
        <Field label={tTen("fields.contractStart")}>
          <input name="contractStart" type="date" required defaultValue={initial?.contractStart} className={inputClass} />
        </Field>
        <Field label={tTen("fields.contractEnd")} hint={t("contractEndHint")}>
          <input name="contractEnd" type="date" defaultValue={initial?.contractEnd} className={inputClass} />
        </Field>
        {!isLease && (
          <Field label={t("monthlyRent")}>
            <input name="monthlyRent" inputMode="decimal" required defaultValue={str(initial?.monthlyRent)} className={inputClass} />
          </Field>
        )}
        <Field label={t("deposit")}>
          <input name="deposit" inputMode="decimal" defaultValue={str(initial?.deposit)} className={inputClass} />
        </Field>
      </FormSection>

      {isLease && (
        <FormSection title={t("lease")}>
          <Field
            label={t("leaseArea")}
            hint={Number.isFinite(area) ? t("leaseAreaHint", { ha: formatNumber(area / M2_PER_HECTARE, locale, 4) }) : undefined}
          >
            <input
              name="leaseArea"
              inputMode="decimal"
              value={leaseArea}
              onChange={(e) => { setLeaseArea(e.target.value); setAnnualOverride(null); }}
              className={inputClass}
            />
          </Field>
          <Field label={t("pricePerHectare")}>
            <input
              name="pricePerHectare"
              inputMode="decimal"
              value={pricePerHectare}
              onChange={(e) => { setPricePerHectare(e.target.value); setAnnualOverride(null); }}
              className={inputClass}
            />
          </Field>
          <Field
            label={t("annualRent")}
            hint={
              Number.isFinite(annual)
                ? t("annualRentHint", { monthly: formatCZK(monthlyFromAnnual(annual), locale, true) })
                : t("annualRentEmpty")
            }
          >
            <input
              name="annualRent"
              inputMode="decimal"
              required
              value={annualValue}
              onChange={(e) => setAnnualOverride(e.target.value)}
              className={inputClass}
            />
          </Field>
        </FormSection>
      )}

      {!isLease && (
        <FormSection title={t("advances")}>
          <Field label={t("advanceWater")}>
            <input name="advanceWater" inputMode="decimal" defaultValue={str(initial?.advances?.water)} className={inputClass} />
          </Field>
          <Field label={t("advanceGas")}>
            <input name="advanceGas" inputMode="decimal" defaultValue={str(initial?.advances?.gas)} className={inputClass} />
          </Field>
          <Field label={t("advanceElectricity")}>
            <input name="advanceElectricity" inputMode="decimal" defaultValue={str(initial?.advances?.electricity)} className={inputClass} />
          </Field>
        </FormSection>
      )}

      <FormSection title={tTen("fields.notes")}>
        <Field label={tTen("fields.notes")} className="sm:col-span-2">
          <textarea name="notes" rows={2} defaultValue={initial?.notes} className={inputClass} />
        </Field>
      </FormSection>

      <FormError error={state?.error} />
      <SubmitBar pending={pending} cancelHref={cancelHref} />
    </form>
  );
}
