// Mock data pro vývoj — bude nahrazeno Firebase Firestore
// Dnešní datum: 2026-03-08

import { Property, Tenant, Payment, Inspection, Insurance, Contract } from "./types";

// ─── NEMOVITOSTI ────────────────────────────────────────────────────────────

export const mockProperties: Property[] = [
  // Domy
  {
    id: "prop-1",
    type: "house",
    name: "Dům Nerudova 435",
    address: "Nerudova 435, 473 01 Nový Bor",
    cadastralNumber: "LV 1204",
    ownership: "owned",
    area: 187,
    description: "Rodinný dům se zahradou, 4+1, dvě bytové jednotky",
    createdAt: "2024-01-15",
    updatedAt: "2025-11-20",
  },
  {
    id: "prop-2",
    type: "house",
    name: "Dům Besední 25",
    address: "Besední 25, 341 92 Kašperské Hory",
    cadastralNumber: "LV 876",
    ownership: "owned",
    area: 142,
    description: "Starší dům v centru, 3+1, po rekonstrukci",
    createdAt: "2024-03-01",
    updatedAt: "2025-08-10",
  },
  {
    id: "prop-3",
    type: "house",
    name: "Dům Strašín 38",
    address: "Strašín 38, 342 01 Strašín",
    cadastralNumber: "LV 312",
    ownership: "owned",
    area: 210,
    description: "Venkovský dům se stodolou a pozemkem",
    createdAt: "2023-06-20",
    updatedAt: "2025-12-01",
  },
  {
    id: "prop-4",
    type: "house",
    name: "Dům Kašperskohorská 126",
    address: "Kašperskohorská 126, 341 92 Rejštejn",
    cadastralNumber: "LV 541",
    ownership: "owned",
    area: 165,
    description: "Řadový dům, 2+1, vhodný k pronájmu",
    createdAt: "2024-07-05",
    updatedAt: "2026-01-15",
  },
  // Pozemky
  {
    id: "prop-5",
    type: "land",
    name: "Pozemek Nový Bor — pole",
    address: "k.ú. Nový Bor",
    cadastralNumber: "LV 2018",
    parcelNumbers: ["542/3", "542/4", "543/1"],
    ownership: "owned",
    area: 8400,
    description: "Zemědělská půda, orná, pronajato pachtýři",
    createdAt: "2022-05-10",
    updatedAt: "2025-04-01",
  },
  {
    id: "prop-6",
    type: "land",
    name: "Pozemek Strašín — louka",
    address: "k.ú. Strašín",
    cadastralNumber: "LV 78",
    parcelNumbers: ["201/7", "202/1"],
    ownership: "owned",
    area: 3200,
    description: "Trvalý travní porost, pronajato",
    createdAt: "2023-01-20",
    updatedAt: "2025-04-01",
  },
  {
    id: "prop-7",
    type: "land",
    name: "Pozemek Kašperské Hory — les",
    address: "k.ú. Kašperské Hory",
    cadastralNumber: "LV 1103",
    parcelNumbers: ["876/2"],
    ownership: "owned",
    area: 12500,
    description: "Lesní pozemek, hospodaření vlastní",
    createdAt: "2021-09-15",
    updatedAt: "2024-11-05",
  },
  {
    id: "prop-8",
    type: "land",
    name: "Pozemek Rejštejn — zahrada",
    address: "k.ú. Rejštejn",
    cadastralNumber: "LV 289",
    parcelNumbers: ["114/3"],
    ownership: "owned",
    area: 920,
    description: "Zahrada u domu, nevyužívána",
    createdAt: "2024-07-05",
    updatedAt: "2024-07-05",
  },
  {
    id: "prop-9",
    type: "land",
    name: "Pozemek Sušice — pole",
    address: "k.ú. Sušice nad Otavou",
    cadastralNumber: "LV 3341",
    parcelNumbers: ["1205/6", "1205/7"],
    ownership: "rented",
    area: 5800,
    description: "Zemědělský pacht od obce Sušice, orná půda",
    notes: "Pacht od obce, ročně obnovován",
    createdAt: "2023-03-01",
    updatedAt: "2025-03-01",
  },
  {
    id: "prop-10",
    type: "land",
    name: "Pozemek Dlouhá Ves — louka",
    address: "k.ú. Dlouhá Ves u Sušice",
    cadastralNumber: "LV 92",
    parcelNumbers: ["308/2", "309/1"],
    ownership: "rented",
    area: 2100,
    description: "TTP, pacht od soukromého vlastníka",
    createdAt: "2024-02-10",
    updatedAt: "2025-02-10",
  },
];

// ─── NÁJEMNÍCI / PACHTÝŘI ───────────────────────────────────────────────────

