import { NextResponse, type NextRequest } from "next/server";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import { deleteObject, getObject } from "@/lib/firebase/storage";
import { getSession } from "@/lib/auth/session";
import { COLLECTIONS } from "@/lib/data/store";
import { canViewDocument } from "@/lib/documents";
import type { PropertyDocument } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

async function loadDocument(id: string) {
  if (!/^[A-Za-z0-9]{1,64}$/.test(id)) return undefined;
  const ref = adminDb().collection(COLLECTIONS.documents).doc(id);
  const snap = await ref.get();
  return snap.exists ? { ref, doc: { ...snap.data(), id } as PropertyDocument } : undefined;
}

// Zobrazení / stažení — správce, nebo nájemník u dokumentu, který mu byl zpřístupněn.
// Cizí i neexistující dokument vrací stejně 404, aby nešlo zjišťovat, co existuje.
export async function GET(req: NextRequest, { params }: Ctx) {
  const notFound = () => new NextResponse(null, { status: 404 });
  if (!isFirebaseConfigured()) return notFound();
  const session = await getSession();
  if (!session) return notFound();

  const found = await loadDocument((await params).id);
  if (!found?.doc.storagePath || !canViewDocument(session, found.doc)) return notFound();
  const { doc } = found;

  let upstream: Response;
  try {
    upstream = await getObject(doc.storagePath!);
  } catch (err) {
    console.error("Načtení dokumentu selhalo", err);
    return new NextResponse(null, { status: 502 });
  }

  const disposition = req.nextUrl.searchParams.has("download") ? "attachment" : "inline";
  const headers = new Headers({
    "Content-Type": doc.mimeType ?? "application/octet-stream",
    "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(doc.name)}`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);
  return new NextResponse(upstream.body, { headers });
}

async function requireAdmin() {
  if (!isFirebaseConfigured()) return fail("demo", 403);
  const session = await getSession();
  return session?.role === "admin" ? undefined : fail("forbidden", 403);
}

// Zpřístupnit / skrýt před nájemníkem
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const found = await loadDocument((await params).id);
  if (!found) return fail("notFound", 404);

  const body = (await req.json().catch(() => ({}))) as { sharedWithTenant?: unknown };
  if (typeof body.sharedWithTenant !== "boolean" || !found.doc.tenantId) return fail("required", 400);
  await found.ref.update({ sharedWithTenant: body.sharedWithTenant });
  return NextResponse.json({ ok: true });
}

// Smazání — v bucketu zůstane 7 dní obnovitelná kopie (soft delete)
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const found = await loadDocument((await params).id);
  if (!found) return fail("notFound", 404);

  try {
    if (found.doc.storagePath) await deleteObject(found.doc.storagePath);
    await found.ref.delete();
  } catch (err) {
    console.error("Smazání dokumentu selhalo", err);
    return fail("generic", 500);
  }
  return NextResponse.json({ ok: true });
}
