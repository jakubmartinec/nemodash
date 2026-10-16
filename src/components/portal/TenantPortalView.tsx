import { getTranslations } from "next-intl/server";
import { Building2, Mail, Phone, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCZK, formatDate } from "@/lib/format";
import { computeSettlement } from "@/lib/settlement";
import { getDataset } from "@/lib/data/store";
import { paymentsByTenant, propertyById, settlementsByTenant, tenantById } from "@/lib/data/selectors";
import SettlementCard from "@/components/settlements/SettlementCard";
import SignOutButton from "@/components/auth/SignOutButton";
import type { UtilityKind } from "@/lib/types";

const PAYMENT_STATUS_STYLES = {
  paid: "bg-success-soft text-success border-success/30",
  pending: "bg-warning-soft text-warning border-warning/30",
  overdue: "bg-danger-soft text-danger border-danger/30",
} as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

// Přehled nájemníka: co zaplatit, vyúčtování, předpis, platby a kontakt na pronajímatele
export default async function TenantPortalView({
  locale,
  tenantId,
  canSignOut = false,
}: {
  locale: string;
  tenantId?: string;
  canSignOut?: boolean;
}) {
  const t = await getTranslations({ locale, namespace: "portal" });
  const tSet = await getTranslations({ locale, namespace: "settlement" });
  const tPay = await getTranslations({ locale, namespace: "payments" });

  const ds = await getDataset();
  const landlord = ds.landlord;
  const tenant = tenantId ? tenantById(ds, tenantId) : undefined;
  if (!tenant) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-1">
          <h1 className="text-lg font-semibold">{t("invalidTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("invalidText")}</p>
        </div>
      </main>
    );
  }

  const property = propertyById(ds, tenant.propertyId);
  const payments = paymentsByTenant(ds, tenant.id);
  const settlements = settlementsByTenant(ds, tenant.id);
  const open = settlements.filter((s) => !s.settledDate);
  const history = settlements.filter((s) => s.settledDate);
  const overdue = payments.filter((p) => p.status === "overdue");
  const czk = (n: number, precise = false) => formatCZK(n, locale, precise);
  const utilityName = (u: UtilityKind) => tSet(`utility.${u}`).toLowerCase();

  // Měsíční předpis: nájem + zálohy
  const advances = Object.entries(tenant.advances ?? {}).filter(([, v]) => v) as [UtilityKind, number][];
  const monthlyTotal = tenant.monthlyRent + advances.reduce((sum, [, v]) => sum + v, 0);

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        {/* Záhlaví */}
        <header className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t("badge")}</p>
            <h1 className="text-lg font-semibold leading-tight">{property?.name}</h1>
            <p className="text-sm text-muted-foreground">{t("tenantOf", { name: tenant.name })}</p>
          </div>
          {canSignOut && (
            <div className="ml-auto shrink-0">
              <SignOutButton locale={locale} withLabel />
            </div>
          )}
        </header>

        {/* Co je potřeba udělat */}
        {open.map((s) => {
          const r = computeSettlement(s);
          if (r.outcome === "underpaid") {
            return (
              <section key={s.id} className="rounded-lg border border-danger/30 bg-danger-soft p-4 space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-sm font-semibold">{t("toPayTitle")}</h2>
                  <p className="text-2xl font-bold tabular-nums text-danger">{czk(r.balance, true)}</p>
                </div>
                <p className="text-sm">
                  {t("toPayText", { utility: utilityName(s.utility), date: formatDate(s.dueDate, locale) })}
                </p>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {landlord.bankAccount && (
                    <>
                      <dt className="text-muted-foreground">{t("account")}</dt>
                      <dd className="font-mono">{landlord.bankAccount}</dd>
                    </>
                  )}
                  <dt className="text-muted-foreground">{t("variableSymbol")}</dt>
                  <dd className="font-mono">{s.variableSymbol}</dd>
                  <dt className="text-muted-foreground">{t("amount")}</dt>
                  <dd className="font-mono">{czk(r.balance, true)}</dd>
                </dl>
              </section>
            );
          }
          if (r.outcome === "overpaid") {
            return (
              <section key={s.id} className="rounded-lg border border-success/30 bg-success-soft p-4 space-y-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-sm font-semibold">{t("refundTitle")}</h2>
                  <p className="text-2xl font-bold tabular-nums text-success">{czk(-r.balance, true)}</p>
                </div>
                <p className="text-sm">
                  {t("refundText", { utility: utilityName(s.utility), date: formatDate(s.dueDate, locale) })}
                </p>
              </section>
            );
          }
          return null;
        })}

        {open.length === 0 && (
          <section className="rounded-lg border border-success/30 bg-success-soft p-4">
            <h2 className="text-sm font-semibold">{t("allSettledTitle")}</h2>
            <p className="text-sm">{t("allSettledText")}</p>
          </section>
        )}

        {overdue.length > 0 && (
          <section className="rounded-lg border border-danger/30 bg-danger-soft p-4">
            <h2 className="text-sm font-semibold">{t("overdueTitle")}</h2>
            <p className="text-sm">
              {t("overdueText", {
                count: overdue.length,
                amount: czk(overdue.reduce((sum, p) => sum + p.amount, 0)),
              })}
            </p>
          </section>
        )}

        {/* Rozpis aktuálního vyúčtování */}
        {open.map((s) => (
          <Section key={s.id} title={t("currentSettlement")}>
            <SettlementCard settlement={s} audience="tenant" />
          </Section>
        ))}

        <Section title={t("monthly")}>
          <dl className="divide-y divide-border text-sm">
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground">{t("rent")}</dt>
              <dd className="tabular-nums">{czk(tenant.monthlyRent)}</dd>
            </div>
            {advances.map(([utility, value]) => (
              <div key={utility} className="flex justify-between py-1.5">
                <dt className="text-muted-foreground">{t(`advance.${utility}`)}</dt>
                <dd className="tabular-nums">{czk(value)}</dd>
              </div>
            ))}
            <div className="flex justify-between py-1.5 font-semibold">
              <dt>{t("monthlyTotal")}</dt>
              <dd className="tabular-nums">{czk(monthlyTotal)}</dd>
            </div>
          </dl>
        </Section>

        <Section title={t("payments")}>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noPayments")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p>{tPay(`type.${p.type}`)} {p.period}</p>
                    <p className="text-xs text-muted-foreground">
                      {tPay("fields.dueDate")} {formatDate(p.dueDate, locale)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="tabular-nums">{czk(p.amount)}</p>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded border", PAYMENT_STATUS_STYLES[p.status])}>
                      {tPay(`status.${p.status}`)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {history.length > 0 && (
          <Section title={t("history")}>
            <div className="divide-y divide-border">
              {history.map((s) => (
                <div key={s.id} className="py-3 first:pt-0 last:pb-0">
                  <SettlementCard settlement={s} audience="tenant" compact />
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section title={t("landlord")}>
          <p className="text-sm">{landlord.name}</p>
          <p className="text-sm text-muted-foreground">{t("question")}</p>
          <div className="flex flex-wrap gap-2">
            {landlord.email && (
              <a
                href={`mailto:${landlord.email}?subject=${encodeURIComponent(
                  t("emailSubject", { property: property?.name ?? "" })
                )}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
              >
                <Mail className="h-3.5 w-3.5" />
                {t("writeEmail")}
              </a>
            )}
            {landlord.phone && (
              <a
                href={`tel:${landlord.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                <Phone className="h-3.5 w-3.5" />
                {landlord.phone}
              </a>
            )}
          </div>
        </Section>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          {t("privacy")}
        </p>
      </div>
    </main>
  );
}