export const mockTenants: Tenant[] = [
  // Nájemníci domů
  {
    id: "tenant-1",
    propertyId: "prop-1",
    name: "Jaroslav Novotný",
    email: "j.novotny@email.cz",
    phone: "+420 603 111 222",
    type: "tenant",
    contractStart: "2023-02-01",
    contractEnd: "2026-01-31",
    monthlyRent: 12500,
    deposit: 25000,
    notes: "Dlouhodobý nájemník, platí spolehlivě",
  },
  {
    id: "tenant-2",
    propertyId: "prop-1",
    name: "Petra Horáčková",
    email: "petra.horackova@gmail.com",
    phone: "+420 724 333 444",
    type: "tenant",
    contractStart: "2024-06-01",
    contractEnd: "2026-05-31",
    monthlyRent: 10800,
    deposit: 21600,
    notes: "Druhá bytová jednotka",
  },
  {
    id: "tenant-3",
    propertyId: "prop-2",
    name: "Martin Šimánek",
    email: "simanel@seznam.cz",
    phone: "+420 777 555 666",
    type: "tenant",
    contractStart: "2022-09-01",
    contractEnd: "2025-08-31",
    monthlyRent: 9500,
    deposit: 19000,
    notes: "Smlouva vypršela — jednáme o prodloužení",
  },
  {
    id: "tenant-4",
    propertyId: "prop-3",
    name: "Lucie Brabcová",
    email: "lucie.brabcova@email.cz",
    phone: "+420 608 777 888",
    type: "tenant",
    contractStart: "2024-01-01",
    contractEnd: "2026-12-31",
    monthlyRent: 11200,
    deposit: 22400,
  },
  {
    id: "tenant-5",
    propertyId: "prop-4",
    name: "Tomáš Kovář",
    email: "tomas.kovar@volny.cz",
    phone: "+420 739 999 000",
    type: "tenant",
    contractStart: "2025-01-01",
    contractEnd: "2026-12-31",
    monthlyRent: 8900,
    deposit: 17800,
  },
  {
    id: "tenant-6",
    propertyId: "prop-4",
    name: "Renata Vlčková",
    email: "r.vlckova@centrum.cz",
    type: "tenant",
    contractStart: "2024-09-01",
    monthlyRent: 8500,
    deposit: 17000,
    notes: "Smlouva na dobu neurčitou",
  },
  // Pachtýři pozemků
  {
    id: "tenant-7",
    propertyId: "prop-5",
    name: "Zemědělské družstvo Nový Bor",
    email: "info@zd-novybor.cz",
    phone: "+420 487 500 100",
    type: "lessee",
    contractStart: "2020-04-01",
    contractEnd: "2027-03-31",
    monthlyRent: 1400,
    notes: "Pacht orné půdy, roční platba (16 800 Kč/rok)",
  },
  {
    id: "tenant-8",
    propertyId: "prop-6",
    name: "Pavel Mašek",
    email: "pavel.masek@post.cz",
    phone: "+420 602 200 300",
    type: "lessee",
    contractStart: "2023-04-01",
    contractEnd: "2026-03-31",
    monthlyRent: 420,
    notes: "Drobný zemědělec, kosí louku 2× ročně",
  },
  {
    id: "tenant-9",
    propertyId: "prop-9",
    name: "Agro Sušice s.r.o.",
    email: "agro@susice.cz",
    phone: "+420 376 500 200",
    type: "lessee",
    contractStart: "2023-03-01",
    contractEnd: "2026-02-28",
    monthlyRent: 1950,
    notes: "Pacht od obce, dále podnajímáme Agro Sušice",
  },
];

// ─── PLATBY ─────────────────────────────────────────────────────────────────
// Referenční datum: 2026-03-08
// Pokrýváme 2025-03 až 2026-03

