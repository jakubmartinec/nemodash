"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Building2,
  Sprout,
  MapPin,
  FileText,
  Ruler,
  Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Property, Tenant, Payment, Inspection, Insurance, Contract, PropertyDocument } from "@/lib/types";
import OverviewTab from "./detail/OverviewTab";
import TenantsTab from "./detail/TenantsTab";
import PaymentsTab from "./detail/PaymentsTab";
import InspectionsTab from "./detail/InspectionsTab";
import InsuranceTab from "./detail/InsuranceTab";
import DocumentsTab from "./detail/DocumentsTab";

export interface PropertyDetailProps {
  locale: string;
  property: Property;
  tenants: Tenant[];
  payments: Payment[];
  inspections: Inspection[];
  insurances: Insurance[];
  contracts: Contract[];
  documents: PropertyDocument[];
}

type TabKey = "overview" | "tenants" | "payments" | "inspections" | "insurance" | "documents";

const TABS: TabKey[] = [
  "overview",
  "tenants",
  "payments",
  "inspections",
  "insurance",
  "documents",
];

export default function PropertyDetail({
  locale,
  property,
  tenants,
  payments,
  inspections,
  insurances,
  contracts,
  documents,
}: PropertyDetailProps) {
  const t = useTranslations("properties");
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get("tab") ?? "overview";
  const activeTab: TabKey = (TABS.includes(rawTab as TabKey) ? rawTab : "overview") as TabKey;

  const setTab = useCallback(
    (tab: TabKey) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const Icon = property.type === "house" ? Building2 : Sprout;

  // Záložka pro nájemníky — label závisí na typu nemovitosti
  function tabLabel(key: TabKey): string {
    if (key === "tenants") {
      return property.type === "house"
        ? t("tabs.tenants")
        : t("tabs.tenants"); // pachtýři i nájemníci sdílí záložku
    }
    return t(`tabs.${key}` as Parameters<typeof t>[0]);
  }

  return (
    <div className="space-y-6">
      {/* ── Hlavička ─────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Ikona + název */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="shrink-0 h-10 w-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground mt-0.5">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {t(`type.${property.type}`)}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded",
                    property.ownership === "owned"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-orange-50 text-orange-700"
                  )}
                >
                  {t(`ownership.${property.ownership}`)}
                </span>
              </div>
              <h1 className="text-xl font-bold leading-tight">{property.name}</h1>
            </div>
          </div>

          {/* Tlačítko Upravit */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
            {t("editButton")}
          </button>
        </div>

        {/* Meta info */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
          {property.address && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {property.address}
            </div>
          )}
          {property.cadastralNumber && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              LV {property.cadastralNumber}
              {property.parcelNumbers?.length ? (
                <span className="text-muted-foreground/60">
                  · {property.parcelNumbers.join(", ")}
                </span>
              ) : null}
            </div>
          )}
          {property.area && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Ruler className="h-3.5 w-3.5 shrink-0" />
              {new Intl.NumberFormat("cs-CZ").format(property.area)} {t("areaUnit")}
            </div>
          )}
        </div>

        {property.description && (
          <p className="mt-3 text-sm text-muted-foreground border-t border-border pt-3">
            {property.description}
          </p>
        )}
      </div>

      {/* ── Záložky ──────────────────────────────────────── */}
      <div>
        {/* Tab bar */}
        <div className="flex gap-0.5 border-b border-border overflow-x-auto pb-px">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTab(tab)}
              className={cn(
                "px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
                activeTab === tab
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
              )}
            >
              {tabLabel(tab)}
            </button>
          ))}
        </div>

        {/* Tab obsah */}
        <div className="pt-5">
          {activeTab === "overview" && (
            <OverviewTab
              payments={payments}
              inspections={inspections}
              insurances={insurances}
              contracts={contracts}
            />
          )}
          {activeTab === "tenants" && (
            <TenantsTab tenants={tenants} contracts={contracts} />
          )}
          {activeTab === "payments" && <PaymentsTab payments={payments} />}
          {activeTab === "inspections" && <InspectionsTab inspections={inspections} />}
          {activeTab === "insurance" && <InsuranceTab insurances={insurances} />}
          {activeTab === "documents" && <DocumentsTab documents={documents} />}
        </div>
      </div>
    </div>
  );
}
