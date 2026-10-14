// Fáze 1 — automatické kroky od spuštění dema (delay v ms)
export const PHASE1_DELAYS = [
  { delay: 600,  type: "text" as const,              contentKey: "analyzing" },
  { delay: 1800, type: "text" as const,              contentKey: "recognizing" },
  { delay: 2800, type: "text" as const,              contentKey: "extracting" },
  { delay: 4200, type: "invoice_extraction" as const, contentKey: null },
  { delay: 5800, type: "property_match" as const,     contentKey: null },
];

// Fáze 2 — kroky po potvrzení přiřazení nemovitosti
export const PHASE2_DELAYS = {
  settlement: 800,
  proposal: 1800,
};

export { formatCZK } from "@/lib/format";