export const mockPayments: Payment[] = [
  // ── prop-1 / tenant-1: nájem 12 500 Kč/měs ──────────────────────────────
  { id: "pay-101", propertyId: "prop-1", tenantId: "tenant-1", type: "rent", direction: "incoming", amount: 12500, currency: "CZK", dueDate: "2025-03-05", paidDate: "2025-03-04", status: "paid", period: "2025-03" },
  { id: "pay-102", propertyId: "prop-1", tenantId: "tenant-1", type: "rent", direction: "incoming", amount: 12500, currency: "CZK", dueDate: "2025-04-05", paidDate: "2025-04-03", status: "paid", period: "2025-04" },
  { id: "pay-103", propertyId: "prop-1", tenantId: "tenant-1", type: "rent", direction: "incoming", amount: 12500, currency: "CZK", dueDate: "2025-05-05", paidDate: "2025-05-06", status: "paid", period: "2025-05" },
  { id: "pay-104", propertyId: "prop-1", tenantId: "tenant-1", type: "rent", direction: "incoming", amount: 12500, currency: "CZK", dueDate: "2025-06-05", paidDate: "2025-06-05", status: "paid", period: "2025-06" },
  { id: "pay-105", propertyId: "prop-1", tenantId: "tenant-1", type: "rent", direction: "incoming", amount: 12500, currency: "CZK", dueDate: "2025-07-05", paidDate: "2025-07-08", status: "paid", period: "2025-07" },
  { id: "pay-106", propertyId: "prop-1", tenantId: "tenant-1", type: "rent", direction: "incoming", amount: 12500, currency: "CZK", dueDate: "2025-08-05", paidDate: "2025-08-04", status: "paid", period: "2025-08" },
  { id: "pay-107", propertyId: "prop-1", tenantId: "tenant-1", type: "rent", direction: "incoming", amount: 12500, currency: "CZK", dueDate: "2025-09-05", paidDate: "2025-09-05", status: "paid", period: "2025-09" },
  { id: "pay-108", propertyId: "prop-1", tenantId: "tenant-1", type: "rent", direction: "incoming", amount: 12500, currency: "CZK", dueDate: "2025-10-05", paidDate: "2025-10-07", status: "paid", period: "2025-10" },
  { id: "pay-109", propertyId: "prop-1", tenantId: "tenant-1", type: "rent", direction: "incoming", amount: 12500, currency: "CZK", dueDate: "2025-11-05", paidDate: "2025-11-04", status: "paid", period: "2025-11" },
  { id: "pay-110", propertyId: "prop-1", tenantId: "tenant-1", type: "rent", direction: "incoming", amount: 12500, currency: "CZK", dueDate: "2025-12-05", paidDate: "2025-12-05", status: "paid", period: "2025-12" },
  { id: "pay-111", propertyId: "prop-1", tenantId: "tenant-1", type: "rent", direction: "incoming", amount: 12500, currency: "CZK", dueDate: "2026-01-05", paidDate: "2026-01-06", status: "paid", period: "2026-01" },
  { id: "pay-112", propertyId: "prop-1", tenantId: "tenant-1", type: "rent", direction: "incoming", amount: 12500, currency: "CZK", dueDate: "2026-02-05", paidDate: "2026-02-05", status: "paid", period: "2026-02" },
  { id: "pay-113", propertyId: "prop-1", tenantId: "tenant-1", type: "rent", direction: "incoming", amount: 12500, currency: "CZK", dueDate: "2026-03-05", status: "overdue", period: "2026-03" },

  // ── prop-1 / tenant-2: nájem 10 800 Kč/měs (od 2024-06) ─────────────────
  { id: "pay-201", propertyId: "prop-1", tenantId: "tenant-2", type: "rent", direction: "incoming", amount: 10800, currency: "CZK", dueDate: "2025-03-05", paidDate: "2025-03-05", status: "paid", period: "2025-03" },
  { id: "pay-202", propertyId: "prop-1", tenantId: "tenant-2", type: "rent", direction: "incoming", amount: 10800, currency: "CZK", dueDate: "2025-04-05", paidDate: "2025-04-04", status: "paid", period: "2025-04" },
  { id: "pay-203", propertyId: "prop-1", tenantId: "tenant-2", type: "rent", direction: "incoming", amount: 10800, currency: "CZK", dueDate: "2025-05-05", paidDate: "2025-05-05", status: "paid", period: "2025-05" },
  { id: "pay-204", propertyId: "prop-1", tenantId: "tenant-2", type: "rent", direction: "incoming", amount: 10800, currency: "CZK", dueDate: "2025-06-05", paidDate: "2025-06-07", status: "paid", period: "2025-06" },
  { id: "pay-205", propertyId: "prop-1", tenantId: "tenant-2", type: "rent", direction: "incoming", amount: 10800, currency: "CZK", dueDate: "2025-07-05", paidDate: "2025-07-05", status: "paid", period: "2025-07" },
  { id: "pay-206", propertyId: "prop-1", tenantId: "tenant-2", type: "rent", direction: "incoming", amount: 10800, currency: "CZK", dueDate: "2025-08-05", paidDate: "2025-08-06", status: "paid", period: "2025-08" },
  { id: "pay-207", propertyId: "prop-1", tenantId: "tenant-2", type: "rent", direction: "incoming", amount: 10800, currency: "CZK", dueDate: "2025-09-05", paidDate: "2025-09-05", status: "paid", period: "2025-09" },
  { id: "pay-208", propertyId: "prop-1", tenantId: "tenant-2", type: "rent", direction: "incoming", amount: 10800, currency: "CZK", dueDate: "2025-10-05", paidDate: "2025-10-04", status: "paid", period: "2025-10" },
  { id: "pay-209", propertyId: "prop-1", tenantId: "tenant-2", type: "rent", direction: "incoming", amount: 10800, currency: "CZK", dueDate: "2025-11-05", status: "overdue", period: "2025-11", notes: "Nájemník nezaplatil, upomínka odeslána" },
  { id: "pay-210", propertyId: "prop-1", tenantId: "tenant-2", type: "rent", direction: "incoming", amount: 10800, currency: "CZK", dueDate: "2025-12-05", status: "overdue", period: "2025-12" },
  { id: "pay-211", propertyId: "prop-1", tenantId: "tenant-2", type: "rent", direction: "incoming", amount: 10800, currency: "CZK", dueDate: "2026-01-05", status: "overdue", period: "2026-01" },
  { id: "pay-212", propertyId: "prop-1", tenantId: "tenant-2", type: "rent", direction: "incoming", amount: 10800, currency: "CZK", dueDate: "2026-02-05", status: "overdue", period: "2026-02" },
  { id: "pay-213", propertyId: "prop-1", tenantId: "tenant-2", type: "rent", direction: "incoming", amount: 10800, currency: "CZK", dueDate: "2026-03-05", status: "overdue", period: "2026-03" },

  // ── prop-2 / tenant-3: nájem 9 500 Kč/měs ───────────────────────────────
  { id: "pay-301", propertyId: "prop-2", tenantId: "tenant-3", type: "rent", direction: "incoming", amount: 9500, currency: "CZK", dueDate: "2025-03-10", paidDate: "2025-03-10", status: "paid", period: "2025-03" },
  { id: "pay-302", propertyId: "prop-2", tenantId: "tenant-3", type: "rent", direction: "incoming", amount: 9500, currency: "CZK", dueDate: "2025-04-10", paidDate: "2025-04-09", status: "paid", period: "2025-04" },
  { id: "pay-303", propertyId: "prop-2", tenantId: "tenant-3", type: "rent", direction: "incoming", amount: 9500, currency: "CZK", dueDate: "2025-05-10", paidDate: "2025-05-12", status: "paid", period: "2025-05" },
  { id: "pay-304", propertyId: "prop-2", tenantId: "tenant-3", type: "rent", direction: "incoming", amount: 9500, currency: "CZK", dueDate: "2025-06-10", paidDate: "2025-06-10", status: "paid", period: "2025-06" },
  { id: "pay-305", propertyId: "prop-2", tenantId: "tenant-3", type: "rent", direction: "incoming", amount: 9500, currency: "CZK", dueDate: "2025-07-10", paidDate: "2025-07-11", status: "paid", period: "2025-07" },
  { id: "pay-306", propertyId: "prop-2", tenantId: "tenant-3", type: "rent", direction: "incoming", amount: 9500, currency: "CZK", dueDate: "2025-08-10", paidDate: "2025-08-10", status: "paid", period: "2025-08" },
  { id: "pay-307", propertyId: "prop-2", tenantId: "tenant-3", type: "rent", direction: "incoming", amount: 9500, currency: "CZK", dueDate: "2025-09-10", paidDate: "2025-09-08", status: "paid", period: "2025-09" },
  { id: "pay-308", propertyId: "prop-2", tenantId: "tenant-3", type: "rent", direction: "incoming", amount: 9500, currency: "CZK", dueDate: "2025-10-10", paidDate: "2025-10-10", status: "paid", period: "2025-10" },
  { id: "pay-309", propertyId: "prop-2", tenantId: "tenant-3", type: "rent", direction: "incoming", amount: 9500, currency: "CZK", dueDate: "2025-11-10", paidDate: "2025-11-14", status: "paid", period: "2025-11" },
  { id: "pay-310", propertyId: "prop-2", tenantId: "tenant-3", type: "rent", direction: "incoming", amount: 9500, currency: "CZK", dueDate: "2025-12-10", paidDate: "2025-12-10", status: "paid", period: "2025-12" },
  { id: "pay-311", propertyId: "prop-2", tenantId: "tenant-3", type: "rent", direction: "incoming", amount: 9500, currency: "CZK", dueDate: "2026-01-10", paidDate: "2026-01-10", status: "paid", period: "2026-01" },
  { id: "pay-312", propertyId: "prop-2", tenantId: "tenant-3", type: "rent", direction: "incoming", amount: 9500, currency: "CZK", dueDate: "2026-02-10", status: "overdue", period: "2026-02", notes: "Smlouva vypršela, nájemník zůstává bez nové smlouvy" },
  { id: "pay-313", propertyId: "prop-2", tenantId: "tenant-3", type: "rent", direction: "incoming", amount: 9500, currency: "CZK", dueDate: "2026-03-10", status: "pending", period: "2026-03" },

  // ── prop-3 / tenant-4: nájem 11 200 Kč/měs ──────────────────────────────
  { id: "pay-401", propertyId: "prop-3", tenantId: "tenant-4", type: "rent", direction: "incoming", amount: 11200, currency: "CZK", dueDate: "2025-03-01", paidDate: "2025-02-28", status: "paid", period: "2025-03" },
  { id: "pay-402", propertyId: "prop-3", tenantId: "tenant-4", type: "rent", direction: "incoming", amount: 11200, currency: "CZK", dueDate: "2025-04-01", paidDate: "2025-04-01", status: "paid", period: "2025-04" },
  { id: "pay-403", propertyId: "prop-3", tenantId: "tenant-4", type: "rent", direction: "incoming", amount: 11200, currency: "CZK", dueDate: "2025-05-01", paidDate: "2025-05-02", status: "paid", period: "2025-05" },
  { id: "pay-404", propertyId: "prop-3", tenantId: "tenant-4", type: "rent", direction: "incoming", amount: 11200, currency: "CZK", dueDate: "2025-06-01", paidDate: "2025-06-01", status: "paid", period: "2025-06" },
  { id: "pay-405", propertyId: "prop-3", tenantId: "tenant-4", type: "rent", direction: "incoming", amount: 11200, currency: "CZK", dueDate: "2025-07-01", paidDate: "2025-07-01", status: "paid", period: "2025-07" },
  { id: "pay-406", propertyId: "prop-3", tenantId: "tenant-4", type: "rent", direction: "incoming", amount: 11200, currency: "CZK", dueDate: "2025-08-01", paidDate: "2025-08-01", status: "paid", period: "2025-08" },
  { id: "pay-407", propertyId: "prop-3", tenantId: "tenant-4", type: "rent", direction: "incoming", amount: 11200, currency: "CZK", dueDate: "2025-09-01", paidDate: "2025-09-03", status: "paid", period: "2025-09" },
  { id: "pay-408", propertyId: "prop-3", tenantId: "tenant-4", type: "rent", direction: "incoming", amount: 11200, currency: "CZK", dueDate: "2025-10-01", paidDate: "2025-10-01", status: "paid", period: "2025-10" },
  { id: "pay-409", propertyId: "prop-3", tenantId: "tenant-4", type: "rent", direction: "incoming", amount: 11200, currency: "CZK", dueDate: "2025-11-01", paidDate: "2025-11-01", status: "paid", period: "2025-11" },
  { id: "pay-410", propertyId: "prop-3", tenantId: "tenant-4", type: "rent", direction: "incoming", amount: 11200, currency: "CZK", dueDate: "2025-12-01", paidDate: "2025-12-01", status: "paid", period: "2025-12" },
  { id: "pay-411", propertyId: "prop-3", tenantId: "tenant-4", type: "rent", direction: "incoming", amount: 11200, currency: "CZK", dueDate: "2026-01-01", paidDate: "2026-01-02", status: "paid", period: "2026-01" },
  { id: "pay-412", propertyId: "prop-3", tenantId: "tenant-4", type: "rent", direction: "incoming", amount: 11200, currency: "CZK", dueDate: "2026-02-01", paidDate: "2026-02-01", status: "paid", period: "2026-02" },
  { id: "pay-413", propertyId: "prop-3", tenantId: "tenant-4", type: "rent", direction: "incoming", amount: 11200, currency: "CZK", dueDate: "2026-03-01", status: "pending", period: "2026-03" },

  // ── prop-4 / tenant-5 + tenant-6: nájmy ─────────────────────────────────
  { id: "pay-501", propertyId: "prop-4", tenantId: "tenant-5", type: "rent", direction: "incoming", amount: 8900, currency: "CZK", dueDate: "2025-03-15", paidDate: "2025-03-14", status: "paid", period: "2025-03" },
  { id: "pay-502", propertyId: "prop-4", tenantId: "tenant-5", type: "rent", direction: "incoming", amount: 8900, currency: "CZK", dueDate: "2025-06-15", paidDate: "2025-06-15", status: "paid", period: "2025-06" },
  { id: "pay-503", propertyId: "prop-4", tenantId: "tenant-5", type: "rent", direction: "incoming", amount: 8900, currency: "CZK", dueDate: "2025-09-15", paidDate: "2025-09-15", status: "paid", period: "2025-09" },
  { id: "pay-504", propertyId: "prop-4", tenantId: "tenant-5", type: "rent", direction: "incoming", amount: 8900, currency: "CZK", dueDate: "2025-12-15", paidDate: "2025-12-16", status: "paid", period: "2025-12" },
  { id: "pay-505", propertyId: "prop-4", tenantId: "tenant-5", type: "rent", direction: "incoming", amount: 8900, currency: "CZK", dueDate: "2026-03-15", status: "pending", period: "2026-03" },
  { id: "pay-506", propertyId: "prop-4", tenantId: "tenant-6", type: "rent", direction: "incoming", amount: 8500, currency: "CZK", dueDate: "2025-10-01", paidDate: "2025-10-01", status: "paid", period: "2025-10" },
  { id: "pay-507", propertyId: "prop-4", tenantId: "tenant-6", type: "rent", direction: "incoming", amount: 8500, currency: "CZK", dueDate: "2025-11-01", paidDate: "2025-11-03", status: "paid", period: "2025-11" },
  { id: "pay-508", propertyId: "prop-4", tenantId: "tenant-6", type: "rent", direction: "incoming", amount: 8500, currency: "CZK", dueDate: "2025-12-01", paidDate: "2025-12-01", status: "paid", period: "2025-12" },
  { id: "pay-509", propertyId: "prop-4", tenantId: "tenant-6", type: "rent", direction: "incoming", amount: 8500, currency: "CZK", dueDate: "2026-01-01", paidDate: "2026-01-02", status: "paid", period: "2026-01" },
  { id: "pay-510", propertyId: "prop-4", tenantId: "tenant-6", type: "rent", direction: "incoming", amount: 8500, currency: "CZK", dueDate: "2026-02-01", paidDate: "2026-02-01", status: "paid", period: "2026-02" },
  { id: "pay-511", propertyId: "prop-4", tenantId: "tenant-6", type: "rent", direction: "incoming", amount: 8500, currency: "CZK", dueDate: "2026-03-01", status: "pending", period: "2026-03" },

  // ── Pachty pozemků ───────────────────────────────────────────────────────
  { id: "pay-601", propertyId: "prop-5", tenantId: "tenant-7", type: "lease", direction: "incoming", amount: 16800, currency: "CZK", dueDate: "2025-04-01", paidDate: "2025-03-28", status: "paid", period: "2025", notes: "Roční pacht 2025" },
  { id: "pay-602", propertyId: "prop-5", tenantId: "tenant-7", type: "lease", direction: "incoming", amount: 16800, currency: "CZK", dueDate: "2026-04-01", status: "pending", period: "2026", notes: "Roční pacht 2026" },
  { id: "pay-603", propertyId: "prop-6", tenantId: "tenant-8", type: "lease", direction: "incoming", amount: 5040, currency: "CZK", dueDate: "2025-04-01", paidDate: "2025-04-02", status: "paid", period: "2025" },
  { id: "pay-604", propertyId: "prop-6", tenantId: "tenant-8", type: "lease", direction: "incoming", amount: 5040, currency: "CZK", dueDate: "2026-04-01", status: "pending", period: "2026" },
  { id: "pay-605", propertyId: "prop-9", tenantId: "tenant-9", type: "lease", direction: "incoming", amount: 23400, currency: "CZK", dueDate: "2025-03-01", paidDate: "2025-02-25", status: "paid", period: "2025" },
  { id: "pay-606", propertyId: "prop-9", tenantId: "tenant-9", type: "lease", direction: "incoming", amount: 23400, currency: "CZK", dueDate: "2026-03-01", status: "overdue", period: "2026", notes: "Pacht 2026 nebyl zaplacen" },
  // Pacht placený námi (my platíme obci)
  { id: "pay-607", propertyId: "prop-9", type: "lease", direction: "outgoing", amount: 11600, currency: "CZK", dueDate: "2025-03-01", paidDate: "2025-03-01", status: "paid", period: "2025", notes: "Platba pachtu obci Sušice 2025" },
  { id: "pay-608", propertyId: "prop-9", type: "lease", direction: "outgoing", amount: 11600, currency: "CZK", dueDate: "2026-03-01", status: "pending", period: "2026", notes: "Platba pachtu obci Sušice 2026" },
  { id: "pay-609", propertyId: "prop-10", type: "lease", direction: "outgoing", amount: 8400, currency: "CZK", dueDate: "2025-02-01", paidDate: "2025-02-01", status: "paid", period: "2025", notes: "Pacht od soukromého vlastníka 2025" },
  { id: "pay-610", propertyId: "prop-10", type: "lease", direction: "outgoing", amount: 8400, currency: "CZK", dueDate: "2026-02-01", status: "overdue", period: "2026", notes: "Pacht od soukromého vlastníka 2026 — nezaplaceno" },

  // ── Energie prop-1 ───────────────────────────────────────────────────────
  { id: "pay-701", propertyId: "prop-1", type: "energy_electricity", direction: "outgoing", amount: 3200, currency: "CZK", dueDate: "2025-04-20", paidDate: "2025-04-18", status: "paid", period: "2025-Q1", notes: "Vyúčtování elektřiny Q1 2025" },
  { id: "pay-702", propertyId: "prop-1", type: "energy_electricity", direction: "outgoing", amount: 2850, currency: "CZK", dueDate: "2025-07-20", paidDate: "2025-07-19", status: "paid", period: "2025-Q2" },
  { id: "pay-703", propertyId: "prop-1", type: "energy_electricity", direction: "outgoing", amount: 2100, currency: "CZK", dueDate: "2025-10-20", paidDate: "2025-10-20", status: "paid", period: "2025-Q3" },
  { id: "pay-704", propertyId: "prop-1", type: "energy_electricity", direction: "outgoing", amount: 3600, currency: "CZK", dueDate: "2026-01-20", paidDate: "2026-01-18", status: "paid", period: "2025-Q4" },
  { id: "pay-705", propertyId: "prop-1", type: "energy_gas", direction: "outgoing", amount: 8400, currency: "CZK", dueDate: "2025-06-15", paidDate: "2025-06-14", status: "paid", period: "2025", notes: "Roční vyúčtování plynu 2025" },
  { id: "pay-706", propertyId: "prop-1", type: "energy_water", direction: "outgoing", amount: 1800, currency: "CZK", dueDate: "2025-07-01", paidDate: "2025-07-01", status: "paid", period: "2025" },
  { id: "pay-707", propertyId: "prop-1", type: "energy_water", direction: "outgoing", amount: 1900, currency: "CZK", dueDate: "2026-01-15", paidDate: "2026-01-15", status: "paid", period: "2026-H1" },
  { id: "pay-708", propertyId: "prop-1", type: "energy_electricity", direction: "outgoing", amount: 3400, currency: "CZK", dueDate: "2026-04-20", status: "pending", period: "2026-Q1" },

  // ── Energie prop-2 ───────────────────────────────────────────────────────
  { id: "pay-801", propertyId: "prop-2", type: "energy_electricity", direction: "outgoing", amount: 2600, currency: "CZK", dueDate: "2025-04-20", paidDate: "2025-04-20", status: "paid", period: "2025-Q1" },
  { id: "pay-802", propertyId: "prop-2", type: "energy_gas", direction: "outgoing", amount: 6900, currency: "CZK", dueDate: "2025-06-15", paidDate: "2025-06-17", status: "paid", period: "2025" },
  { id: "pay-803", propertyId: "prop-2", type: "energy_electricity", direction: "outgoing", amount: 2400, currency: "CZK", dueDate: "2026-01-20", status: "overdue", period: "2025-Q4" },

  // ── Energie prop-3 ───────────────────────────────────────────────────────
  { id: "pay-901", propertyId: "prop-3", type: "energy_electricity", direction: "outgoing", amount: 2900, currency: "CZK", dueDate: "2025-04-20", paidDate: "2025-04-19", status: "paid", period: "2025-Q1" },
  { id: "pay-902", propertyId: "prop-3", type: "energy_gas", direction: "outgoing", amount: 7800, currency: "CZK", dueDate: "2025-06-15", paidDate: "2025-06-15", status: "paid", period: "2025" },
  { id: "pay-903", propertyId: "prop-3", type: "energy_electricity", direction: "outgoing", amount: 2700, currency: "CZK", dueDate: "2026-01-20", paidDate: "2026-01-20", status: "paid", period: "2025-Q4" },
  { id: "pay-904", propertyId: "prop-3", type: "energy_water", direction: "outgoing", amount: 2100, currency: "CZK", dueDate: "2026-02-01", paidDate: "2026-02-03", status: "paid", period: "2026" },

  // ── Odpady ───────────────────────────────────────────────────────────────
  { id: "pay-1001", propertyId: "prop-1", type: "waste", direction: "outgoing", amount: 2400, currency: "CZK", dueDate: "2025-03-31", paidDate: "2025-03-28", status: "paid", period: "2025", notes: "Poplatek za komunální odpad 2025" },
  { id: "pay-1002", propertyId: "prop-2", type: "waste", direction: "outgoing", amount: 1200, currency: "CZK", dueDate: "2025-03-31", paidDate: "2025-03-31", status: "paid", period: "2025" },
  { id: "pay-1003", propertyId: "prop-3", type: "waste", direction: "outgoing", amount: 1200, currency: "CZK", dueDate: "2025-03-31", paidDate: "2025-04-05", status: "paid", period: "2025" },
  { id: "pay-1004", propertyId: "prop-4", type: "waste", direction: "outgoing", amount: 1200, currency: "CZK", dueDate: "2025-03-31", status: "overdue", period: "2025", notes: "Zapomenuto zaplatit" },
  { id: "pay-1005", propertyId: "prop-1", type: "waste", direction: "outgoing", amount: 2400, currency: "CZK", dueDate: "2026-03-31", status: "pending", period: "2026" },
  { id: "pay-1006", propertyId: "prop-2", type: "waste", direction: "outgoing", amount: 1200, currency: "CZK", dueDate: "2026-03-31", status: "pending", period: "2026" },

  // ── Daně z nemovitostí ───────────────────────────────────────────────────
  { id: "pay-1101", propertyId: "prop-1", type: "tax", direction: "outgoing", amount: 4800, currency: "CZK", dueDate: "2025-05-31", paidDate: "2025-05-28", status: "paid", period: "2025", notes: "Daň z nemovitých věcí 2025" },
  { id: "pay-1102", propertyId: "prop-2", type: "tax", direction: "outgoing", amount: 2100, currency: "CZK", dueDate: "2025-05-31", paidDate: "2025-05-30", status: "paid", period: "2025" },
  { id: "pay-1103", propertyId: "prop-3", type: "tax", direction: "outgoing", amount: 1800, currency: "CZK", dueDate: "2025-05-31", paidDate: "2025-05-31", status: "paid", period: "2025" },
  { id: "pay-1104", propertyId: "prop-4", type: "tax", direction: "outgoing", amount: 1600, currency: "CZK", dueDate: "2025-05-31", paidDate: "2025-05-29", status: "paid", period: "2025" },
  { id: "pay-1105", propertyId: "prop-5", type: "tax", direction: "outgoing", amount: 340, currency: "CZK", dueDate: "2025-05-31", paidDate: "2025-05-31", status: "paid", period: "2025" },
  { id: "pay-1106", propertyId: "prop-1", type: "tax", direction: "outgoing", amount: 4900, currency: "CZK", dueDate: "2026-05-31", status: "pending", period: "2026" },
  { id: "pay-1107", propertyId: "prop-2", type: "tax", direction: "outgoing", amount: 2200, currency: "CZK", dueDate: "2026-05-31", status: "pending", period: "2026" },

  // ── Pojistné ─────────────────────────────────────────────────────────────
  { id: "pay-1201", propertyId: "prop-1", type: "insurance", direction: "outgoing", amount: 8400, currency: "CZK", dueDate: "2025-02-01", paidDate: "2025-01-30", status: "paid", period: "2025", notes: "Roční pojistné Kooperativa" },
  { id: "pay-1202", propertyId: "prop-2", type: "insurance", direction: "outgoing", amount: 6200, currency: "CZK", dueDate: "2025-03-01", paidDate: "2025-03-01", status: "paid", period: "2025" },
  { id: "pay-1203", propertyId: "prop-3", type: "insurance", direction: "outgoing", amount: 7100, currency: "CZK", dueDate: "2025-01-15", paidDate: "2025-01-14", status: "paid", period: "2025" },
  { id: "pay-1204", propertyId: "prop-4", type: "insurance", direction: "outgoing", amount: 5800, currency: "CZK", dueDate: "2025-07-01", paidDate: "2025-07-01", status: "paid", period: "2025" },
  { id: "pay-1205", propertyId: "prop-1", type: "insurance", direction: "outgoing", amount: 8600, currency: "CZK", dueDate: "2026-02-01", paidDate: "2026-01-31", status: "paid", period: "2026" },
  { id: "pay-1206", propertyId: "prop-2", type: "insurance", direction: "outgoing", amount: 6400, currency: "CZK", dueDate: "2026-03-01", status: "pending", period: "2026" },

  // ── Údržba ───────────────────────────────────────────────────────────────
  { id: "pay-1301", propertyId: "prop-1", type: "maintenance", direction: "outgoing", amount: 12500, currency: "CZK", dueDate: "2025-05-15", paidDate: "2025-05-15", status: "paid", notes: "Oprava střechy — klempíř" },
  { id: "pay-1302", propertyId: "prop-2", type: "maintenance", direction: "outgoing", amount: 4200, currency: "CZK", dueDate: "2025-08-20", paidDate: "2025-08-22", status: "paid", notes: "Výmalba společných prostor" },
  { id: "pay-1303", propertyId: "prop-3", type: "maintenance", direction: "outgoing", amount: 18900, currency: "CZK", dueDate: "2025-10-01", paidDate: "2025-10-05", status: "paid", notes: "Výměna oken — 3 ks" },
  { id: "pay-1304", propertyId: "prop-4", type: "maintenance", direction: "outgoing", amount: 3500, currency: "CZK", dueDate: "2026-02-28", paidDate: "2026-02-28", status: "paid", notes: "Oprava kotle" },
  { id: "pay-1305", propertyId: "prop-1", type: "maintenance", direction: "outgoing", amount: 6800, currency: "CZK", dueDate: "2026-03-20", status: "pending", notes: "Plánovaná oprava plotu" },
];

