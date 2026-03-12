// Nemovitost
export interface Property {
  id: string;
  type: "house" | "land";
  name: string; // "Dům na Kolárově", "Pozemek u lesa"
  address?: string;
  cadastralNumber?: string; // číslo LV
  parcelNumbers?: string[]; // čísla parcel
  ownership: "owned" | "rented"; // vlastní vs. v nájmu od někoho
  area?: number; // m²
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Nájemník / Pachtýř
export interface Tenant {
  id: string;
  propertyId: string;
  name: string;
  email?: string;
  phone?: string;
  type: "tenant" | "lessee"; // nájemník vs. pachtýř
  contractStart: string;
  contractEnd?: string;
  monthlyRent: number;
  deposit?: number;
  notes?: string;
  advances?: {
    water?: number;        // měsíční záloha na vodu v Kč
    gas?: number;          // měsíční záloha na plyn v Kč
    electricity?: number;  // měsíční záloha na elektřinu v Kč
  };
}

// Typy plateb
export type PaymentType =
  | "rent"
  | "lease"
  | "energy_electricity"
  | "energy_gas"
  | "energy_water"
  | "waste"
  | "tax"
  | "insurance"
  | "maintenance"
  | "other";

export type PaymentDirection = "incoming" | "outgoing"; // příjem vs. výdaj
export type PaymentStatus = "pending" | "paid" | "overdue";

// Platba
export interface Payment {
  id: string;
  propertyId: string;
  tenantId?: string;
  type: PaymentType;
  direction: PaymentDirection;
  amount: number;
  currency: "CZK";
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  period?: string; // "2026-03", "2026"
  notes?: string;
}

// Typy revizí
export type InspectionType =
  | "chimney"
  | "gas_boiler"
  | "electrical"
  | "fire_alarm"
  | "fire_extinguisher"
  | "elevator"
  | "other";

// Revize
export interface Inspection {
  id: string;
  propertyId: string;
  type: InspectionType;
  lastDate: string;
  nextDueDate: string;
  status: "valid" | "expiring_soon" | "expired";
  provider?: string;
  cost?: number;
  notes?: string;
  documentUrl?: string;
}

// Pojištění
export interface Insurance {
  id: string;
  propertyId: string;
  provider: string;
  policyNumber: string;
  type: "property" | "liability" | "natural_disaster" | "other";
  startDate: string;
  endDate: string;
  annualPremium: number;
  notes?: string;
}

// Smlouva
export interface Contract {
  id: string;
  propertyId: string;
  tenantId?: string;
  type: "rental" | "lease" | "purchase" | "other";
  startDate: string;
  endDate?: string;
  monthlyAmount?: number;
  documentUrl?: string;
  notes?: string;
}
