"use server";

// Zápisy do Firestore — jen přihlášený správce. Chyby vrací jako klíče překladů (forms.errors.*).
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import { getSession } from "@/lib/auth/session";
import type { Landlord, Property, Tenant, UtilityKind, UtilitySettlement } from "@/lib/types";
import { COLLECTIONS, getDataset, LANDLORD_DOC } from "./store";
import { propertyById, tenantById } from "./selectors";
import { annualLeaseRent, monthlyFromAnnual } from "@/lib/rent";

export type FormState = { error?: string; saved?: boolean } | undefined;

class FormError extends Error {}

async function assertAdmin() {
  if (!isFirebaseConfigured()) throw new FormError("demo");
  const session = await getSession();
  if (session?.role !== "admin") throw new FormError("forbidden");
}

// ── čtení polí formuláře ─────────────────────────────────────────────────────
function text(fd: FormData, name: string): string | undefined {
  const v = String(fd.get(name) ?? "").trim();
  return v || undefined;
}

function required(fd: FormData, name: string): string {
  const v = text(fd, name);
  if (!v) throw new FormError("required");
  return v;
}

// "16 275,12" i "16275.12" → 16275.12
function num(fd: FormData, name: string): number | undefined {
  const v = text(fd, name);
  if (v === undefined) return undefined;
  const n = Number(v.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(n)) throw new FormError("number");
  return n;
}

function requiredNum(fd: FormData, name: string): number {
  const n = num(fd, name);
  if (n === undefined) throw new FormError("required");
  return n;
}

function date(fd: FormData, name: string): string | undefined {
  const v = text(fd, name);
  if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new FormError("date");
  return v;
}

function requiredDate(fd: FormData, name: string): string {
  const v = date(fd, name);
  if (!v) throw new FormError("required");
  return v;
}

function oneOf<T extends string>(fd: FormData, name: string, allowed: readonly T[]): T {
  const v = text(fd, name);
  if (!v || !allowed.includes(v as T)) throw new FormError("required");
  return v as T;
}

async function guard(fn: () => Promise<FormState>): Promise<FormState> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof FormError) return { error: err.message };
    throw err; // redirect() a neočekávané chyby
  }
}

const now = () => new Date().toISOString();

// ── nemovitost ───────────────────────────────────────────────────────────────
export async function createProperty(locale: string, _prev: FormState, fd: FormData): Promise<FormState> {
  let id = "";
  const result = await guard(async () => {
    await assertAdmin();
    const property: Omit<Property, "id"> = {
      type: oneOf(fd, "type", ["house", "land"] as const),
      name: required(fd, "name"),
      address: text(fd, "address"),
      cadastralNumber: text(fd, "cadastralNumber"),
      parcelNumbers: text(fd, "parcelNumbers")?.split(",").map((p) => p.trim()).filter(Boolean),
      ownership: oneOf(fd, "ownership", ["owned", "rented"] as const),
      area: num(fd, "area"),
      description: text(fd, "description"),
      notes: text(fd, "notes"),
      createdAt: now(),
      updatedAt: now(),
    };
    id = (await adminDb().collection(COLLECTIONS.properties).add(property)).id;
    return undefined;
  });
  if (result?.error) return result;
  revalidatePath(`/${locale}`, "layout");
  redirect(`/${locale}/properties/${id}`);
}

// ── nájemník ─────────────────────────────────────────────────────────────────
// Údaje nájemníka z formuláře (nový i úprava)
function parseTenant(fd: FormData, propertyId: string): Omit<Tenant, "id"> {
  const type = oneOf(fd, "type", ["tenant", "lessee"] as const);
  const advances: NonNullable<Tenant["advances"]> = {
    water: num(fd, "advanceWater"),
    gas: num(fd, "advanceGas"),
    electricity: num(fd, "advanceElectricity"),
  };

  // Pacht: roční pachtovné zadané přímo, nebo spočtené z výměry a ceny za hektar
  const leaseArea = type === "lessee" ? num(fd, "leaseArea") : undefined;
  const pricePerHectare = type === "lessee" ? num(fd, "pricePerHectare") : undefined;
  const annualRent =
    type === "lessee"
      ? (num(fd, "annualRent") ??
        (leaseArea !== undefined && pricePerHectare !== undefined
          ? annualLeaseRent(leaseArea, pricePerHectare)
          : undefined))
      : undefined;
  if (type === "lessee" && annualRent === undefined) throw new FormError("required");

  return {
    propertyId,
    name: required(fd, "name"),
    type,
    phone: text(fd, "phone"),
    email: text(fd, "email")?.toLowerCase(),
    contractStart: requiredDate(fd, "contractStart"),
    contractEnd: date(fd, "contractEnd"),
    monthlyRent: annualRent !== undefined ? monthlyFromAnnual(annualRent) : requiredNum(fd, "monthlyRent"),
    annualRent,
    leaseArea,
    pricePerHectare,
    deposit: num(fd, "deposit"),
    advances:
      type === "tenant" && Object.values(advances).some((v) => v !== undefined) ? advances : undefined,
    notes: text(fd, "notes"),
  };
}