// ─── REVIZE ──────────────────────────────────────────────────────────────────
// Dnešní datum: 2026-03-08
// valid = nextDueDate > 2026-05-07 (>60 dní)
// expiring_soon = nextDueDate v rozsahu 2026-03-08 až 2026-05-07
// expired = nextDueDate < 2026-03-08

export const mockInspections: Inspection[] = [
  // prop-1 — Dům Nerudova 435
  {
    id: "insp-1",
    propertyId: "prop-1",
    type: "chimney",
    lastDate: "2024-10-15",
    nextDueDate: "2025-10-15",
    status: "expired",
    provider: "Kominické služby Novák s.r.o.",
    cost: 1200,
    notes: "Roční kontrola komína — prošlá!",
  },
  {
    id: "insp-2",
    propertyId: "prop-1",
    type: "gas_boiler",
    lastDate: "2025-11-20",
    nextDueDate: "2026-11-20",
    status: "valid",
    provider: "Servis Plyntech s.r.o.",
    cost: 1800,
  },
  {
    id: "insp-3",
    propertyId: "prop-1",
    type: "electrical",
    lastDate: "2021-06-10",
    nextDueDate: "2026-06-10",
    status: "expiring_soon",
    provider: "Elektro Šmíd",
    cost: 3500,
    notes: "5letá revize elektroinstalace — blíží se termín",
  },
  {
    id: "insp-4",
    propertyId: "prop-1",
    type: "fire_extinguisher",
    lastDate: "2025-09-01",
    nextDueDate: "2026-09-01",
    status: "valid",
    provider: "Hasičská technika Praha s.r.o.",
    cost: 400,
  },

  // prop-2 — Dům Besední 25
  {
    id: "insp-5",
    propertyId: "prop-2",
    type: "chimney",
    lastDate: "2025-09-22",
    nextDueDate: "2026-09-22",
    status: "valid",
    provider: "Kominické služby Novák s.r.o.",
    cost: 1100,
  },
  {
    id: "insp-6",
    propertyId: "prop-2",
    type: "gas_boiler",
    lastDate: "2025-03-10",
    nextDueDate: "2026-03-10",
    status: "expiring_soon",
    provider: "Servis Plyntech s.r.o.",
    cost: 1600,
    notes: "Servis kotle — blíží se termín (za 2 dny)",
  },
  {
    id: "insp-7",
    propertyId: "prop-2",
    type: "electrical",
    lastDate: "2020-04-15",
    nextDueDate: "2025-04-15",
    status: "expired",
    provider: "Elektro Šmíd",
    cost: 2800,
    notes: "Revize elektroinstalace PROŠLÁ — nutno objednat",
  },

  // prop-3 — Dům Strašín 38
  {
    id: "insp-8",
    propertyId: "prop-3",
    type: "chimney",
    lastDate: "2025-11-05",
    nextDueDate: "2026-11-05",
    status: "valid",
    provider: "Kominické služby Holub",
    cost: 950,
  },
  {
    id: "insp-9",
    propertyId: "prop-3",
    type: "gas_boiler",
    lastDate: "2025-12-18",
    nextDueDate: "2026-12-18",
    status: "valid",
    provider: "Servis Plyntech s.r.o.",
    cost: 1800,
  },
  {
    id: "insp-10",
    propertyId: "prop-3",
    type: "fire_alarm",
    lastDate: "2025-02-28",
    nextDueDate: "2026-02-28",
    status: "expired",
    provider: "Fire Safe s.r.o.",
    cost: 600,
    notes: "Roční zkouška požárního hlásiče — prošlá",
  },
  {
    id: "insp-11",
    propertyId: "prop-3",
    type: "electrical",
    lastDate: "2022-08-20",
    nextDueDate: "2027-08-20",
    status: "valid",
    provider: "Elektro Šmíd",
    cost: 3200,
  },

  // prop-4 — Dům Kašperskohorská 126
  {
    id: "insp-12",
    propertyId: "prop-4",
    type: "chimney",
    lastDate: "2025-04-20",
    nextDueDate: "2026-04-20",
    status: "expiring_soon",
    provider: "Kominické služby Novák s.r.o.",
    cost: 1000,
    notes: "Za 43 dní",
  },
  {
    id: "insp-13",
    propertyId: "prop-4",
    type: "gas_boiler",
    lastDate: "2026-02-05",
    nextDueDate: "2027-02-05",
    status: "valid",
    provider: "Servis Plyntech s.r.o.",
    cost: 1700,
  },
  {
    id: "insp-14",
    propertyId: "prop-4",
    type: "fire_extinguisher",
    lastDate: "2024-12-10",
    nextDueDate: "2025-12-10",
    status: "expired",
    provider: "Hasičská technika Praha s.r.o.",
    cost: 400,
    notes: "Kontrola hasicího přístroje PROŠLÁ",
  },
];

