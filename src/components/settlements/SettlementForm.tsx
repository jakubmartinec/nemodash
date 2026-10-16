"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { FormState } from "@/lib/data/actions";
import type { UtilityKind, UtilitySettlement } from "@/lib/types";
import { computeSettlement } from "@/lib/settlement";
import { formatCZK, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Field, FormError, FormSection, inputClass, SubmitBar } from "@/components/forms/FormKit";

// Nájemník s předvyplněnými hodnotami z karty a z minulého vyúčtování
export interface SettlementTenantOption {
  id: string;
  name: string;
  advances: Partial<Record<UtilityKind, number>>;
  lastMeterEnd: Partial<Record<UtilityKind, number>>;
}

export interface SettlementDefaults {
  issuedDate: string;
  dueDate: string;
  variableSymbol: string;
  supplier: string;
}

const UTILITIES: UtilityKind[] = ["water", "gas", "electricity"];

// "16 275,12" → 16275.12; prázdné nebo neplatné → NaN
const parse = (v: string) => (v.trim() ? Number(v.replace(/\s/g, "").replace(",", ".")) : NaN);
const str = (n?: number) => (n === undefined ? "" : String(n));

// Počet měsíců mezi daty (zaokrouhleno), pro předvyplnění
function monthsBetween(from: string, to: string): string {
  if (!from || !to) return "";
  const days = (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000;
  return days > 0 ? String(Math.max(1, Math.round(days / 30.44))) : "";
}

export default function SettlementForm({
  action,
  cancelHref,
  tenants,
  defaults,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  cancelHref: string;
  tenants: SettlementTenantOption[];
  defaults: SettlementDefaults;
}) {
  const t = useTranslations("forms.settlement");
  const tSet = useTranslations("settlement");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(action, undefined);

  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [utility, setUtility] = useState<UtilityKind>("water");
  const tenant = tenants.find((x) => x.id === tenantId);

  const [v, setV] = useState({
    periodFrom: "",
    periodTo: "",
    months: "12",
    totalCost: "",
    totalConsumption: "",
    meterStart: str(tenant?.lastMeterEnd.water),
    meterEnd: "",
    monthlyAdvance: str(tenant?.advances.water),
  });
  const set = (key: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV((prev) => {
      const next = { ...prev, [key]: e.target.value };
      if (key === "periodFrom" || key === "periodTo") next.months = monthsBetween(next.periodFrom, next.periodTo) || prev.months;
      return next;
    });

  // Při změně nájemníka/služby předvyplnit zálohu a počáteční stav měřidla
  function prefill(nextTenantId: string, nextUtility: UtilityKind) {
    const nt = tenants.find((x) => x.id === nextTenantId);
    setV((prev) => ({
      ...prev,
      meterStart: str(nt?.lastMeterEnd[nextUtility]),
      monthlyAdvance: str(nt?.advances[nextUtility]),
    }));
  }

  // Průběžný výpočet
  const nums = {
    months: parse(v.months),
    totalCost: parse(v.totalCost),
    totalConsumption: parse(v.totalConsumption),
    meterStart: parse(v.meterStart),
    meterEnd: parse(v.meterEnd),
    monthlyAdvance: parse(v.monthlyAdvance),
  };
  const complete = Object.values(nums).every(Number.isFinite) && nums.totalConsumption > 0 && nums.meterEnd >= nums.meterStart;
  const preview = complete
    ? computeSettlement({ ...nums, dueDate: defaults.dueDate } as UtilitySettlement)
    : null;

  if (tenants.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("noTenants")}</p>;
  }

  return (
    <form action={formAction} className="space-y-4 max-w-3xl">
      <FormSection title={t("who")}>
        <Field label={t("tenant")}>
          <select
            name="tenantId"
            value={tenantId}
            onChange={(e) => { setTenantId(e.target.value); prefill(e.target.value, utility); }}
            className={inputClass}
          >
            {tenants.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </Field>
        <Field label={t("utility")}>
          <select
            name="utility"
            value={utility}
            onChange={(e) => { const u = e.target.value as UtilityKind; setUtility(u); prefill(tenantId, u); }}
            className={inputClass}
          >
            {UTILITIES.map((u) => <option key={u} value={u}>{tSet(`utility.${u}`)}</option>)}
          </select>
        </Field>
        <Field label={t("periodFrom")}>
          <input name="periodFrom" type="date" required value={v.periodFrom} onChange={set("periodFrom")} className={inputClass} />
        </Field>
        <Field label={t("periodTo")}>
          <input name="periodTo" type="date" required value={v.periodTo} onChange={set("periodTo")} className={inputClass} />
        </Field>
        <Field label={t("months")} hint={t("monthsHint")}>
          <input name="months" inputMode="numeric" required value={v.months} onChange={set("months")} className={inputClass} />
        </Field>
      </FormSection>

      <FormSection title={t("invoice")}>
        <Field label={t("supplier")} className="sm:col-span-2">
          <input name="supplier" required defaultValue={defaults.supplier} className={inputClass} />
        </Field>
        <Field label={t("invoiceNumber")}>
          <input name="invoiceNumber" required className={inputClass} />
        </Field>
        <Field label={t("totalCost")} hint={t("totalCostHint")}>
          <input name="totalCost" inputMode="decimal" required value={v.totalCost} onChange={set("totalCost")} className={inputClass} />
        </Field>
        <Field label={t("totalConsumption")} hint={t("totalConsumptionHint")}>
          <input name="totalConsumption" inputMode="decimal" required value={v.totalConsumption} onChange={set("totalConsumption")} className={inputClass} />
        </Field>
      </FormSection>

      <FormSection title={t("meter")}>
        <Field label={t("meterStart")} hint={t("meterStartHint")}>
          <input name="meterStart" inputMode="decimal" required value={v.meterStart} onChange={set("meterStart")} className={inputClass} />
        </Field>
        <Field label={t("meterEnd")}>
          <input name="meterEnd" inputMode="decimal" required value={v.meterEnd} onChange={set("meterEnd")} className={inputClass} />
        </Field>
        <Field label={t("monthlyAdvance")} hint={t("monthlyAdvanceHint")}>
          <input name="monthlyAdvance" inputMode="decimal" required value={v.monthlyAdvance} onChange={set("monthlyAdvance")} className={inputClass} />
        </Field>
      </FormSection>

      <FormSection title={t("payment")}>
        <Field label={t("issuedDate")}>
          <input name="issuedDate" type="date" required defaultValue={defaults.issuedDate} className={inputClass} />
        </Field>
        <Field label={t("dueDate")}>
          <input name="dueDate" type="date" required defaultValue={defaults.dueDate} className={inputClass} />
        </Field>
        <Field label={t("variableSymbol")}>
          <input name="variableSymbol" required defaultValue={defaults.variableSymbol} className={inputClass} />
        </Field>
        <div className="hidden sm:block" />
        <Field label={t("newMonthlyAdvance")} hint={t("optional")}>
          <input name="newMonthlyAdvance" inputMode="decimal" className={inputClass} />
        </Field>
        <Field label={t("newAdvanceFrom")} hint={t("optional")}>
          <input name="newAdvanceFrom" type="date" className={inputClass} />
        </Field>
      </FormSection>

      {/* Průběžný výsledek */}
      <section className="rounded-lg border border-border bg-card p-4 space-y-2" aria-live="polite">
        <h2 className="text-sm font-semibold">{t("preview")}</h2>
        {!preview ? (
          <p className="text-sm text-muted-foreground">{t("previewEmpty")}</p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted-foreground">{t("previewConsumption")}</dt>
              <dd className="tabular-nums text-right">{formatNumber(preview.consumption, locale, 2)}</dd>
              <dt className="text-muted-foreground">{t("previewUnitPrice")}</dt>
              <dd className="tabular-nums text-right">{formatCZK(preview.unitPrice, locale, true)}</dd>
              <dt className="text-muted-foreground">{t("previewCost")}</dt>
              <dd className="tabular-nums text-right">{formatCZK(preview.cost, locale, true)}</dd>
              <dt className="text-muted-foreground">{t("previewAdvances")}</dt>
              <dd className="tabular-nums text-right">− {formatCZK(preview.advancesPaid, locale, true)}</dd>
            </dl>
            <p
              className={cn(
                "flex justify-between border-t border-border pt-2 text-sm font-semibold",
                preview.outcome === "underpaid" && "text-danger",
                preview.outcome === "overpaid" && "text-success"
              )}
            >
              <span>{t(`outcome.${preview.outcome}`)}</span>
              <span className="tabular-nums">{formatCZK(Math.abs(preview.balance), locale, true)}</span>
            </p>
          </>
        )}
      </section>

      <FormError error={state?.error} />
      <SubmitBar pending={pending} cancelHref={cancelHref} label={t("submit")} />
    </form>
  );
}
