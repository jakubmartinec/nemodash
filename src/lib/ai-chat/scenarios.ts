import type { InvoiceData } from "./types";

export const waterInvoiceScenario = {
  invoiceData: {
    provider: "Severočeské vodovody a kanalizace, a.s.",
    invoiceNumber: "3612033777",
    recipient: "Ing. Ladislav Martinec",
    address: "Nerudova 435, Arnultovice, 473 01 Nový Bor",
    period: "19.2.2025 – 12.2.2026",
    periodMonths: 12,
    items: [
      { name: "Vodné", amount: "108 m³", price: "8 029,64 Kč" },
      { name: "Stočné", amount: "108 m³", price: "6 501,74 Kč" },
    ],
    totalWithVat: "16 275,12 Kč",
    deposits: "4 620,00 Kč",
    toPay: "11 655,00 Kč",
    toPayNumber: 11655,
    dueDate: "13.03.2026",
    vs: "3612033777",
    bankAccount: "3507501/0100",
  } satisfies InvoiceData,
  matchedPropertyId: "prop-1",
  newSupplierAdvance: 1430,
  suggestedTenantAdvance: 1000,
} as const;