// ─── POJIŠTĚNÍ ───────────────────────────────────────────────────────────────

export const mockInsurances: Insurance[] = [
  {
    id: "ins-1",
    propertyId: "prop-1",
    provider: "Kooperativa pojišťovna a.s.",
    policyNumber: "7020 4518 3301",
    type: "property",
    startDate: "2024-02-01",
    endDate: "2027-01-31",
    annualPremium: 8600,
    notes: "Komplexní pojištění domu, pojistná hodnota 4,2 mil. Kč",
  },
  {
    id: "ins-2",
    propertyId: "prop-2",
    provider: "Česká pojišťovna a.s.",
    policyNumber: "CP-2024-88432",
    type: "property",
    startDate: "2024-03-01",
    endDate: "2026-02-28",
    annualPremium: 6400,
    notes: "Smlouva expiruje za méně než rok",
  },
  {
    id: "ins-3",
    propertyId: "prop-3",
    provider: "Allianz pojišťovna a.s.",
    policyNumber: "ALZ-55-2023-7741",
    type: "property",
    startDate: "2023-01-15",
    endDate: "2026-01-14",
    annualPremium: 7100,
    notes: "POZOR: Pojistka expirovala 14. 1. 2026 — nutno obnovit",
  },
  {
    id: "ins-4",
    propertyId: "prop-4",
    provider: "Kooperativa pojišťovna a.s.",
    policyNumber: "7020 9912 4455",
    type: "property",
    startDate: "2025-07-01",
    endDate: "2028-06-30",
    annualPremium: 5800,
  },
  {
    id: "ins-5",
    propertyId: "prop-1",
    provider: "Kooperativa pojišťovna a.s.",
    policyNumber: "7020 4518 3302",
    type: "liability",
    startDate: "2024-02-01",
    endDate: "2027-01-31",
    annualPremium: 1200,
    notes: "Pojištění odpovědnosti vlastníka nemovitosti",
  },
];

