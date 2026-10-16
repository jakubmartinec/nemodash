"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail, Phone, Link2, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tenant, UtilitySettlement } from "@/lib/types";
import SettlementCard from "@/components/settlements/SettlementCard";
import { getContractStatus } from "@/lib/constants";
import { formatCZK, formatDate } from "@/lib/format";

interface TenantsTabProps {
  locale: string;
  tenants: Tenant[];
  settlements: UtilitySettlement[];
}

const CONTRACT_STATUS_STYLES = {
  active: "bg-success-soft text-success border-success/30",
  expiring_soon: "bg-warning-soft text-warning border-warning/30",
  expired: "bg-danger-soft text-danger border-danger/30",
} as const;

// Odkaz do nájemnického portálu: zkopírovat / otevřít
function PortalLink({ href }: { href: string }) {
  const t = useTranslations("tenantPortal");
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(new URL(href, window.location.origin).toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">{t("link")}</span>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? t("copied") : t("copy")}
      </button>
      <Link
        href={href}
        target="_blank"
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        {t("open")}
      </Link>
    </div>
  );
}

export default function TenantsTab({ locale, tenants, settlements }: TenantsTabProps) {
  const t = useTranslations("properties");
  const tTen = useTranslations("tenants");
  const tCon = useTranslations("contracts");
  const tPortal = useTranslations("tenantPortal");

  if (tenants.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t("noTenantsForProp")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {tenants.map((tenant) => {
        const tenantSettlements = settlements.filter((s) => s.tenantId === tenant.id);
        const contractStatus = getContractStatus(tenant.contractEnd);
        const statusLabel = tCon(`status.${contractStatus}`);

        return (
          <div
            key={tenant.id}
            className="rounded-lg border border-border bg-card p-4 space-y-3"
          >
            {/* Záhlaví — jméno + typ + stav smlouvy */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-semibold">{tenant.name}</p>
                <span className="text-xs text-muted-foreground">
                  {tTen(`type.${tenant.type}`)}
                </span>
              </div>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded border",
                  CONTRACT_STATUS_STYLES[contractStatus]
                )}
              >
                {statusLabel}
              </span>
            </div>

            {/* Kontakt */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {tenant.email && (
                <a
                  href={`mailto:${tenant.email}`}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {tenant.email}
                </a>
              )}
              {tenant.phone && (
                <a
                  href={`tel:${tenant.phone}`}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {tenant.phone}
                </a>
              )}
            </div>

            {/* Finance + smlouva */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{tTen("fields.monthlyRent")}</p>
                <p className="text-sm font-semibold">{formatCZK(tenant.monthlyRent)}</p>
                <p className="text-xs text-muted-foreground">{t("contractMonthly")}</p>
              </div>
              {tenant.deposit && (
                <div>
                  <p className="text-xs text-muted-foreground">{t("deposit")}</p>
                  <p className="text-sm font-semibold">{formatCZK(tenant.deposit)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">{tTen("fields.contractStart")}</p>
                <p className="text-sm">{formatDate(tenant.contractStart)}</p>
              </div>
              {tenant.contractEnd && (
                <div>
                  <p className="text-xs text-muted-foreground">{tTen("fields.contractEnd")}</p>
                  <p className="text-sm">{formatDate(tenant.contractEnd)}</p>
                </div>
              )}
            </div>

            {/* Vyúčtování záloh + odkaz pro nájemníka */}
            {(tenantSettlements.length > 0 || tenant.portalToken) && (
              <div className="border-t border-border pt-3 space-y-3">
                {tenantSettlements.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">{tPortal("settlements")}</p>
                    {tenantSettlements.map((s) => (
                      <SettlementCard key={s.id} settlement={s} audience="owner" compact />
                    ))}
                  </div>
                )}
                {tenant.portalToken && <PortalLink href={`/${locale}/portal/${tenant.portalToken}`} />}
              </div>
            )}

            {/* Poznámky */}
            {tenant.notes && (
              <p className="text-xs text-muted-foreground border-t border-border pt-2">
                {tenant.notes}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
