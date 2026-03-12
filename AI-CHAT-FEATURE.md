# Zadání pro Claude Code: AI Chat Interface

## Repozitář

https://github.com/jakubmartinec/nemodash

## Kontext

NemoDash je Next.js aplikace pro správu nemovitostí běžící na https://nemodash.vercel.app.

### Stávající stav aplikace:
- **Dashboard** (`/[locale]/dashboard`) — 10 nemovitostí (4 domy, 6 pozemků), stat karty, přehled, nadcházející události, finance měsíce
- **Nemovitosti** (`/[locale]/properties`) — grid karet s filtry, detail se záložkami (Přehled, Nájemníci, Platby, Revize, Pojištění, Dokumenty)
- **Platby** (`/[locale]/payments`) — tabulka s 5 filtry, souhrn příjmů/výdajů
- **Revize** (`/[locale]/inspections`) — tabulka s 3 filtry, stavy
- **Nastavení** (`/[locale]/settings`) — prázdná stránka
- **Layout** — `AppShell.tsx` (sidebar + topbar + main), responsive

### Tech stack:
- Next.js 14+ (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- i18n: `next-intl` (cs/en), překlady v `src/i18n/messages/cs.json` a `en.json`
- Mock data v `src/lib/mock-data.ts`, typy v `src/lib/types.ts`
- Deploy: Vercel

### Klíčové soubory pro integraci:

**`src/app/[locale]/layout.tsx`** — locale layout:
```tsx
<html lang={locale}>
  <body className="antialiased">
    <NextIntlClientProvider messages={messages}>
      <AppShell locale={locale}>
        {children}
      </AppShell>
    </NextIntlClientProvider>
  </body>
</html>
```

**`src/components/layout/AppShell.tsx`** — "use client" komponenta, obaluje sidebar + topbar + main content. Sidebar má `w-60`, main má `lg:pl-60`.

**`src/lib/types.ts`** — stávající interface Tenant:
```typescript
export interface Tenant {
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

**`src/lib/mock-data.ts`** — obsahuje:
- `mockProperties` (10 items, id: "prop-1" až "prop-10")
- `mockTenants` (9 items) — prop-1 (Dům Nerudova 435) má 2 nájemníky
- `mockPayments` (50+ items)
- Helper funkce: `getPropertyById()`, `getTenantsByProperty()`, `getPaymentsByProperty()`, `getUpcomingEvents()`, `getDashboardStats()`

**`src/i18n/messages/cs.json`** — cca 305 klíčů, struktura: `nav.*`, `dashboard.*`, `properties.*`, `payments.*`, `inspections.*`, `common.*`, `layout.*`

**Ikony**: aplikace používá `lucide-react` (LayoutDashboard, Building2, CreditCard, ClipboardCheck, Settings, ...)

---

## Co implementovat

### Nová feature: AI Chat Asistent

Plovoucí AI chat okno dostupné z každé stránky aplikace. Uživatel nahraje dokument (fakturu) a chat ho automaticky zpracuje — rozpozná typ, extrahuje data, přiřadí k nemovitosti, spočítá vyúčtování záloh nájemníka.

---

## Krok 1: Rozšíření datového modelu

### 1a. Rozšířit Tenant interface v `src/lib/types.ts`

Přidej pole `advances` pro měsíční zálohy na energie:

```typescript
export interface Tenant {
  // ... stávající pole (NEMAZAT) ...
  advances?: {
    water?: number;        // měsíční záloha na vodu v Kč
    gas?: number;          // měsíční záloha na plyn v Kč
    electricity?: number;  // měsíční záloha na elektřinu v Kč
  };
}
```

### 1b. Aktualizovat mock data v `src/lib/mock-data.ts`

Přidej `advances` nájemníkům na Dům Nerudova 435 (prop-1). Najdi je v `mockTenants` array a doplň:

```typescript
// Nájemníci na prop-1 (Dům Nerudova 435) dostanou:
advances: { water: 750, gas: 500, electricity: 600 }
```

### 1c. Nové typy pro AI chat v `src/lib/ai-chat/types.ts`

```typescript
export type ChatMessageRole = "user" | "assistant";

export type ChatMessageType =
  | "text"
  | "file_attachment"
  | "invoice_extraction"
  | "property_match"
  | "tenant_settlement"
  | "action_proposal";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  type: ChatMessageType;
  content?: string;
  data?: Record<string, unknown>;
  file?: { name: string; size: string; type: string };
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isOpen: boolean;
  matchConfirmed: boolean;
  saved: boolean;
}