// ─── SMLOUVY ─────────────────────────────────────────────────────────────────

export const mockContracts: Contract[] = [
  {
    id: "contract-1",
    propertyId: "prop-1",
    tenantId: "tenant-1",
    type: "rental",
    startDate: "2023-02-01",
    endDate: "2026-01-31",
    monthlyAmount: 12500,
    notes: "Nájemní smlouva na dobu určitou — expirovala 31. 1. 2026",
  },
  {
    id: "contract-2",
    propertyId: "prop-1",
    tenantId: "tenant-2",
    type: "rental",
    startDate: "2024-06-01",
    endDate: "2026-05-31",
    monthlyAmount: 10800,
    notes: "Nájemní smlouva — blíží se konec",
  },
  {
    id: "contract-3",
    propertyId: "prop-2",
    tenantId: "tenant-3",
    type: "rental",
    startDate: "2022-09-01",
    endDate: "2025-08-31",
    monthlyAmount: 9500,
    notes: "Smlouva vypršela — probíhá jednání o prodloužení",
  },
  {
    id: "contract-4",
    propertyId: "prop-3",
    tenantId: "tenant-4",
    type: "rental",
    startDate: "2024-01-01",
    endDate: "2026-12-31",
    monthlyAmount: 11200,
  },
  {
    id: "contract-5",
    propertyId: "prop-4",
    tenantId: "tenant-5",
    type: "rental",
    startDate: "2025-01-01",
    endDate: "2026-12-31",
    monthlyAmount: 8900,
  },
  {
    id: "contract-6",
    propertyId: "prop-4",
    tenantId: "tenant-6",
    type: "rental",
    startDate: "2024-09-01",
    monthlyAmount: 8500,
    notes: "Smlouva na dobu neurčitou",
  },
  {
    id: "contract-7",
    propertyId: "prop-5",
    tenantId: "tenant-7",
    type: "lease",
    startDate: "2020-04-01",
    endDate: "2027-03-31",
    monthlyAmount: 1400,
    notes: "Pachtovní smlouva — ZD Nový Bor",
  },
  {
    id: "contract-8",
    propertyId: "prop-6",
    tenantId: "tenant-8",
    type: "lease",
    startDate: "2023-04-01",
    endDate: "2026-03-31",
    monthlyAmount: 420,
    notes: "Pacht louky — blíží se konec smlouvy",
  },
  {
    id: "contract-9",
    propertyId: "prop-9",
    tenantId: "tenant-9",
    type: "lease",
    startDate: "2023-03-01",
    endDate: "2026-02-28",
    monthlyAmount: 1950,
    notes: "Pacht od obce Sušice — smlouva expirovala 28. 2. 2026",
  },
];

