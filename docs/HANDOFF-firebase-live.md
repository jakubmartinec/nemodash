# Předávka: ostrý provoz s Firebase (PR #4)

Stav k 16. 10. 2026 (večer). Pro novou session Claude Code s připojeným **Vercel** konektorem
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

## Vyřešeno 16. 10. 2026

- **500 na náhledu:** `firebase-admin/auth` → `jwks-rsa` dělal `require('jose')`, ale `jose` 6 je jen ESM
  a runtime Vercelu `require()` ES modulu nepovolí (`ERR_REQUIRE_ESM`). Oprava: `overrides` v
  `package.json` vrací `jwks-rsa` na `jose ^4.15.9` (má CJS). Lokální reprodukce:
  `node --no-experimental-require-module node_modules/next/dist/bin/next start`.
- **Přihlášení SMS:** ověřeno na náhledu, OIDC → Firestore funguje. Předvolba je samostatný výběr
  (CZ/SK), automaticky vyplněné číslo v jakémkoli tvaru se rozpozná (`src/lib/phone.ts`).

## Dokumenty (fotky vyúčtování apod.)

- Bucket `gs://nemodash-dokumenty` (europe-west3, uniform access, public access prevention,
  soft delete 7 dní) — založený. Název je v `DOCUMENTS_BUCKET` (`src/lib/firebase/admin.ts`).
- **Chybí právo:** servisní účet potřebuje `roles/storage.objectAdmin` jen na tento bucket —
  krok 6 v `scripts/setup-firebase.sh` (stačí pustit celý skript znovu, je idempotentní).
- Server: `POST /api/documents` (jen správce, typ podle obsahu, max. 4 MB),
  `GET|PATCH|DELETE /api/documents/[id]`. Nájemník stáhne jen dokument s `sharedWithTenant`
  a svým `tenantId`; jinak 404.
- Prohlížeč fotku zmenší na 2400 px JPEG (`src/lib/image-upload.ts`) — tím zmizí EXIF i GPS.
- UI: záložka Dokumenty (nahrát, otevřít, stáhnout, zpřístupnit/skrýt, smazat), u vyúčtování
  „Přiložit doklad“, v portálu nájemníka doklady u vyúčtování.

## Další kroky

1. Uživatel pustí `scripts/setup-firebase.sh` v Cloud Shell (krok 6 — právo na bucket).
2. Uživatel zadá ostrá data: Nastavení (pronajímatel), nemovitost Nerudova 435 (Nový Bor),
   nájemnici, vyúčtování vody, přiloží fotku faktury. Údaje **nikdy necommitovat**.
3. Ověřit v portálu (`/cs/portal?tenant=<id>` jako správce), že nájemnice doklad vidí.
4. Když vše funguje: PR #4 z draftu do ready, uživatel mergne → produkce přejde na ostrá data.
   Návrat: Vercel Instant Rollback.

Známé drobnosti mimo PR: stránky pod `(admin)` volají `getDataset()` souběžně s kontrolou
přihlášení v layoutu (nepřihlášený požadavek zbytečně čte Firestore; data neodcházejí).

## Užitečné

- Firebase konzole: projekt `nemodash`; Cloud Shell má uživatel k dispozici (vlastník projektu).
- Přidání domény k přihlášení: viz `DOMAINS` v `scripts/setup-firebase.sh` (PATCH `authorizedDomains`).
- AI asistent je s ostrými daty skrytý (prototyp nad demo daty).
