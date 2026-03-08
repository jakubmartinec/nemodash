import { useTranslations } from "next-intl";
import { Mail, Phone, Banknote, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tenant, Contract } from "@/lib/types";
import { getContractStatus } from "@/lib/constants";

interface TenantsTabProps {
  tenants: Tenant[];
  contracts: Contract[];
}

function formatCZK(amount: number) {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

const CONTRACT_STATUS_STYLES = {
  active: "bg-green-50 text-green-700 border-green-200",
  expiring_soon: "bg-yellow-50 text-yellow-700 border-yellow-200",
  expired: "bg-red-50 text-red-700 border-red-200",
} as const;

export default function TenantsTab({ tenants, contracts }: TenantsTabProps) {
  const t = useTranslations("properties");
  const tTen = useTranslations("tenants");
  const tCon = useTranslations("contracts");

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
        const contract = contracts.find((c) => c.tenantId === tenant.id);
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
