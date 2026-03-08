import { useTranslations } from "next-intl";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Insurance } from "@/lib/types";

interface InsuranceTabProps {
  insurances: Insurance[];
}

const TODAY = new Date("2026-03-08");
const WARNING_DAYS = 90;

function getInsuranceStatus(endDate: string): "active" | "expiring_soon" | "expired" {
  const end = new Date(endDate);
  if (end < TODAY) return "expired";
  const diff = Math.ceil((end.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
  return diff <= WARNING_DAYS ? "expiring_soon" : "active";
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function formatCZK(amount: number) {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_STYLES = {
  active: "bg-green-50 text-green-700 border-green-200",
  expiring_soon: "bg-yellow-50 text-yellow-700 border-yellow-200",
  expired: "bg-red-50 text-red-700 border-red-200",
} as const;

const STATUS_LABELS = {
  active: "contracts.status.active",
  expiring_soon: "contracts.status.expiring_soon",
  expired: "contracts.status.expired",
} as const;

export default function InsuranceTab({ insurances }: InsuranceTabProps) {
  const t = useTranslations("properties");
  const tIns = useTranslations("insurance");
  const tCon = useTranslations("contracts");

  if (insurances.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t("noInsuranceForProp")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {insurances.map((ins) => {
        const status = getInsuranceStatus(ins.endDate);
        return (
          <div key={ins.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-sm">{ins.provider}</span>
              </div>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded border", STATUS_STYLES[status])}>
                {tCon(STATUS_LABELS[status] as Parameters<typeof tCon>[0])}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">{tIns("fields.type")}</p>
                <p>{tIns(`type.${ins.type}` as Parameters<typeof tIns>[0])}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("policyNumber")}</p>
                <p className="font-mono text-xs">{ins.policyNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("validUntil")}</p>
                <p className={status === "expired" ? "text-red-600 font-medium" : ""}>
                  {formatDate(ins.endDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("annualPremium")}</p>
                <p className="font-semibold">{formatCZK(ins.annualPremium)}</p>
              </div>
            </div>

            {ins.notes && (
              <p className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                {ins.notes}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
