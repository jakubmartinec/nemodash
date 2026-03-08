import Link from "next/link";
import { useTranslations } from "next-intl";
import { Building2, Sprout, MapPin, FileText, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Property } from "@/lib/types";

type StatusLevel = "ok" | "warning" | "danger" | "none";

export interface PropertyCardData {
  property: Property;
  tenantCount: number;
  lesseeCount: number;
  paymentStatus: StatusLevel;
  inspectionStatus: StatusLevel;
  insuranceStatus: StatusLevel;
}

interface PropertyCardProps {
  data: PropertyCardData;
  locale: string;
}

function StatusPip({
  level,
  label,
  statusOk,
  statusIssue,
  statusNone,
}: {
  level: StatusLevel;
  label: string;
  statusOk: string;
  statusIssue: string;
  statusNone: string;
}) {
  const dotClass =
    level === "ok"
      ? "bg-green-500"
      : level === "warning"
      ? "bg-yellow-400"
      : level === "danger"
      ? "bg-red-500"
      : "bg-muted-foreground/30";

  const textClass =
    level === "ok"
      ? "text-green-700"
      : level === "warning"
      ? "text-yellow-700"
      : level === "danger"
      ? "text-red-600"
      : "text-muted-foreground/60";

  const sublabel =
    level === "none" ? statusNone : level === "ok" ? statusOk : statusIssue;

  return (
    <span className="flex items-center gap-1">
      <span className={cn("h-2 w-2 rounded-full shrink-0", dotClass)} />
      <span className={cn("text-xs", textClass)}>
        {label} {sublabel}
      </span>
    </span>
  );
}

export default function PropertyCard({ data, locale }: PropertyCardProps) {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");
  const { property, tenantCount, lesseeCount, paymentStatus, inspectionStatus, insuranceStatus } = data;

  const Icon = property.type === "house" ? Building2 : Sprout;
  const typeLabel = t(`type.${property.type}`);
  const ownershipLabel = t(`ownership.${property.ownership}`);

  // Počet nájemníků / pachtýřů
  let occupantLabel: string;
  if (property.type === "house") {
    occupantLabel = tenantCount > 0 ? t("tenantCount", { count: tenantCount }) : t("noTenants");
  } else {
    occupantLabel = lesseeCount > 0 ? t("lesseeCount", { count: lesseeCount }) : t("noTenants");
  }

  return (
    <Link
      href={`/${locale}/properties/${property.id}`}
      className="group flex flex-col rounded-lg border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all"
    >
      {/* Záhlaví karty */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className="shrink-0 h-9 w-9 rounded-md bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-muted/80 transition-colors mt-0.5">
          <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {typeLabel}
            </span>
            <span
              className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded",
                property.ownership === "owned"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-orange-50 text-orange-700"
              )}
            >
              {ownershipLabel}
            </span>
          </div>
          <h3 className="font-semibold text-sm mt-1.5 leading-tight group-hover:text-foreground truncate">
            {property.name}
          </h3>
        </div>
      </div>

      {/* Detaily */}
      <div className="px-4 pb-3 space-y-1.5 flex-1">
        {property.address && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-px" />
            <span className="truncate">{property.address}</span>
          </div>
        )}
        {property.cadastralNumber && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span>LV {property.cadastralNumber}</span>
            {property.parcelNumbers && property.parcelNumbers.length > 0 && (
              <span className="truncate text-muted-foreground/70">
                · {property.parcelNumbers.join(", ")}
              </span>
            )}
          </div>
        )}
        {property.area && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Ruler className="h-3.5 w-3.5 shrink-0" />
            <span>
              {new Intl.NumberFormat("cs-CZ").format(property.area)}{" "}
              {t("areaUnit")}
            </span>
          </div>
        )}
      </div>

      {/* Pata — nájemníci + stavové indikátory */}
      <div className="border-t border-border px-4 py-2.5 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground shrink-0">{occupantLabel}</span>
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          <StatusPip
            level={paymentStatus}
            label={t("statusPayment")}
            statusOk={t("statusOk")}
            statusIssue={t("statusIssue")}
            statusNone={t("statusNone")}
          />
          <StatusPip
            level={inspectionStatus}
            label={t("statusInspection")}
            statusOk={t("statusOk")}
            statusIssue={t("statusIssue")}
            statusNone={t("statusNone")}
          />
          <StatusPip
            level={insuranceStatus}
            label={t("statusInsurance")}
            statusOk={t("statusOk")}
            statusIssue={t("statusIssue")}
            statusNone={t("statusNone")}
          />
        </div>
      </div>
    </Link>
  );
}