// ─── HELPER FUNKCE ───────────────────────────────────────────────────────────

export function getPropertyById(id: string): Property | undefined {
  return mockProperties.find((p) => p.id === id);
}

export function getTenantsByProperty(propertyId: string): Tenant[] {
  return mockTenants.filter((t) => t.propertyId === propertyId);
}

export function getPaymentsByProperty(propertyId: string): Payment[] {
  return mockPayments.filter((p) => p.propertyId === propertyId);
}

export function getInspectionsByProperty(propertyId: string): Inspection[] {
  return mockInspections.filter((i) => i.propertyId === propertyId);
}

export function getInsurancesByProperty(propertyId: string): Insurance[] {
  return mockInsurances.filter((i) => i.propertyId === propertyId);
}

export function getContractsByProperty(propertyId: string): Contract[] {
  return mockContracts.filter((c) => c.propertyId === propertyId);
}

export function getTenantById(id: string): Tenant | undefined {
  return mockTenants.find((t) => t.id === id);
}

// Vrátí platby podle stavu
export function getPaymentsByStatus(status: Payment["status"]): Payment[] {
  return mockPayments.filter((p) => p.status === status);
}

// Nadcházející události: revize expirující do 90 dní + smlouvy expirující do 90 dní
export interface UpcomingEvent {
  type: "inspection" | "contract" | "insurance";
  label: string;
  propertyId: string;
  propertyName: string;
  dueDate: string;
  status: "expiring_soon" | "expired";
  referenceId: string;
}

