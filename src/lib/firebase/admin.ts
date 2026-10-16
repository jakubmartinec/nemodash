import "server-only";

// Firebase Admin SDK — server čte a zapisuje Firestore a ověřuje přihlášení.
// Klíč servisního účtu je ve Vercelu v proměnné FIREBASE_SERVICE_ACCOUNT (celý JSON).
import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let db: Firestore | undefined;

export function isFirebaseConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT);
}

function adminApp(): App {
  if (getApps().length) return getApp();
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT není nastavený");
  return initializeApp({ credential: cert(JSON.parse(raw)) });
}

export function adminDb(): Firestore {
  if (!db) {
    db = getFirestore(adminApp());
    db.settings({ ignoreUndefinedProperties: true });
  }
  return db;
}

export function adminAuth() {
  return getAuth(adminApp());
}
