// Výběry nad načtenými daty — čisté funkce, stejné pro demo i ostrá data
import type {
  Contract,
  Inspection,
  Insurance,
  Landlord,
  Payment,
  Property,
  PropertyDocument,
  Tenant,
  UtilitySettlement,
} from "@/lib/types";
import { getToday, INSPECTION_EXPIRING_THRESHOLD_DAYS } from "@/lib/constants";

export interface Dataset {
  properties: Property[];
  tenants: Tenant[];
  payments: Payment[];
  inspections: Inspection[];
  insurances: Insurance[];
  contracts: Contract[];
  documents: PropertyDocument[];
  settlements: UtilitySettlement[];
  landlord: Landlord;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const byProperty = <T extends { propertyId: string }>(items: T[], propertyId: string) =>
  items.filter((i) => i.propertyId === propertyId);

export const propertyById = (ds: Dataset, id: string) => ds.properties.find((p) => p.id === id);
export const tenantById = (ds: Dataset, id: string) => ds.tenants.find((t) => t.id === id);
export const tenantsByProperty = (ds: Dataset, id: string) => byProperty(ds.tenants, id);
export const paymentsByProperty = (ds: Dataset, id: string) => byProperty(ds.payments, id);
export const inspectionsByProperty = (ds: Dataset, id: string) => byProperty(ds.inspections, id);
export const insurancesByProperty = (ds: Dataset, id: string) => byProperty(ds.insurances, id);
export const contractsByProperty = (ds: Dataset, id: string) => byProperty(ds.contracts, id);

export const documentsByProperty = (ds: Dataset, id: string) =>
  byProperty(ds.documents, id).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

// Vyúčtování nejnovější první
export const settlementsByProperty = (ds: Dataset, id: string) =>
  byProperty(ds.settlements, id).sort((a, b) => b.periodTo.localeCompare(a.periodTo));

export const settlementsByTenant = (ds: Dataset, tenantId: string) =>
  ds.settlements
    .filter((s) => s.tenantId === tenantId)
    .sort((a, b) => b.periodTo.localeCompare(a.periodTo));

export const paymentsByTenant = (ds: Dataset, tenantId: string) =>
  ds.payments
    .filter((p) => p.tenantId === tenantId)
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));

// Stav revize podle termínu příští kontroly
export function inspectionStatus(nextDueDate: string): Inspection["status"] {
  const now = getToday();
  const due = new Date(nextDueDate);
  if (due < now) return "expired";
  if (due.getTime() - now.getTime() <= INSPECTION_EXPIRING_THRESHOLD_DAYS * DAY_MS) return "expiring_soon";
  return "valid";
}

// Nezaplacená platba po splatnosti je „po splatnosti“
export function paymentStatus(p: Pick<Payment, "status" | "dueDate" | "paidDate">): Payment["status"] {
  if (p.paidDate || p.status === "paid") return "paid";
  return new Date(p.dueDate) < getToday() ? "overdue" : "pending";
}

// Nadcházející události: revize, smlouvy a pojistky končící do `withinDays` dní
export interface UpcomingEvent {
  type: "inspection" | "contract" | "insurance";
  label: string;
  propertyId: string;
  propertyName: string;
  dueDate: string;
  status: "expiring_soon" | "expired";
  referenceId: string;
}

export function upcomingEvents(ds: Dataset, withinDays = 90): UpcomingEvent[] {
  const now = getToday();
  const threshold = new Date(now.getTime() + withinDays * DAY_MS);
  const sources: { type: UpcomingEvent["type"]; label: string; propertyId: string; dueDate?: string; id: string }[] = [
    ...ds.inspections.map((i) => ({ type: "inspection" as const, label: i.type, propertyId: i.propertyId, dueDate: i.nextDueDate, id: i.id })),
    ...ds.contracts.map((c) => ({ type: "contract" as const, label: c.type, propertyId: c.propertyId, dueDate: c.endDate, id: c.id })),
    ...ds.insurances.map((i) => ({ type: "insurance" as const, label: i.type, propertyId: i.propertyId, dueDate: i.endDate, id: i.id })),
  ];

  return sources
    .filter((s): s is typeof s & { dueDate: string } => !!s.dueDate && new Date(s.dueDate) <= threshold)
    .map((s) => ({
      type: s.type,
      label: s.label,
      propertyId: s.propertyId,
      propertyName: propertyById(ds, s.propertyId)?.name ?? s.propertyId,
      dueDate: s.dueDate,
      status: new Date(s.dueDate) < now ? ("expired" as const) : ("expiring_soon" as const),
      referenceId: s.id,
    }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

// Počet upozornění v horní liště: platby po splatnosti + prošlé revize
export const notificationCount = (ds: Dataset) =>
  ds.payments.filter((p) => p.status === "overdue").length +
  ds.inspections.filter((i) => i.status === "expired").length;
