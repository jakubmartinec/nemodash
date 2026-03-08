import { getTranslations } from "next-intl/server";
import {
  Building2,
  AlertCircle,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import PropertyOverview, {
  type PropertyStatusSummary,
} from "@/components/dashboard/PropertyOverview";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import MonthlyFinance, {
  type MonthlyFinanceData,
} from "@/components/dashboard/MonthlyFinance";
import {
  mockProperties,
  mockPayments,
  mockInspections,
  mockContracts,
  getUpcomingEvents,
  getPaymentsByProperty,
  getInspectionsByProperty,
} from "@/lib/mock-data";
import { CONTRACT_EXPIRING_THRESHOLD_DAYS } from "@/lib/constants";

// Formátovač CZK pro subtext
function formatCZK(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });

  // ── StatCard 1: nemovitosti ─────────────────────────────────────────────
  const houses = mockProperties.filter((p) => p.type === "house").length;
  const land = mockProperties.filter((p) => p.type === "land").length;

  // ── StatCard 2: neuhrazené platby ───────────────────────────────────────
  const overduePayments = mockPayments.filter((p) => p.status === "overdue");
  const overdueTotal = overduePayments.reduce((s, p) => s + p.amount, 0);

  // ── StatCard 3: blížící se revize (expired + expiring_soon) ─────────────
  const problemInspections = mockInspections.filter(
    (i) => i.status === "expired" || i.status === "expiring_soon"
  );

  // ── StatCard 4: končící smlouvy do 90 dní ───────────────────────────────
  const now = new Date("2026-03-08");
  const threshold90 = new Date(
    now.getTime() + CONTRACT_EXPIRING_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
  );
  const expiringContracts = mockContracts.filter((c) => {
    if (!c.endDate) return false;
    const end = new Date(c.endDate);
    return end <= threshold90;
  });

  // ── PropertyOverview: stavový souhrn pro každou nemovitost ──────────────
  const propertyItems: PropertyStatusSummary[] = mockProperties.map((property) => {
    const payments = getPaymentsByProperty(property.id);
    const inspections = getInspectionsByProperty(property.id);

    let paymentStatus: PropertyStatusSummary["paymentStatus"] = "ok";
    if (payments.some((p) => p.status === "overdue")) paymentStatus = "danger";
    else if (payments.some((p) => p.status === "pending")) paymentStatus = "warning";

    let inspectionStatus: PropertyStatusSummary["inspectionStatus"] = "none";
    if (inspections.length > 0) {
      if (inspections.some((i) => i.status === "expired")) inspectionStatus = "danger";
      else if (inspections.some((i) => i.status === "expiring_soon")) inspectionStatus = "warning";
      else inspectionStatus = "ok";
    }

    return { property, paymentStatus, inspectionStatus };
  });

  // ── UpcomingEvents ───────────────────────────────────────────────────────
  const events = getUpcomingEvents(90);

  // ── MonthlyFinance: platby s dueDate v 2026-03 ──────────────────────────
  const CURRENT_MONTH = "2026-03";
  const monthlyPayments = mockPayments.filter((p) =>
    p.dueDate.startsWith(CURRENT_MONTH)
  );

  const monthlyIncoming = monthlyPayments.filter((p) => p.direction === "incoming");
  const monthlyOutgoing = monthlyPayments.filter((p) => p.direction === "outgoing");

  const incomeRent = monthlyIncoming
    .filter((p) => p.type === "rent")
    .reduce((s, p) => s + p.amount, 0);
  const incomeLease = monthlyIncoming
    .filter((p) => p.type === "lease")
    .reduce((s, p) => s + p.amount, 0);

  const expenseInsurance = monthlyOutgoing
    .filter((p) => p.type === "insurance")
    .reduce((s, p) => s + p.amount, 0);
  const expenseWaste = monthlyOutgoing
    .filter((p) => p.type === "waste")
    .reduce((s, p) => s + p.amount, 0);
  const expenseLease = monthlyOutgoing
    .filter((p) => p.type === "lease")
    .reduce((s, p) => s + p.amount, 0);
  const expenseMaintenance = monthlyOutgoing
    .filter((p) => p.type === "maintenance")
    .reduce((s, p) => s + p.amount, 0);
  const expenseOther = monthlyOutgoing
    .filter((p) =>
      !["insurance", "waste", "lease", "maintenance"].includes(p.type)
    )
    .reduce((s, p) => s + p.amount, 0);

  const financeData: MonthlyFinanceData = {
    incomeLines: [
      ...(incomeRent > 0 ? [{ labelKey: "incomeRent", amount: incomeRent }] : []),
      ...(incomeLease > 0 ? [{ labelKey: "incomeLease", amount: incomeLease }] : []),
    ],
    expenseLines: [
      ...(expenseLease > 0 ? [{ labelKey: "incomeLease", amount: expenseLease }] : []),
      ...(expenseInsurance > 0 ? [{ labelKey: "expenseInsurance", amount: expenseInsurance }] : []),
      ...(expenseWaste > 0 ? [{ labelKey: "expenseWaste", amount: expenseWaste }] : []),
      ...(expenseMaintenance > 0 ? [{ labelKey: "expenseMaintenance", amount: expenseMaintenance }] : []),
      ...(expenseOther > 0 ? [{ labelKey: "expenseOther", amount: expenseOther }] : []),
    ],
  };

  return (
    <div className="space-y-6">
      {/* Záhlaví */}
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      {/* StatCards — 4 karty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label={t("stats.totalProperties")}
          value={mockProperties.length}
          subtext={t("statsSubtext.properties", { houses, land })}
          variant="default"
        />
        <StatCard
          icon={AlertCircle}
          label={t("stats.overduePayments")}
          value={overduePayments.length}
          subtext={
            overduePayments.length > 0
              ? t("statsSubtext.overduePayments", {
                  count: overduePayments.length,
                  amount: formatCZK(overdueTotal),
                })
              : undefined
          }
          variant={overduePayments.length > 0 ? "danger" : "success"}
        />
        <StatCard
          icon={ClipboardCheck}
          label={t("stats.expiringSoonInspections")}
          value={problemInspections.length}
          subtext={t("statsSubtext.inspections", { count: problemInspections.length })}
          variant={
            problemInspections.some((i) => i.status === "expired")
              ? "danger"
              : problemInspections.length > 0
              ? "warning"
              : "success"
          }
        />
        <StatCard
          icon={FileText}
          label={t("stats.expiringContracts")}
          value={expiringContracts.length}
          subtext={t("statsSubtext.contracts", { count: expiringContracts.length })}
          variant={
            expiringContracts.length >= 3
              ? "danger"
              : expiringContracts.length > 0
              ? "warning"
              : "success"
          }
        />
      </div>

      {/* Střední řada: přehled nemovitostí + nadcházející události */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PropertyOverview locale={locale} items={propertyItems} />
        <UpcomingEvents events={events} />
      </div>

      {/* Finance tohoto měsíce */}
      <MonthlyFinance data={financeData} />
    </div>
  );
}
