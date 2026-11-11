import "server-only";

// Zdroj dat: Firestore, pokud má server přístup, jinak demo data.
// Portfolio je malé, takže se kolekce načítají celé — jednou za požadavek.
import { cache } from "react";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import {
  mockContracts,
  mockDocuments,
  mockInspections,
  mockInsurances,
  mockLandlord,
  mockPayments,
  mockProperties,
  mockSettlements,
  mockTenants,
} from "@/lib/mock-data";
import type { Landlord } from "@/lib/types";
import { inspectionStatus, paymentStatus, type Dataset } from "./selectors";

export const COLLECTIONS = {
  properties: "properties",
  tenants: "tenants",
  payments: "payments",
  inspections: "inspections",
  insurances: "insurances",
  contracts: "contracts",
  documents: "documents",
  settlements: "settlements",
} as const;

export const LANDLORD_DOC = "settings/landlord";

const EMPTY_LANDLORD: Landlord = { name: "", email: "", bankAccount: "" };

async function readCollection<T>(name: string): Promise<T[]> {
  const snap = await adminDb().collection(name).get();
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as T);
}

async function loadFirestore(): Promise<Dataset> {
  const [properties, tenants, payments, inspections, insurances, contracts, documents, settlements, landlordSnap] =
    await Promise.all([
      readCollection<Dataset["properties"][number]>(COLLECTIONS.properties),
      readCollection<Dataset["tenants"][number]>(COLLECTIONS.tenants),
      readCollection<Dataset["payments"][number]>(COLLECTIONS.payments),
      readCollection<Dataset["inspections"][number]>(COLLECTIONS.inspections),
      readCollection<Dataset["insurances"][number]>(COLLECTIONS.insurances),
      readCollection<Dataset["contracts"][number]>(COLLECTIONS.contracts),
      readCollection<Dataset["documents"][number]>(COLLECTIONS.documents),
      readCollection<Dataset["settlements"][number]>(COLLECTIONS.settlements),
      adminDb().doc(LANDLORD_DOC).get(),
    ]);

  return {
    properties: properties.sort((a, b) => a.name.localeCompare(b.name, "cs")),
    tenants,
    // Stavy se u ostrých dat počítají z termínů, neukládají se
    payments: payments.map((p) => ({ ...p, status: paymentStatus(p) })),
    inspections: inspections.map((i) => ({ ...i, status: inspectionStatus(i.nextDueDate) })),
    insurances,
    contracts,
    documents,
    settlements,
    landlord: { ...EMPTY_LANDLORD, ...(landlordSnap.data() as Partial<Landlord> | undefined) },
  };
}

const MOCK_DATASET: Dataset = {
  properties: mockProperties,
  tenants: mockTenants,
  payments: mockPayments,
  inspections: mockInspections,
  insurances: mockInsurances,
  contracts: mockContracts,
  documents: mockDocuments,
  settlements: mockSettlements,
  landlord: mockLandlord,
};

export const getDataset = cache(async (): Promise<Dataset> =>
  isFirebaseConfigured() ? loadFirestore() : MOCK_DATASET
);

export { isFirebaseConfigured as isLiveData };