export interface InvoiceData {
  provider: string;
  invoiceNumber: string;
  recipient: string;
  address: string;
  period: string;
  periodMonths: number;
  items: { name: string; amount: string; price: string }[];
  totalWithVat: string;
  deposits: string;
  toPay: string;
  toPayNumber: number;
  dueDate: string;
  vs: string;
  bankAccount: string;
}

export interface SettlementData {
  tenantName: string;
  monthlyAdvance: number;
  months: number;
  totalAdvances: number;
  actualCost: number;
  difference: number;
  isUnderpaid: boolean;
  suggestedNewAdvance: number;
  newSupplierAdvance: number;
}
```

---

## Krok 2: Chat engine a scénáře

### 2a. `src/lib/ai-chat/scenarios.ts`

Definuj demo scénář pro vyúčtování vody. Data odpovídají reálné faktuře:

```typescript
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
  },
  matchedPropertyId: "prop-1",  // Dům Nerudova 435
  newSupplierAdvance: 1430,     // Nová záloha od dodavatele
  suggestedTenantAdvance: 1000, // Doporučená nová záloha nájemníka
};
```

### 2b. `src/lib/ai-chat/engine.ts`

Engine pro postupné zobrazení kroků s pauzami (typing indikátor):

```typescript
// Kroky scénáře:
const STEPS = [
  { delay: 600,  type: "text",               content: t("aiChat.analyzing") },
  { delay: 1800, type: "text",               content: t("aiChat.recognizing") },
  { delay: 2800, type: "text",               content: t("aiChat.extracting") },
  { delay: 4200, type: "invoice_extraction",  data: invoiceData },
  { delay: 5800, type: "property_match",      data: { propertyId: "prop-1" } },
  { delay: 7200, type: "tenant_settlement",   data: settlementData },
  { delay: 8400, type: "action_proposal",     data: proposalData },
];
```

Vyúčtování záloh se spočítá dynamicky z mock dat:
- Najdi nájemníka na prop-1 s `advances.water`
- `totalAdvances = monthlyAdvance × periodMonths`
- `difference = toPayNumber - totalAdvances`
- `monthlyActual = Math.round(toPayNumber / periodMonths)`

---

## Krok 3: UI komponenty

### Struktura souborů
```
src/components/ai-chat/
├── AIChatFAB.tsx              # Plovoucí tlačítko (Sparkles ikona)
├── AIChatPanel.tsx            # Chat panel (header + messages + input)
├── AIChatMessages.tsx         # Scrollovatelný seznam zpráv
├── AIChatInput.tsx            # Input + file upload + send
├── AIChatProvider.tsx         # React Context pro ChatState
├── PropertySelector.tsx       # Modal pro výběr nemovitosti
└── messages/
    ├── TextMessage.tsx        # Textová zpráva (user/assistant)
    ├── FileAttachment.tsx     # Příloha souboru v bublině
    ├── InvoiceCard.tsx        # Strukturovaná karta faktury
    ├── PropertyMatch.tsx      # Návrh přiřazení + tlačítka Potvrdit/Jiná
    ├── TenantSettlement.tsx   # Výpočetní tabulka záloh + nedoplatek + tip
    ├── ActionProposal.tsx     # Checklist akcí + Uložit vše
    └── TypingIndicator.tsx    # 3 pulsující tečky
