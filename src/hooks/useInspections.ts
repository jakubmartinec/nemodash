// Hook pro práci s revizemi — placeholder
// TODO: Napojit na Firebase Firestore

import { Inspection } from "@/lib/types";

export function useInspections(propertyId?: string) {
  return {
    inspections: [] as Inspection[],
    loading: false,
    error: null as Error | null,
  };
}
