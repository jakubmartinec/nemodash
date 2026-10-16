#!/usr/bin/env bash
# Nastavení Firebase pro NemoDash — spustit v Google Cloud Shell (projekt nemodash).
#
#   bash setup-firebase.sh
#
# Co udělá:
#   1. zapne potřebná API
#   2. přihlašování: e-mail odkazem (bez hesla) + telefon/SMS jen pro CZ/SK, povolené domény
#   3. zaregistruje webovou aplikaci a vypíše firebaseConfig
#   4. Firestore pravidla: klient nesmí nic (data čte jen server přes Admin SDK)
#   5. servisní účet pro Vercel (Firestore + Auth) a přístup bez klíče přes Vercel OIDC
#      (Workload Identity Federation — klíče servisních účtů organizace zakazuje)
#
# Skript je idempotentní — dá se pustit opakovaně.
set -euo pipefail

P="${PROJECT_ID:-nemodash}"
SA_NAME="nemodash-vercel"
SA="${SA_NAME}@${P}.iam.gserviceaccount.com"
VERCEL_TEAM="${VERCEL_TEAM:-jakub-martinecs-projects}"
VERCEL_PROJECT="${VERCEL_PROJECT:-nemodash}"
DOMAINS='["localhost","'"$P"'.firebaseapp.com","'"$P"'.web.app","nemodash.yard25.com","nemodash.vercel.app"]'

step() { printf '\n\033[1m== %s\033[0m\n' "$*"; }
ok() { printf '   \033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '   \033[33m!\033[0m %s\n' "$*"; }

gcloud config set project "$P" >/dev/null
TOKEN="$(gcloud auth print-access-token)"
api() { # api METHOD URL [JSON]
  local args=(-sS -X "$1" "$2"
    -H "Authorization: Bearer $TOKEN"
    -H "x-goog-user-project: $P"
    -H "Content-Type: application/json")
  [[ $# -ge 3 ]] && args+=(-d "$3")
  curl "${args[@]}"
}
fail_if_error() { # vypíše chybu z odpovědi API a vrátí 1
  if jq -e '.error' >/dev/null 2>&1 <<<"$1"; then
    warn "$(jq -r '.error.message' <<<"$1")"
    return 1
  fi
}

step "1/5 API"
gcloud services enable \
  firebase.googleapis.com identitytoolkit.googleapis.com \
  firestore.googleapis.com firebaserules.googleapis.com iam.googleapis.com \
  iamcredentials.googleapis.com sts.googleapis.com
ok "zapnuto"

step "2/5 Přihlašování"
AUTH="https://identitytoolkit.googleapis.com/admin/v2/projects/$P/config"
R="$(api PATCH "$AUTH?updateMask=signIn.email,signIn.phoneNumber,authorizedDomains" '{
  "signIn": {
    "email": { "enabled": true, "passwordRequired": false },
    "phoneNumber": { "enabled": true }
  },
  "authorizedDomains": '"$DOMAINS"'
}')"
fail_if_error "$R" && ok "e-mail odkazem + telefon zapnuty, domény: $(jq -r '.authorizedDomains | join(", ")' <<<"$R")"

# SMS jen na česká a slovenská čísla — ochrana proti zneužití SMS (platí se za každou)
R="$(api PATCH "$AUTH?updateMask=smsRegionConfig" '{
  "smsRegionConfig": { "allowlistOnly": { "allowedRegions": ["CZ", "SK"] } }
}')"
fail_if_error "$R" && ok "SMS povoleny jen pro CZ a SK" || warn "omezení SMS regionů nastavte ručně (Authentication → Settings → SMS region policy)"

step "3/5 Webová aplikace"
FB="https://firebase.googleapis.com/v1beta1"
APP_ID="$(api GET "$FB/projects/$P/webApps" | jq -r '[.apps[]? | select(.state == "ACTIVE")][0].appId // empty')"
if [[ -z "$APP_ID" ]]; then
  OP="$(api POST "$FB/projects/$P/webApps" '{"displayName":"nemodash-web"}')"
  fail_if_error "$OP" || exit 1
  OP_NAME="$(jq -r '.name' <<<"$OP")"
  for _ in $(seq 1 30); do
    OP="$(api GET "$FB/$OP_NAME")"
    [[ "$(jq -r '.done // false' <<<"$OP")" == "true" ]] && break
    sleep 2
  done
  APP_ID="$(jq -r '.response.appId' <<<"$OP")"
  ok "vytvořena nemodash-web ($APP_ID)"
else
  ok "už existuje ($APP_ID)"
fi
FIREBASE_CONFIG="$(api GET "$FB/projects/$P/webApps/$APP_ID/config" | jq -c '{apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId}')"

step "4/5 Firestore pravidla"
RULES=$'rules_version = \'2\';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    // Data čte a zapisuje jen server (Admin SDK), prohlížeč nesmí nic.\n    match /{document=**} {\n      allow read, write: if false;\n    }\n  }\n}\n'
RS="$(api POST "https://firebaserules.googleapis.com/v1/projects/$P/rulesets" \
  "$(jq -n --arg c "$RULES" '{source: {files: [{name: "firestore.rules", content: $c}]}}')")"
fail_if_error "$RS" || exit 1
RS_NAME="$(jq -r '.name' <<<"$RS")"
REL="projects/$P/releases/cloud.firestore"
R="$(api POST "https://firebaserules.googleapis.com/v1/projects/$P/releases" \
  "$(jq -n --arg n "$REL" --arg r "$RS_NAME" '{name: $n, rulesetName: $r}')")"
if jq -e '.error.status == "ALREADY_EXISTS"' >/dev/null <<<"$R"; then
  R="$(api PATCH "https://firebaserules.googleapis.com/v1/$REL" \
    "$(jq -n --arg n "$REL" --arg r "$RS_NAME" '{release: {name: $n, rulesetName: $r}}')")"
