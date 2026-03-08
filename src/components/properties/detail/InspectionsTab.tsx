import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Inspection } from "@/lib/types";

interface InspectionsTabProps {
  inspections: Inspection[];
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

const STATUS_STYLES = {
  valid: {
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 border-green-200",
  },
  expiring_soon: {
    dot: "bg-yellow-400",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  expired: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
} as const;

export default function InspectionsTab({ inspections }: InspectionsTabProps) {
  const t = useTranslations("properties");
  const tInsp = useTranslations("inspections");

  if (inspections.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t("noInspectionsForProp")}
      </p>
    );
  }

  // Seřadit: expired a expiring_soon první
  const sorted = [...inspections].sort((a, b) => {
    const order = { expired: 0, expiring_soon: 1, valid: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="space-y-3">
      {sorted.map((insp) => {
        const styles = STATUS_STYLES[insp.status];
        return (
          <div key={insp.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", styles.dot)} />
                <span className="font-medium text-sm">
                  {tInsp(`type.${insp.type}` as Parameters<typeof tInsp>[0])}
                </span>
              </div>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded border", styles.badge)}>
                {tInsp(`status.${insp.status}` as Parameters<typeof tInsp>[0])}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">{tInsp("fields.lastDate")}</p>
                <p>{formatDate(insp.lastDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{tInsp("fields.nextDueDate")}</p>
                <p className={insp.status === "expired" ? "text-red-600 font-medium" : ""}>
                  {formatDate(insp.nextDueDate)}
                </p>
              </div>
              {insp.provider && (
                <div>
                  <p className="text-xs text-muted-foreground">{tInsp("fields.provider")}</p>
                  <p className="truncate">{insp.provider}</p>
                </div>
              )}
              {insp.cost !== undefined && (
                <div>
                  <p className="text-xs text-muted-foreground">{tInsp("fields.cost")}</p>
                  <p>
                    {new Intl.NumberFormat("cs-CZ", {
                      style: "currency",
                      currency: "CZK",
                      maximumFractionDigits: 0,
                    }).format(insp.cost)}
                  </p>
                </div>
              )}
            </div>

            {insp.notes && (
              <p className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                {insp.notes}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