export function getUpcomingEvents(withinDays = 90): UpcomingEvent[] {
  const now = new Date();
  const threshold = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
  const events: UpcomingEvent[] = [];

  // Revize
  for (const insp of mockInspections) {
    const due = new Date(insp.nextDueDate);
    if (due <= threshold) {
      const prop = getPropertyById(insp.propertyId);
      events.push({
        type: "inspection",
        label: insp.type,
        propertyId: insp.propertyId,
        propertyName: prop?.name ?? insp.propertyId,
        dueDate: insp.nextDueDate,
        status: due < now ? "expired" : "expiring_soon",
        referenceId: insp.id,
      });
    }
  }

  // Smlouvy
  for (const contract of mockContracts) {
    if (!contract.endDate) continue;
    const due = new Date(contract.endDate);
    if (due <= threshold) {
      const prop = getPropertyById(contract.propertyId);
      events.push({
        type: "contract",
        label: contract.type,
        propertyId: contract.propertyId,
        propertyName: prop?.name ?? contract.propertyId,
        dueDate: contract.endDate,
        status: due < now ? "expired" : "expiring_soon",
        referenceId: contract.id,
      });
    }
  }

  // Pojistky
  for (const ins of mockInsurances) {
    const due = new Date(ins.endDate);
    if (due <= threshold) {
      const prop = getPropertyById(ins.propertyId);
      events.push({
        type: "insurance",
        label: ins.type,
        propertyId: ins.propertyId,
        propertyName: prop?.name ?? ins.propertyId,
        dueDate: ins.endDate,
        status: due < now ? "expired" : "expiring_soon",
        referenceId: ins.id,
      });
    }
  }

  // Seřadit: nejbližší termín první
  return events.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

// Souhrné statistiky pro dashboard
export function getDashboardStats() {
  const overduePayments = mockPayments.filter((p) => p.status === "overdue");
  const pendingPayments = mockPayments.filter((p) => p.status === "pending");
  const expiredInspections = mockInspections.filter((i) => i.status === "expired");
  const expiringSoonInspections = mockInspections.filter((i) => i.status === "expiring_soon");
  const activeContracts = mockContracts.filter((c) => {
    if (!c.endDate) return true;
    return new Date(c.endDate) >= new Date();
  });

  return {
    totalProperties: mockProperties.length,
    totalHouses: mockProperties.filter((p) => p.type === "house").length,
    totalLand: mockProperties.filter((p) => p.type === "land").length,
    activeContracts: activeContracts.length,
    overduePayments: overduePayments.length,
    pendingPayments: pendingPayments.length,
    expiredInspections: expiredInspections.length,
    expiringSoonInspections: expiringSoonInspections.length,
  };
}
