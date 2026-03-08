"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Inspection, Property, InspectionType } from "@/lib/types";

interface InspectionsClientProps {
  inspections: Inspection[];
  properties: Property[];
}

type SortField = "property" | "type" | "lastDate" | "nextDueDate" | "status" | "provider";
type SortDir = "asc" | "desc";
type StatusFilter = "" | "valid" | "expiring_soon" | "expired";

const STATUS_STYLES = {
  valid: {
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 border-green-200",
    summary: "text-green-700",
  },
  expiring_soon: {
    dot: "bg-yellow-400",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
    summary: "text-yellow-600",
  },
  expired: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
    summary: "text-red-600",
  },
} as const;

const INSPECTION_TYPES: InspectionType[] = [
  "chimney", "gas_boiler", "electrical", "fire_alarm",
  "fire_extinguisher", "elevator", "other",
];
const STATUSES: StatusFilter[] = ["", "valid", "expiring_soon", "expired"];

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export default function InspectionsClient({ inspections, properties }: InspectionsClientProps) {
  const t = useTranslations("inspections");

  const [propertyFilter, setPropertyFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({
    field: "status",
    dir: "asc",
  });

  const propName = useCallback(
    (id: string) => properties.find((p) => p.id === id)?.name ?? id,
    [properties]
  );

  const filtered = useMemo(() => {
    let result = [...inspections];
    if (propertyFilter) result = result.filter((i) => i.propertyId === propertyFilter);
    if (typeFilter) result = result.filter((i) => i.type === typeFilter);
    if (statusFilter) result = result.filter((i) => i.status === statusFilter);
    return result;
  }, [inspections, propertyFilter, typeFilter, statusFilter]);

  const sorted = useMemo(() => {
    const { field, dir } = sort;
    const statusOrder = { expired: 0, expiring_soon: 1, valid: 2 };
    return [...filtered].sort((a, b) => {
      let va: string | number;
      let vb: string | number;
      if (field === "property") { va = propName(a.propertyId); vb = propName(b.propertyId); }
      else if (field === "status") {
        // Custom sort for status: expired first when asc
        va = statusOrder[a.status];
        vb = statusOrder[b.status];
      }
      else if (field === "lastDate") { va = a.lastDate; vb = b.lastDate; }
      else if (field === "nextDueDate") { va = a.nextDueDate; vb = b.nextDueDate; }
      else if (field === "provider") { va = a.provider ?? ""; vb = b.provider ?? ""; }
      else { va = a.type; vb = b.type; }
      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sort, propName]);

  const summary = useMemo(() => ({
    valid: filtered.filter((i) => i.status === "valid").length,
    expiring_soon: filtered.filter((i) => i.status === "expiring_soon").length,
    expired: filtered.filter((i) => i.status === "expired").length,
  }), [filtered]);

  function toggleSort(field: SortField) {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: field === "status" ? "asc" : "asc" }
    );
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sort.field !== field) return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-30" />;
    return sort.dir === "asc"
      ? <ChevronUp className="h-3 w-3 ml-1" />
      : <ChevronDown className="h-3 w-3 ml-1" />;
  }

  const selectCls =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="space-y-5">
      {/* ── Souhrn ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {(["expired", "expiring_soon", "valid"] as const).map((s) => (
          <div
            key={s}
            className="rounded-lg border border-border bg-card p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => setStatusFilter((prev) => (prev === s ? "" : s))}
          >
            <p className="text-xs text-muted-foreground mb-1">{t(`summary${s === "valid" ? "Valid" : s === "expiring_soon" ? "ExpiringSoon" : "Expired"}` as Parameters<typeof t>[0])}</p>
            <p className={cn("text-2xl font-bold", STATUS_STYLES[s].summary)}>
              {summary[s]}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filtry ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className={selectCls}
          aria-label={t("fields.property")}
        >
          <option value="">{t("filterAllProperties")}</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={selectCls}
          aria-label={t("fields.type")}
        >
          <option value="">{t("filterAllTypes")}</option>
          {INSPECTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`type.${type}` as Parameters<typeof t>[0])}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className={selectCls}
          aria-label={t("fields.status")}
        >
          <option value="">{t("filterAllStatuses")}</option>
          {(["valid", "expiring_soon", "expired"] as const).map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}` as Parameters<typeof t>[0])}
            </option>
          ))}
        </select>
      </div>

      {sorted.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{t("noResults")}</p>
      ) : (
        <>
          {/* ── Tabulka (sm+) ──────────────────────────── */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {(
                    [
                      ["property", t("fields.property")],
                      ["type", t("fields.type")],
                      ["lastDate", t("fields.lastDate")],
                      ["nextDueDate", t("fields.nextDueDate")],
                      ["status", t("fields.status")],
                      ["provider", t("fields.provider")],
                    ] as [SortField, string][]
                  ).map(([field, label]) => (
                    <th
                      key={field}
                      className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap hover:text-foreground"
                      onClick={() => toggleSort(field)}
                    >
                      <span className="inline-flex items-center">
                        {label}
                        <SortIcon field={field} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((insp) => {
                  const styles = STATUS_STYLES[insp.status];
                  return (
                    <tr key={insp.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 max-w-[160px]">
                        <span className="truncate block font-medium">
                          {propName(insp.propertyId)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {t(`type.${insp.type}` as Parameters<typeof t>[0])}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(insp.lastDate)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={
                            insp.status === "expired" ? "text-red-600 font-medium" : "text-muted-foreground"
                          }
                        >
                          {formatDate(insp.nextDueDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={cn("h-2 w-2 rounded-full shrink-0", styles.dot)} />
                          <span
                            className={cn(
                              "text-xs font-medium px-1.5 py-0.5 rounded border",
                              styles.badge
                            )}
                          >
                            {t(`status.${insp.status}` as Parameters<typeof t>[0])}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {insp.provider ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Card view (mobil) ──────────────────────── */}
          <div className="sm:hidden space-y-2">
            {sorted.map((insp) => {
              const styles = STATUS_STYLES[insp.status];
              return (
                <div key={insp.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{propName(insp.propertyId)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t(`type.${insp.type}` as Parameters<typeof t>[0])}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded border whitespace-nowrap",
                        styles.badge
                      )}
                    >
                      {t(`status.${insp.status}` as Parameters<typeof t>[0])}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>
                      <span className="opacity-70">{t("fields.lastDate")}: </span>
                      {formatDate(insp.lastDate)}
                    </span>
                    <span>
                      <span className="opacity-70">{t("fields.nextDueDate")}: </span>
                      <span className={insp.status === "expired" ? "text-red-600 font-medium" : ""}>
                        {formatDate(insp.nextDueDate)}
                      </span>
                    </span>
                  </div>
                  {insp.provider && (
                    <p className="text-xs text-muted-foreground">{insp.provider}</p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground text-right">
        {sorted.length} / {inspections.length}
      </p>
    </div>
  );
}
