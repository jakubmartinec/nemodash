// Hook pro práci s platbami — placeholder
// TODO: Napojit na Firebase Firestore

import { Payment } from "@/lib/types";

export function usePayments(propertyId?: string) {
  return {
    payments: [] as Payment[],
    loading: false,
    error: null as Error | null,
  };
}
