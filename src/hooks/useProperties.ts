// Hook pro práci s nemovitostmi — placeholder
// TODO: Napojit na Firebase Firestore

import { Property } from "@/lib/types";

export function useProperties() {
  return {
    properties: [] as Property[],
    loading: false,
    error: null as Error | null,
  };
}
