import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { UpcomingEvent } from "@/lib/data/selectors";
import { formatDate } from "@/lib/format";
import { getToday } from "@/lib/constants";

interface UpcomingEventsProps {
  events: UpcomingEvent[];
}

const EVENT_TYPE_LABELS: Record<UpcomingEvent["type"], string> = {
  inspection: "eventInspection",
  contract: "eventContract",
  insurance: "eventInsurance",
};

const INSPECTION_TYPE_KEYS: Record<string, string> = {
  chimney: "inspections.type.chimney",
  gas_boiler: "inspections.type.gas_boiler",
  electrical: "inspections.type.electrical",
  fire_alarm: "inspections.type.fire_alarm",
  fire_extinguisher: "inspections.type.fire_extinguisher",
  elevator: "inspections.type.elevator",
  other: "inspections.type.other",
};

const CONTRACT_TYPE_KEYS: Record<string, string> = {
  rental: "contracts.type.rental",
  lease: "contracts.type.lease",
  purchase: "contracts.type.purchase",
  other: "contracts.type.other",
};

const INSURANCE_TYPE_KEYS: Record<string, string> = {
  property: "insurance.type.property",
  liability: "insurance.type.liability",
  natural_disaster: "insurance.type.natural_disaster",
  other: "insurance.type.other",
};

function daysDiff(dateStr: string): number {
  const now = getToday();
  const due = new Date(dateStr);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const displayed = events.slice(0, 10);

  if (displayed.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-sm">{t("dashboard.upcomingEvents")}</h2>
        </div>
        <p className="px-5 py-8 text-sm text-muted-foreground text-center">
          {t("dashboard.noEvents")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-semibold text-sm">{t("dashboard.upcomingEvents")}</h2>
      </div>

      <ul className="divide-y divide-border">
        {displayed.map((event) => {
          const diff = daysDiff(event.dueDate);
          const isExpired = event.status === "expired";

          // Popísek detail události
          const detailKey = EVENT_TYPE_LABELS[event.type];
          let detail = t(`dashboard.${detailKey}` as Parameters<typeof t>[0]);
          if (event.type === "inspection" && INSPECTION_TYPE_KEYS[event.label]) {
            detail = t(INSPECTION_TYPE_KEYS[event.label] as Parameters<typeof t>[0]);
          } else if (event.type === "contract" && CONTRACT_TYPE_KEYS[event.label]) {
            detail = t(CONTRACT_TYPE_KEYS[event.label] as Parameters<typeof t>[0]);
          } else if (event.type === "insurance" && INSURANCE_TYPE_KEYS[event.label]) {
            detail = t(INSURANCE_TYPE_KEYS[event.label] as Parameters<typeof t>[0]);
          }

          // Relativní datum
          let relativeLabel: string;
          if (diff === 0) {
            relativeLabel = t("dashboard.today");
          } else if (diff < 0) {
            relativeLabel = t("dashboard.daysAgo", { days: Math.abs(diff) });
          } else {
            relativeLabel = t("dashboard.daysLeft", { days: diff });
          }

          return (
            <li key={event.referenceId} className="flex items-center gap-3 px-5 py-3">
              {/* Barevná tečka */}
              <span
                className={cn(
                  "h-2 w-2 rounded-full shrink-0 mt-0.5",
                  isExpired ? "bg-danger-fill" : "bg-warning-fill"
                )}
              />

              {/* Popis */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{detail}</p>
                <p className="text-xs text-muted-foreground truncate">{event.propertyName}</p>
              </div>

              {/* Datum */}
              <div className="shrink-0 text-right">
                <p
                  className={cn(
                    "text-xs font-medium",
                    isExpired ? "text-danger" : "text-warning"
                  )}
                >
                  {relativeLabel}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(event.dueDate, locale)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
