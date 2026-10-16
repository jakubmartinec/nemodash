import "server-only";

// Serverový přístup k Firestore a Firebase Auth.
// Na Vercelu bez klíče: Vercel OIDC token → Workload Identity Federation → servisní účet nemodash-vercel
// (nastavuje scripts/setup-firebase.sh). Klíč v FIREBASE_SERVICE_ACCOUNT je jen záložní varianta.
import { cert, getApp, getApps, initializeApp, type App, type Credential } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { Firestore } from "@google-cloud/firestore";
import { ExternalAccountClient, JWT, type AuthClient } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/oidc";

const PROJECT_ID = "nemodash";
const PROJECT_NUMBER = "986537155019";
const SERVICE_ACCOUNT = `nemodash-vercel@${PROJECT_ID}.iam.gserviceaccount.com`;
const WIF_AUDIENCE = `//iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/vercel/providers/vercel`;

// Privátní bucket na nahrané dokumenty (europe-west3, zakládá scripts/setup-firebase.sh)
export const DOCUMENTS_BUCKET = "nemodash-dokumenty";

let db: Firestore | undefined;
let federated: AuthClient | undefined;
let restClient: AuthClient | undefined;

// Ostrá data: na Vercelu (nebo s klíčem). Rozhoduje se při buildu v next.config.ts.
export function isFirebaseConfigured(): boolean {
  return process.env.NEXT_PUBLIC_LIVE_DATA === "1";
}

function serviceAccountKey(): { project_id?: string; client_email: string; private_key: string } | undefined {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  return raw ? JSON.parse(raw) : undefined;
}

function federatedClient(): AuthClient {
  if (!federated) {
    const client = ExternalAccountClient.fromJSON({
      type: "external_account",
      audience: WIF_AUDIENCE,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${SERVICE_ACCOUNT}:generateAccessToken`,
      subject_token_supplier: { getSubjectToken: () => getVercelOidcToken() },
    });
    if (!client) throw new Error("Nepodařilo se vytvořit federovaného klienta Google Cloud");
    federated = client;
  }
  return federated;
}

// Firebase Admin potřebuje jen přístupový token — dodá ho federovaný klient
function federatedCredential(): Credential {
  return {
    async getAccessToken() {
      const client = federatedClient();
      const { token } = await client.getAccessToken();
      if (!token) throw new Error("Google Cloud nevrátil přístupový token");
      const expiry = client.credentials.expiry_date;
      return { access_token: token, expires_in: expiry ? Math.floor((expiry - Date.now()) / 1000) : 3000 };
    },
  };
}

function adminApp(): App {
  if (getApps().length) return getApp();
  const key = serviceAccountKey();
  return initializeApp({
    projectId: PROJECT_ID,
    credential: key ? cert({ projectId: key.project_id, clientEmail: key.client_email, privateKey: key.private_key }) : federatedCredential(),
  });
}

export function adminDb(): Firestore {
  if (!db) {
    const key = serviceAccountKey();
    db = new Firestore({
      projectId: PROJECT_ID,
      ignoreUndefinedProperties: true,
      ...(key
        ? { credentials: { client_email: key.client_email, private_key: key.private_key } }
        : { authClient: federatedClient() }),
    });
  }
  return db;
}

export function adminAuth() {
  return getAuth(adminApp());
}

// Přístupový token pro REST API Google Cloud (Cloud Storage)
export async function adminAccessToken(): Promise<string> {
  if (!restClient) {
    const key = serviceAccountKey();
    restClient = key
      ? new JWT({
          email: key.client_email,
          key: key.private_key,
          scopes: ["https://www.googleapis.com/auth/cloud-platform"],
        })
      : federatedClient();
  }
  const { token } = await restClient.getAccessToken();
  if (!token) throw new Error("Google Cloud nevrátil přístupový token");
  return token;
}
