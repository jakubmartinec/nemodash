# NemoDash — Správa nemovitostí

## O projektu

SaaS webová aplikace pro správu nemovitostí (domy, pozemky). Umožňuje evidovat nemovitosti, nájemníky/pachtýře, platby, revize, pojištění, smlouvy a dokumenty. Cílí na české uživatele spravující menší portfolia nemovitostí.

## Tech Stack

- **Framework**: Next.js 16+ (App Router) s TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york styl, neutral barvy)
- **Databáze**: Firebase Firestore (zatím mock data, napojení později)
- **Auth**: Firebase Auth (později)
- **Storage**: Firebase Storage (později)
- **i18n**: next-intl (čeština jako výchozí, připraveno na EN)
- **Deploy**: Vercel

## Architektura

### Adresářová struktura

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # redirect na /dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── properties/
│   │   │   ├── page.tsx          # seznam nemovitostí
│   │   │   └── [id]/
│   │   │       └── page.tsx      # detail nemovitosti
│   │   ├── payments/
│   │   │   └── page.tsx
│   │   ├── inspections/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui komponenty
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── AppShell.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── UpcomingEvents.tsx
│   │   └── PropertyOverview.tsx
│   ├── properties/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyDetail.tsx
│   │   ├── PropertyTabs.tsx
│   │   └── PropertyForm.tsx
│   ├── payments/
│   │   ├── PaymentTable.tsx
│   │   └── PaymentFilters.tsx
│   └── inspections/
│       ├── InspectionTable.tsx
│       └── InspectionStatus.tsx
├── lib/
│   ├── types.ts                  # TypeScript interfaces
│   ├── mock-data.ts              # Mock data pro vývoj
│   ├── utils.ts                  # Utility funkce (cn)
│   ├── constants.ts              # Konstanty, stavové indikátory
│   └── firebase.ts               # Firebase konfigurace (později)
├── i18n/
│   ├── config.ts                 # next-intl routing konfigurace
│   ├── request.ts                # next-intl server konfigurace
│   └── messages/
│       ├── cs.json
│       └── en.json
└── hooks/
    ├── useProperties.ts
    ├── usePayments.ts
    └── useInspections.ts
```

## Datový model

### Property (Nemovitost)

```typescript
interface Property {
  id: string;
  type: "house" | "land";
  name: string;
  address?: string;
  cadastralNumber?: string;
  parcelNumbers?: string[];
  ownership: "owned" | "rented";
  area?: number;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Tenant (Nájemník / Pachtýř)

```typescript
interface Tenant {
  id: string;
  propertyId: string;
  name: string;
  email?: string;
  phone?: string;
  type: "tenant" | "lessee";
  contractStart: string;
  contractEnd?: string;
  monthlyRent: number;
  deposit?: number;
  notes?: string;
}
```

### Payment (Platba)

```typescript
type PaymentType = "rent" | "lease" | "energy_electricity" | "energy_gas" | "energy_water" | "waste" | "tax" | "insurance" | "maintenance" | "other";
type PaymentDirection = "incoming" | "outgoing";
type PaymentStatus = "pending" | "paid" | "overdue";

interface Payment {
  id: string;
  propertyId: string;
  tenantId?: string;
  type: PaymentType;
  direction: PaymentDirection;
  amount: number;
  currency: "CZK";
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  period?: string;
  notes?: string;
}
```

### Inspection (Revize)

```typescript
type InspectionType = "chimney" | "gas_boiler" | "electrical" | "fire_alarm" | "fire_extinguisher" | "elevator" | "other";

interface Inspection {
  id: string;
  propertyId: string;
  type: InspectionType;
  lastDate: string;
  nextDueDate: string;
  status: "valid" | "expiring_soon" | "expired";
  provider?: string;
  cost?: number;
  notes?: string;
  documentUrl?: string;
}
```

### Insurance (Pojištění)

```typescript
interface Insurance {
  id: string;
  propertyId: string;
  provider: string;
  policyNumber: string;
  type: "property" | "liability" | "natural_disaster" | "other";
  startDate: string;
  endDate: string;
  annualPremium: number;
  notes?: string;
}
```

### Contract (Smlouva)

```typescript
interface Contract {
  id: string;
  propertyId: string;
  tenantId?: string;
  type: "rental" | "lease" | "purchase" | "other";
  startDate: string;
  endDate?: string;
  monthlyAmount?: number;
  documentUrl?: string;
  notes?: string;
}
```

## Pravidla pro vývoj

### Kódovací konvence

- Všechny komponenty jako funkční React komponenty s TypeScript
- Používej `"use client"` pouze kde je to nutné (interaktivní komponenty)
- Sdílené typy v `lib/types.ts`, nikdy `any`
- Pojmenování: PascalCase pro komponenty, camelCase pro funkce a proměnné
- České komentáře v kódu jsou OK

### UI/UX principy

- Barevné indikátory stavu: zelená (OK), žlutá (blíží se termín), červená (po termínu / expirováno)
- Sidebar navigace na desktopu, hamburger menu na mobilu
- Karty (cards) pro přehled nemovitostí
- Tabulky pro platby a revize s filtrováním a řazením
- Responzivní design (mobile-first)

### i18n

- Všechny UI texty přes next-intl, žádné hardcoded české texty v komponentách
- Klíče ve formátu: `dashboard.title`, `properties.type.house`, `payments.status.paid`
- Čísla a datumy formatovat přes `Intl` API (české locale)

### Mock data

- 4 domy (různé adresy, různé stavy)
- 5+ pozemků (různá LV, některé vlastní, některé v nájmu)
- Nájemníci a pachtýři
- Mix plateb (zaplacené, čekající, po splatnosti)
- Revize v různých stavech (platné, blížící se, expirované)
- Realistické české adresy a jména

## Stavové indikátory

| Stav | Podmínka | Barva |
|------|----------|-------|
| Revize platná | > 60 dní do konce | zelená |
| Revize blíží se konec | 0–60 dní do konce | žlutá |
| Revize expirovaná | po datu | červená |
| Smlouva aktivní | > 90 dní do konce | zelená |
| Smlouva blíží se konec | 0–90 dní do konce | žlutá |
| Smlouva vypršela | po datu | červená |
| Platba zaplacena | status = paid | zelená |
| Platba čeká | status = pending | žlutá |
| Platba po splatnosti | status = overdue | červená |

## Budoucí plány (NEIMPLEMENTOVAT zatím)

- Firebase napojení (auth, firestore, storage)
- AI chat interface pro zadávání dat
- Multi-tenant SaaS (Stripe, subscription plans)
- Export PDF reportů
- Notifikace (email, push)
