import Link from "next/link";
import { useTranslations } from "next-intl";
import { Building2, Sprout, AlertTriangle, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Property } from "@/lib/types";

export interface PropertyStatusSummary {
  property: Property;
  paymentStatus: "ok" | "warning" | "danger";
  inspectionStatus: "ok" | "warning" | "danger" | "none";
}

interface PropertyOverviewProps {
  locale: string;
  items: PropertyStatusSummary[];
}

function StatusDot({
  status,
  okLabel,
  issueLabel,
  noneLabel,
}: {
  status: "ok" | "warning" | "danger" | "none";
  okLabel: string;
  issueLabel: string;
  noneLabel?: string;
}) {
  if (status === "none") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Circle className="h-2.5 w-2.5" />
        {noneLabel}
      </span>
    );
  }
  if (status === "ok") {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <CheckCircle2 className="h-3 w-3" />
        {okLabel}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        status === "danger" ? "text-red-600" : "text-yellow-600"
      )}
    >
      <AlertTriangle className="h-3 w-3" />
      {issueLabel}
    </span>
  );
}

export default function PropertyOverview({ locale, items }: PropertyOverviewProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="font-semibold text-sm">{t("propertyOverview")}</h2>
        <Link
          href={`/${locale}/properties`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("viewAll")}
        </Link>
      </div>

      <div className="divide-y divide-border">
        {items.map(({ property, paymentStatus, inspectionStatus }) => {
          const Icon = property.type === "house" ? Building2 : Sprout;
          return (
            <Link
              key={property.id}
              href={`/${locale}/properties/${property.id}`}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors group"
            >
              {/* Ikona typu */}
              <div className="shrink-0 h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-muted/80">
                <Icon className="h-4 w-4" />
              </div>

              {/* Název + adresa */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{property.name}</p>
                {property.address && (
                  <p className="text-xs text-muted-foreground truncate">{property.address}</p>
                )}
              </div>

              {/* Mini stavové indikátory */}
              <div className="shrink-0 flex flex-col items-end gap-1">
                <StatusDot
                  status={paymentStatus}
                  okLabel={t("paymentOk")}
                  issueLabel={t("paymentIssue")}
                />
                <StatusDot
                  status={inspectionStatus}
                  okLabel={t("inspectionOk")}
                  issueLabel={t("inspectionIssue")}
                  noneLabel={t("noInspections")}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
