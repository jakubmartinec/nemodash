import "server-only";

// Přihlášení přes Firebase Auth → serverová session cookie (httpOnly).
// Role: správce podle ADMIN_PHONES / ADMIN_EMAILS (Vercel), nájemník podle telefonu/e-mailu v kartě nájemníka.
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, isFirebaseConfigured } from "@/lib/firebase/admin";
import { getDataset } from "@/lib/data/store";

export const SESSION_COOKIE = "__session";
export const SESSION_MAX_AGE_S = 14 * 24 * 60 * 60;

export type Role = "admin" | "tenant";

export interface Session {
  uid: string;
  role: Role;
  tenantId?: string;
}

interface Identity {
  phone?: string;
  email?: string; // jen ověřený e-mail
}

// "+420 777 123 456" / "777123456" / "00420…" → "+420777123456"
export function normalizePhone(raw: string): string {
  let p = raw.replace(/[^\d+]/g, "");
  if (p.startsWith("00")) p = `+${p.slice(2)}`;
  if (/^\d{9}$/.test(p)) p = `+420${p}`;
  return p;
}

function envList(name: string, normalize: (v: string) => string): string[] {
  return (process.env[name] ?? "").split(",").map((v) => v.trim()).filter(Boolean).map(normalize);
}

export async function resolveRole({ phone, email }: Identity): Promise<Omit<Session, "uid"> | null> {
  const p = phone ? normalizePhone(phone) : undefined;
  const e = email?.toLowerCase();

  if ((p && envList("ADMIN_PHONES", normalizePhone).includes(p)) ||
      (e && envList("ADMIN_EMAILS", (v) => v.toLowerCase()).includes(e))) {
    return { role: "admin" };
  }

  const { tenants } = await getDataset();
  const tenant = tenants.find(
    (t) => (p && t.phone && normalizePhone(t.phone) === p) || (e && t.email?.toLowerCase() === e)
  );
  return tenant ? { role: "tenant", tenantId: tenant.id } : null;
}

export function identityFromClaims(claims: { phone_number?: string; email?: string; email_verified?: boolean }): Identity {
  return { phone: claims.phone_number, email: claims.email_verified ? claims.email : undefined };
}

export const getSession = cache(async (): Promise<Session | null> => {
  if (!isFirebaseConfigured()) return null;
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const claims = await adminAuth().verifySessionCookie(cookie, true);
    const role = await resolveRole(identityFromClaims(claims));
    return role ? { uid: claims.uid, ...role } : null;
  } catch {
    return null;
  }
});

// Ostrá data smí jen správce. Demo data (bez Firebase) jsou veřejná.
export async function requireAdmin(locale: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const session = await getSession();
  if (!session) redirect(`/${locale}/login`);
  if (session.role !== "admin") redirect(`/${locale}/portal`);
}
