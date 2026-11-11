"use client";

// Firebase v prohlížeči — jen přihlašování. Data čte výhradně server.
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Veřejná konfigurace webové aplikace (není tajná, přístup hlídají pravidla a server)
const firebaseConfig = {
  apiKey: "AIzaSyBfujGV_GA85MpPpg0RwLu7SdqAEy6k_es",
  authDomain: "nemodash.firebaseapp.com",
  projectId: "nemodash",
  storageBucket: "nemodash.firebasestorage.app",
  messagingSenderId: "986537155019",
  appId: "1:986537155019:web:d96ac1e84785944a7a3e4e",
};

export function firebaseAuth() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  auth.useDeviceLanguage();
  return auth;
}