export async function createTenant(
  locale: string,
  propertyId: string,
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  const result = await guard(async () => {
    await assertAdmin();
    if (!propertyById(await getDataset(), propertyId)) throw new FormError("notFound");
    await adminDb().collection(COLLECTIONS.tenants).add(parseTenant(fd, propertyId));
    return undefined;
  });
  if (result?.error) return result;
  revalidatePath(`/${locale}`, "layout");
  redirect(`/${locale}/properties/${propertyId}?tab=tenants`);
}

export async function updateTenant(
  locale: string,
  propertyId: string,
  tenantId: string,
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  const result = await guard(async () => {
    await assertAdmin();
    if (tenantById(await getDataset(), tenantId)?.propertyId !== propertyId) throw new FormError("notFound");
    // Celý záznam se přepíše — pole, která formulář už nevyplňuje (např. pacht → nájem), zmizí
    await adminDb().collection(COLLECTIONS.tenants).doc(tenantId).set(parseTenant(fd, propertyId));
    return undefined;
  });
  if (result?.error) return result;
  revalidatePath(`/${locale}`, "layout");
  redirect(`/${locale}/properties/${propertyId}?tab=tenants`);
}

// ── vyúčtování záloh ─────────────────────────────────────────────────────────
export async function createSettlement(
  locale: string,
  propertyId: string,
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  const result = await guard(async () => {
    await assertAdmin();
    const ds = await getDataset();
    const tenantId = required(fd, "tenantId");
    if (tenantById(ds, tenantId)?.propertyId !== propertyId) throw new FormError("notFound");

    const meterStart = requiredNum(fd, "meterStart");
    const meterEnd = requiredNum(fd, "meterEnd");
    const totalConsumption = requiredNum(fd, "totalConsumption");
    if (meterEnd < meterStart) throw new FormError("meterOrder");
    if (totalConsumption <= 0 || meterEnd - meterStart > totalConsumption) throw new FormError("consumption");

    const settlement: Omit<UtilitySettlement, "id"> = {
      propertyId,
      tenantId,
      utility: oneOf(fd, "utility", ["water", "gas", "electricity"] as readonly UtilityKind[]),
      periodFrom: requiredDate(fd, "periodFrom"),
      periodTo: requiredDate(fd, "periodTo"),
      months: requiredNum(fd, "months"),
      supplier: required(fd, "supplier"),
      invoiceNumber: required(fd, "invoiceNumber"),
      totalCost: requiredNum(fd, "totalCost"),
      totalConsumption,
      meterStart,
      meterEnd,
      monthlyAdvance: requiredNum(fd, "monthlyAdvance"),
      issuedDate: requiredDate(fd, "issuedDate"),
      dueDate: requiredDate(fd, "dueDate"),
      variableSymbol: required(fd, "variableSymbol"),
      newMonthlyAdvance: num(fd, "newMonthlyAdvance"),
      newAdvanceFrom: date(fd, "newAdvanceFrom"),
    };
    if (settlement.months < 1) throw new FormError("number");
    await adminDb().collection(COLLECTIONS.settlements).add(settlement);
    return undefined;
  });
  if (result?.error) return result;
  revalidatePath(`/${locale}`, "layout");
  redirect(`/${locale}/properties/${propertyId}?tab=tenants`);
}

// ── pronajímatel (kontakt a účet v portálu nájemníka) ───────────────────────
export async function saveLandlord(locale: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const result = await guard(async () => {
    await assertAdmin();
    const landlord: Landlord = {
      name: required(fd, "name"),
      email: required(fd, "email"),
      phone: text(fd, "phone"),
      bankAccount: required(fd, "bankAccount"),
    };
    await adminDb().doc(LANDLORD_DOC).set(landlord);
    return { saved: true };
  });
  if (!result?.error) revalidatePath(`/${locale}`, "layout");
  return result;
}
