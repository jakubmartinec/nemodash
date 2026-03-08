import { useTranslations } from "next-intl";
import { CreditCard, ClipboardCheck, Shield, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Payment, Inspection, Insurance, Contract } from "@/lib/types";
import { getContractStatus } from "@/lib/constants";

interface OverviewTabProps {
  payments: Payment[];
  inspections: Inspection[];
  insurances: Insurance[];
  contracts: Contract[];
}

type CardVariant = "ok" | "warning" | "danger" | "neutral";

const TODAY = "2026-03-08";

function OverviewCard({
  icon: Icon,
  title,
  variant,
  lines,
}: {
  icon: React.ElementType;
  title: string;
  variant: CardVariant;
  lines: string[];
}) {
  const border = {
    ok: "border-l-green-500",
    warning: "border-l-yellow-400",
    danger: "border-l-red-500",
    neutral: "border-l-muted-foreground/30",
  }[variant];

  const iconBg = {
    ok: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    neutral: "bg-muted text-muted-foreground",
  }[variant];

  return (
    <div className={cn("rounded-lg border border-border border-l-4 bg-card p-4", border)}>
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("rounded-md p-1.5", iconBg)}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <ul className="space-y-1">
        {lines.map((line, i) => (
          <li key={i} className="text-sm text-muted-foreground">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function OverviewTab({
  payments,
  inspections,
  insurances,
  contracts,
}: OverviewTabProps) {
  const t = useTranslations("properties");
  const tPay = useTranslations("payments");
  const tInsp = useTranslations("inspections");
  const tIns = useTranslations("insurance");
  const tCon = useTranslations("contracts");

  // Platby
  const paidCount = payments.filter((p) => p.status === "paid").length;
  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const overdueCount = payments.filter((p) => p.status === "overdue").length;
  const paymentVariant: CardVariant =
    overdueCount > 0 ? "danger" : pendingCount > 0 ? "warning" : payments.length > 0 ? "ok" : "neutral";
  const paymentLines =
    payments.length === 0
      ? [t("noPayments")]
      : [
          paidCount > 0 ? t("paidCount", { count: paidCount }) : null,
          pendingCount > 0 ? t("pendingCount", { count: pendingCount }) : null,
          overdueCount > 0 ? t("overdueCount", { count: overdueCount }) : null,
        ].filter(Boolean) as string[];

  // Revize
  const validCount = inspections.filter((i) => i.status === "valid").length;
  const expiringSoonCount = inspections.filter((i) => i.status === "expiring_soon").length;
  const expiredCount = inspections.filter((i) => i.status === "expired").length;
  const inspVariant: CardVariant =
    expiredCount > 0 ? "danger" : expiringSoonCount > 0 ? "warning" : inspections.length > 0 ? "ok" : "neutral";
  const inspLines =
    inspections.length === 0
      ? [t("noInspectionsForProp")]
      : [
          validCount > 0 ? t("validCount", { count: validCount }) : null,
          expiringSoonCount > 0 ? t("expiringSoonCount", { count: expiringSoonCount }) : null,
          expiredCount > 0 ? t("expiredCount", { count: expiredCount }) : null,
        ].filter(Boolean) as string[];

  // Pojistky
  const today = new Date(TODAY);
  const activeIns = insurances.filter((i) => new Date(i.endDate) >= today);
  const expiredIns = insurances.filter((i) => new Date(i.endDate) < today);
  const insVariant: CardVariant =
    insurances.length === 0 ? "neutral" : expiredIns.length > 0 ? "danger" : "ok";
  const insLines =
    insurances.length === 0
      ? [t("noInsuranceForProp")]
      : [
          activeIns.length > 0 ? t("activeCount", { count: activeIns.length }) : null,
          expiredIns.length > 0 ? t("expiredCount", { count: expiredIns.length }) : null,
        ].filter(Boolean) as string[];

  // Smlouvy
  const contractStatuses = contracts.map((c) => getContractStatus(c.endDate));
  const activeContracts = contractStatuses.filter((s) => s === "active").length;
  const expiringContracts = contractStatuses.filter((s) => s === "expiring_soon").length;
  const expiredContracts = contractStatuses.filter((s) => s === "expired").length;
  const conVariant: CardVariant =
    contracts.length === 0 ? "neutral" : expiredContracts > 0 ? "danger" : expiringContracts > 0 ? "warning" : "ok";
  const conLines =
    contracts.length === 0
      ? [t("noContracts")]
      : [
          activeContracts > 0 ? t("activeCount", { count: activeContracts }) : null,
          expiringContracts > 0 ? t("expiringSoonCount", { count: expiringContracts }) : null,
          expiredContracts > 0 ? t("expiredCount", { count: expiredContracts }) : null,
        ].filter(Boolean) as string[];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <OverviewCard
        icon={CreditCard}
        title={tPay("title")}
        variant={paymentVariant}
        lines={paymentLines}
      />
      <OverviewCard
        icon={ClipboardCheck}
        title={tInsp("title")}
        variant={inspVariant}
        lines={inspLines}
      />
      <OverviewCard
        icon={Shield}
        title={tIns("title")}
        variant={insVariant}
        lines={insLines}
      />
      <OverviewCard
        icon={FileText}
        title={tCon("title")}
        variant={conVariant}
        lines={conLines}
      />
    </div>
  );
}
