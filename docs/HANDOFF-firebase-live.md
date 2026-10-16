# Předávka: ostrý provoz s Firebase (PR #4)

Stav k 16. 10. 2026. Pro novou session Claude Code s připojeným **Vercel** konektorem
(ideálně i `gcp-nemodash`). Repo je **veřejné** — žádná osobní data ani tajné hodnoty do gitu.

## Kde to je

- Větev `claude/property-manager-setup-7qNdh`, PR **#4** → `main` (zatím nemergovat).
- Produkce `nemodash.yard25.com` běží z `main` (zatím demo data) — PR ji nemění.
- Náhled PR: `https://nemodash-git-claude-property-ma-5ec480-jakub-martinecs-projects.vercel.app`
  (chráněný Vercel Authentication).

## Co je hotové

| Oblast | Stav |
|---|---|
| GCP projekt `nemodash` (číslo 986537155019) | Firestore `(default)` v `europe-west3`, pravidla „klient nesmí nic“ |
| Firebase Auth | e-mail odkazem, telefon (SMS jen CZ/SK), Google zatím **nezapnutý**; povolené domény vč. náhledu |
| Webová aplikace Firebase | konfigurace je v `src/lib/firebase/client.ts` (veřejná) |
| Přístup serveru | bez klíče: Vercel OIDC (team issuer `https://oidc.vercel.com/jakub-martinecs-projects`) → Workload Identity pool `vercel` / provider `vercel` (podmínka `assertion.project == 'nemodash'`) → SA `nemodash-vercel@nemodash.iam.gserviceaccount.com` (role `datastore.user`, `firebaseauth.admin`). Klíče SA organizace zakazuje. |
| Vercel | OIDC federace zapnutá (Team), `ADMIN_PHONES` nastavené pro Production + Preview |
| Kód | datová vrstva `src/lib/data/*`, přihlášení `src/lib/auth/session.ts` + `src/app/api/session`, `LoginForm`, portál `/portal`, formuláře (nemovitost, nájemník, vyúčtování, pronajímatel) |
| Setup skript | `scripts/setup-firebase.sh` (Cloud Shell, idempotentní) — už proběhl celý |

Režim dat: `next.config.ts` nastaví `NEXT_PUBLIC_LIVE_DATA=1` při buildu na Vercelu (`VERCEL=1`)
nebo s `FIREBASE_SERVICE_ACCOUNT`; lokálně běží demo data, `NEMODASH_DEMO=1` vynutí demo.

## Aktuální problém: náhled vrací 500

Nasazení `GTV9shCYw` (commit `d779791`, redeploy bez cache) — build prošel, ale stránka
(i `/` a `/cs/login`) vrací **500 Internal Server Error**. Runtime log zatím nikdo neviděl.

Pozorování: `/cs/login` bez cookie Firestore vůbec nevolá (`getSession` vrátí `null` dřív),
přesto padá → nejpravděpodobněji selže **načtení serverového modulu**.

Hypotézy (od nejpravděpodobnější):

1. `src/lib/firebase/admin.ts` importuje na nejvyšší úrovni `@google-cloud/firestore`,
   `google-auth-library` a `@vercel/oidc`; `session.ts` ho importuje na každé stránce.
   Při bundlování/trasování pro Vercel funkce může chybět soubor (google-gax/protobuf
   `.proto`/`.json`) → pád při `require`. Oprava: v `next.config.ts` přidat
   `serverExternalPackages: ["@google-cloud/firestore", "google-gax", "google-auth-library", "@vercel/oidc", "firebase-admin"]`
   a/nebo importy Firestore/OIDC v `admin.ts` udělat líně (`await import(...)` uvnitř `adminDb()`).
2. Chyba v `getSession()` / `cookies()` během renderu (méně pravděpodobné).
3. Chyba až při volání Google (OIDC → STS) — to by ale nemělo nastat bez cookie.

## Postup v nové session

1. **Logy:** Vercel MCP `get_runtime_logs` / `get_runtime_errors` pro projekt `nemodash`
   (team `jakub-martinecs-projects`), nasazení náhledu větve. Najít stack trace 500.
2. **Lokální reprodukce:** `VERCEL=1 npm run build && ADMIN_PHONES=+420000000000 npx next start -p 3125`,
   pak `curl -i localhost:3125/cs/login`. (Lokálně OIDC token chybí — `/cs/login` bez cookie
   ale musí vrátit 200.)
3. **Oprava** podle logu, ověřit `tsc`, `npm run lint`, `npm run build`, demo režim (`npm run build`
   bez `VERCEL`) i lokální „live“ build. Commit + push na větev → Vercel nasadí náhled sám.
4. **Ověření na náhledu:** Vercel MCP `web_fetch_vercel_url` (obejde ochranu náhledu):
   `/cs/login` musí vrátit 200 a přihlašovací formulář; `POST /api/session` bez těla → 400.
   Pak `get_runtime_logs`, že při načtení dat (po přihlášení) projde OIDC → Firestore.
5. **Uživatel otestuje** přihlášení SMS na svém čísle (je v `ADMIN_PHONES`) a zadá ostrá data
   ve formulářích: Nastavení (pronajímatel), nemovitost Nerudova 435 (Nový Bor), nájemnici,
   vyúčtování vody. Údaje dodá uživatel — **nikdy je necommitovat**.
6. Když vše funguje: PR #4 z draftu do ready, uživatel mergne → produkce přejde na ostrá data.
   Případný návrat: Vercel Instant Rollback.

## Užitečné

- Firebase konzole: projekt `nemodash`; Cloud Shell má uživatel k dispozici (vlastník projektu).
- Přidání domény k přihlášení: viz `DOMAINS` v `scripts/setup-firebase.sh` (PATCH `authorizedDomains`).
- AI asistent je s ostrými daty skrytý (prototyp nad demo daty).