```

### Referenční prototyp

V souboru `ai-chat-prototype.jsx` (přiložen v repo root nebo outputs) je funkční React prototyp celého flow. **Použij ho jako vizuální referenci** pro design karet, barev, layoutu a interakcí. Ale implementuj to správně s:
- Oddělenými komponentami (ne jeden monolitický soubor)
- next-intl pro texty (ne hardcoded)
- Tailwind třídami (ne inline styly)
- Stávajícími typy a mock daty z projektu

---

## Krok 4: Integrace do layoutu

### V `src/app/[locale]/layout.tsx`

Přidej AIChatProvider dovnitř NextIntlClientProvider, ale vně AppShell:

```tsx
<NextIntlClientProvider messages={messages}>
  <AIChatProvider>
    <AppShell locale={locale}>
      {children}
    </AppShell>
    <AIChatFAB />
    <AIChatPanel />
  </AIChatProvider>
</NextIntlClientProvider>
```

FAB a Panel jsou `position: fixed`, takže nepotřebují být uvnitř AppShell.

---

## Krok 5: i18n

### Přidej do `src/i18n/messages/cs.json`:

```json
{
  "aiChat": {
    "title": "NemoDash AI",
    "subtitle": "Asistent pro správu nemovitostí",
    "placeholder": "Napiš zprávu nebo nahraj dokument...",
    "greeting": "Ahoj! Jsem tvůj asistent pro správu nemovitostí. Můžeš mi sem nahrát fakturu, doklad nebo mi prostě napsat — a já to zpracuji za tebe.",
    "analyzing": "Analyzuji nahraný dokument...",
    "recognizing": "Rozpoznávám typ dokladu: vyúčtování vodného a stočného",
    "extracting": "Extrahuji údaje z faktury...",
    "foundData": "Nalezl jsem tyto údaje na faktuře:",
    "invoiceTitle": "Vyúčtování vodného a stočného",
    "provider": "Dodavatel",
    "invoiceNumber": "Číslo faktury",
    "period": "Fakturační období",
    "dueDate": "Splatnost",
    "totalWithVat": "Celkem s DPH",
    "includedDeposits": "Zahrnuté zálohy",
    "toPay": "K úhradě",
    "matchTitle": "Na základě adresy {address} navrhuji přiřadit k:",
    "confirm": "Potvrdit",
    "confirmed": "Potvrzeno",
    "otherProperty": "Jiná nemovitost",
    "selectProperty": "Vybrat nemovitost",
    "search": "Hledat...",
    "settlementTitle": "Vyúčtování záloh nájemníka",
    "settlementDescription": "V evidenci mám nájemníka {name} s měsíční zálohou na vodu {amount}. Spočítal jsem vyúčtování za fakturační období ({months} měsíců):",
    "monthlyAdvance": "Měsíční záloha nájemníka",
    "monthCount": "Počet měsíců",
    "totalAdvances": "Zaplacené zálohy celkem",
    "actualCost": "Skutečné náklady (k úhradě)",
    "underpayment": "Nedoplatek nájemníka",
    "overpayment": "Přeplatek nájemníka",
    "tip": "Tip",
    "tipText": "Skutečná měsíční spotřeba je {monthlyActual} Kč/měsíc. Nová záloha od dodavatele bude {newSupplierAdvance} Kč/měsíc. Doporučuji zvýšit zálohu nájemníka z {oldAdvance} Kč na {newAdvance} Kč/měsíc.",
    "proposalTitle": "Vytvořím následující záznamy:",
    "saveAll": "Uložit vše",
    "saved": "Uloženo! Platba, nedoplatek nájemníka a dokument přiřazeny k {property}.",
    "confirmFirst": "Nejdříve potvrď přiřazení nemovitosti...",
    "demoHint": "Klikni na 📎 nebo pošli zprávu pro demo zpracování faktury",
    "paymentEntry": "Platba \"{type}\" — {amount}",
    "paymentEntrySub": "Splatnost {dueDate}, typ: energie-voda, směr: výdaj",
    "receivableEntry": "Nedoplatek nájemníka {name} — {amount}",
    "receivableEntrySub": "Pohledávka: zálohy {advances} vs. skutečnost {actual}",
    "documentEntry": "Dokument — faktura č. {number}",
    "documentEntrySub": "Přiložena k nemovitosti {property}",
    "reminderEntry": "Připomínka splatnosti (2×)",
    "reminderEntrySub": "Faktura SčVK: {invoiceDate} • Nedoplatek nájemníka: do {tenantDate}",
    "advanceChangeEntry": "Návrh úpravy zálohy: {old} → {new}/měsíc",
    "advanceChangeEntrySub": "Na základě skutečné spotřeby {actual}/měsíc"
  }
}
```

### Přidej odpovídající anglické překlady do `en.json`.

---

## Design specifikace

### FAB (Floating Action Button)
- `position: fixed`, `bottom-6 right-6`
- `w-14 h-14 rounded-2xl`
- `bg-gradient-to-br from-indigo-500 to-purple-500`
- Ikona: `Sparkles` z lucide-react (bílá)
- Hover: `hover:scale-105`, `shadow-lg → shadow-xl`
- `z-50`

### Chat Panel
- `position: fixed`, `bottom-24 right-6`
- `w-[420px] max-h-[600px]`
- `rounded-2xl shadow-2xl border border-gray-200`
- `bg-white`
- Mobil (`max-sm:`): `inset-0 rounded-none max-h-full w-full`
- Animace: `animate-in slide-in-from-bottom-4 fade-in`
- `z-50`

### Header
- `bg-gradient-to-r from-indigo-600 to-purple-600`
- `text-white rounded-t-2xl p-4`
- Ikona Sparkles + "NemoDash AI" + subtitle
- Tlačítko X (zavřít)

### Zprávy
- User: `bg-indigo-600 text-white rounded-2xl rounded-br-sm`
- AI: `bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm`
- AI avatar: `w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500` s Sparkles ikonou

### Interaktivní karty
- `rounded-xl border`
- Nedoplatek: `bg-red-50 border-red-200`, text `text-red-600`
- Přeplatek: `bg-green-50 border-green-200`
- Tip: `bg-amber-50 border-amber-200`
- Potvrzeno: `bg-green-50 border-green-200`
- Čekající: `bg-amber-50 border-amber-200`

---

## Co NEIMPLEMENTOVAT

- Skutečné AI/LLM napojení (žádné API volání na OpenAI/Anthropic)
- Skutečný file upload na server (soubor se nikam neukládá)
- Skutečné ukládání do databáze (mock — jen změna stavu v UI)
- OCR nebo parsování PDF
- Další scénáře chatu (zatím jen vodné vyúčtování)

---

## Ověření

1. `npm run build` musí projít bez chyb
2. FAB se zobrazí na všech stránkách (/dashboard, /properties, /payments, /inspections, /settings)
3. Chat se otevře kliknutím na FAB, zavře kliknutím na X
4. Demo scénář: klik na 📎 → typing → extrakce → přiřazení → vyúčtování → návrh uložení
5. Kliknutí "Potvrdit" změní stav karty na zelenou s "Potvrzeno"
6. Po potvrzení se zobrazí TenantSettlement s výpočtem (750 × 12 = 9000 vs. 11655 = nedoplatek 2655)
7. Po potvrzení se zobrazí ActionProposal s 5 akcemi
8. Kliknutí "Uložit vše" → zelená konfirmace
9. Kliknutí "Jiná nemovitost" → modal se seznamem všech nemovitostí z mock dat
10. Responsivita: mobil (<640px) → chat fullscreen
11. Všechny texty přes next-intl (žádné hardcoded české texty v JSX)
12. Stávající stránky a funkce zůstanou nedotčeny
