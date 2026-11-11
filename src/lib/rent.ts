// Nájemné a pachtovné
import type { Tenant } from "./types";

export const M2_PER_HECTARE = 10_000;

const round2 = (x: number) => Math.round(x * 100) / 100;

// Roční pachtovné z výměry (m²) a ceny za hektar
export function annualLeaseRent(leaseArea: number, pricePerHectare: number): number {
  return round2((leaseArea / M2_PER_HECTARE) * pricePerHectare);
}

// Roční částka: u pachtu uložené roční pachtovné, jinak 12× měsíční nájem
export function annualRentOf(t: Pick<Tenant, "annualRent" | "monthlyRent">): number {
  return t.annualRent ?? round2(t.monthlyRent * 12);
}

export const monthlyFromAnnual = (annual: number) => round2(annual / 12);
