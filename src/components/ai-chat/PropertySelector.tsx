"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Search, Building2, Sprout, Check } from "lucide-react";
import { useAIChatContext } from "./AIChatProvider";
import { mockProperties } from "@/lib/mock-data";

export default function PropertySelector() {
  const t = useTranslations("aiChat");
  const { closeSelector, confirmMatch, matchedPropertyId } = useAIChatContext();
  const [query, setQuery] = useState("");

  const filtered = mockProperties.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.address ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="absolute inset-0 bg-white rounded-2xl z-10 flex flex-col">
      {/* Záhlaví */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <button
          onClick={closeSelector}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Zpět"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-gray-900">{t("selectProperty")}</span>
      </div>

      {/* Vyhledávání */}
      <div className="px-4 py-2.5 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search")}
            autoFocus
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Seznam nemovitostí */}
      <div className="flex-1 overflow-y-auto py-2">
        {filtered.map((property) => {
          const isSelected = property.id === matchedPropertyId;
          const Icon = property.type === "house" ? Building2 : Sprout;
          return (
            <button
              key={property.id}
              onClick={() => confirmMatch(property.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{property.name}</p>
                {property.address && (
                  <p className="text-xs text-gray-400 truncate">{property.address}</p>
                )}
              </div>
              {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">{t("search")}</p>
        )}
      </div>
    </div>
  );
}
