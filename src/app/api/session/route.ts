import { NextResponse, type NextRequest } from "next/server";
import { adminAuth, isFirebaseConfigured } from "@/lib/firebase/admin";
import { identityFromClaims, resolveRole, SESSION_COOKIE, SESSION_MAX_AGE_S } from "@/lib/auth/session";

// Výměna Firebase ID tokenu za session cookie
export async function POST(req: NextRequest) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { idToken } = (await req.json().catch(() => ({}))) as { idToken?: string };
  if (!idToken) return NextResponse.json({ error: "missing_token" }, { status: 400 });

  let claims;
  try {
    claims = await adminAuth().verifyIdToken(idToken, true);
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }
  // Session jen z čerstvého přihlášení
  if (Date.now() / 1000 - claims.auth_time > 5 * 60) {
    return NextResponse.json({ error: "stale_login" }, { status: 401 });
  }

  const role = await resolveRole(identityFromClaims(claims));
  if (!role) return NextResponse.json({ error: "no_access" }, { status: 403 });

  const cookie = await adminAuth().createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_S * 1000 });
  const res = NextResponse.json({ role: role.role });
  res.cookies.set(SESSION_COOKIE, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
  return res;
}

// Odhlášení
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