fi
fail_if_error "$R" && ok "nasazena (vše zakázáno pro klienty)"

step "5/5 Přístup z Vercelu (bez klíče, přes OIDC)"
if ! gcloud iam service-accounts describe "$SA" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$SA_NAME" --display-name="NemoDash – Vercel server" >/dev/null
fi
for ROLE in roles/datastore.user roles/firebaseauth.admin; do
  # čerstvě založený účet IAM chvíli nezná — zkoušíme až ~1 min
  for TRY in $(seq 1 12); do
    gcloud projects add-iam-policy-binding "$P" --member="serviceAccount:$SA" --role="$ROLE" \
      --condition=None >/dev/null 2>/tmp/iamerr && break
    [[ $TRY -eq 12 ]] && { cat /tmp/iamerr; exit 1; }
    sleep 5
  done
done
ok "$SA (Firestore + Auth)"

# Vercel se prokazuje svým OIDC tokenem; Google ho vymění za token servisního účtu.
PN="$(gcloud projects describe "$P" --format='value(projectNumber)')"
if ! gcloud iam workload-identity-pools describe vercel --location=global >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create vercel --location=global --display-name="Vercel" >/dev/null
fi
if ! gcloud iam workload-identity-pools providers describe vercel --location=global \
     --workload-identity-pool=vercel >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers create-oidc vercel --location=global \
    --workload-identity-pool=vercel --display-name="Vercel" \
    --issuer-uri="https://oidc.vercel.com/$VERCEL_TEAM" \
    --allowed-audiences="https://vercel.com/$VERCEL_TEAM" \
    --attribute-mapping="google.subject=assertion.sub,attribute.project=assertion.project" \
    --attribute-condition="assertion.project == '$VERCEL_PROJECT'" >/dev/null
fi
gcloud iam service-accounts add-iam-policy-binding "$SA" --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$PN/locations/global/workloadIdentityPools/vercel/attribute.project/$VERCEL_PROJECT" \
  >/dev/null
ok "Vercel projekt $VERCEL_TEAM/$VERCEL_PROJECT smí jednat jako $SA_NAME"

step "Hotovo"
cat <<EOF

Ve Vercelu (nemodash › Settings):
  1) Security › „Secure Backend Access with OIDC Federation“ musí být zapnuté (Team issuer)
  2) Environment Variables › ADMIN_PHONES = vaše číslo (+420…), Production + Preview

Firebase konfigurace pro web (není tajná, už je v aplikaci):
   $FIREBASE_CONFIG

Ručně v konzoli zbývá jen Google přihlášení: Authentication › Sign-in method › Google › Enable
EOF
