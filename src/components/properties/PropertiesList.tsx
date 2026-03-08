"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search, Building2, Sprout, X } from "lucide-react";
import { cn } from "@/lib/utils";
import PropertyCard, { type PropertyCardData } from "./PropertyCard";

type TypeFilter = "all" | "house" | "land";
type OwnershipFilter = "all" | "owned" | "rented";

interface PropertiesListProps {
  locale: string;
  items: PropertyCardData[];
}

// Jednoduchá toggle-group tlačítka (nepotřebujeme radix pro takto jednoduché použití)
function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export default function PropertiesList({ locale, items }: PropertiesListProps) {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const { property } = item;
      if (typeFilter !== "all" && property.type !== typeFilter) return false;
      if (ownershipFilter !== "all" && property.ownership !== ownershipFilter) return false;
      if (q) {
        const haystack = [property.name, property.address ?? ""]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [items, typeFilter, ownershipFilter, search]);

  const hasActiveFilter =
    typeFilter !== "all" || ownershipFilter !== "all" || search !== "";

  function resetFilters() {
    setTypeFilter("all");
    setOwnershipFilter("all");
    setSearch("");
  }

  return (
    <div className="space-y-4">
      {/* Filtrovací panel */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Vyhledávací input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        {/* Typ */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <FilterButton
            active={typeFilter === "all"}
            onClick={() => setTypeFilter("all")}
          >
            {tCommon("all")}
          </FilterButton>
          <FilterButton
            active={typeFilter === "house"}
            onClick={() => setTypeFilter("house")}
          >
            <Building2 className="h-3.5 w-3.5" />
            {t("type.house")}
          </FilterButton>
          <FilterButton
            active={typeFilter === "land"}
            onClick={() => setTypeFilter("land")}
          >
            <Sprout className="h-3.5 w-3.5" />
            {t("type.land")}
          </FilterButton>
        </div>

        {/* Vlastnictví */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <FilterButton
            active={ownershipFilter === "all"}
            onClick={() => setOwnershipFilter("all")}
          >
            {tCommon("all")}
          </FilterButton>
          <FilterButton
            active={ownershipFilter === "owned"}
            onClick={() => setOwnershipFilter("owned")}
          >
            {t("ownership.owned")}
          </FilterButton>
          <FilterButton
            active={ownershipFilter === "rented"}
            onClick={() => setOwnershipFilter("rented")}
          >
            {t("ownership.rented")}
          </FilterButton>
        </div>

        {/* Reset */}
        {hasActiveFilter && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            {t("resetFilters")}
          </button>
        )}
      </div>

      {/* Počet výsledků */}
      <p className="text-sm text-muted-foreground">
        {filtered.length === items.length
          ? t("propertyCount", { count: items.length })
          : `${filtered.length} / ${items.length}`}
      </p>

      {/* Grid / prázdný stav */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-sm">{t("noResults")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("noResultsHint")}</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            {t("resetFilters")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <PropertyCard key={item.property.id} data={item} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
