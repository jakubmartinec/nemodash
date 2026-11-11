import { NextResponse, type NextRequest } from "next/server";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import { deleteObject, putObject } from "@/lib/firebase/storage";
import { getSession } from "@/lib/auth/session";
import { COLLECTIONS, getDataset } from "@/lib/data/store";
import { propertyById, tenantById } from "@/lib/data/selectors";
import { DOCUMENT_CATEGORIES, DOCUMENT_TYPES, MAX_UPLOAD_BYTES, sniffMime } from "@/lib/documents";
import type { DocumentCategory, PropertyDocument } from "@/lib/types";

// Chyby jako klíče překladů documents.errors.*
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

const field = (fd: FormData, name: string) => String(fd.get(name) ?? "").trim() || undefined;

// Jen název souboru, bez cesty a řídicích znaků
function displayName(raw: string): string {
  const name = raw.split(/[\\/]/).pop()!.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return name.slice(0, 120) || "dokument";
}

// Nahrání dokumentu k nemovitosti — jen správce
export async function POST(req: NextRequest) {
  if (!isFirebaseConfigured()) return fail("demo", 403);
  const session = await getSession();
  if (session?.role !== "admin") return fail("forbidden", 403);

  const fd = await req.formData().catch(() => null);
  const file = fd?.get("file");
  if (!fd || !(file instanceof File) || file.size === 0) return fail("required", 400);
  if (file.size > MAX_UPLOAD_BYTES) return fail("tooLarge", 413);

  const bytes = await file.arrayBuffer();
  const mime = sniffMime(new Uint8Array(bytes, 0, Math.min(16, bytes.byteLength)));
  if (!mime) return fail("unsupportedType", 415);

  const ds = await getDataset();
  const propertyId = field(fd, "propertyId");
  if (!propertyId || !propertyById(ds, propertyId)) return fail("notFound", 404);

  const category = field(fd, "category") as DocumentCategory | undefined;
  if (!category || !DOCUMENT_CATEGORIES.includes(category)) return fail("required", 400);

  // Doklad k vyúčtování patří nájemníkovi z vyúčtování
  const settlementId = field(fd, "settlementId");
  let tenantId = field(fd, "tenantId");
  if (settlementId) {
    const settlement = ds.settlements.find((s) => s.id === settlementId);
    if (settlement?.propertyId !== propertyId) return fail("notFound", 404);
    tenantId = settlement.tenantId;
  }
  if (tenantId && tenantById(ds, tenantId)?.propertyId !== propertyId) return fail("notFound", 404);

  const ref = adminDb().collection(COLLECTIONS.documents).doc();
  const storagePath = `properties/${propertyId}/${ref.id}.${DOCUMENT_TYPES[mime]}`;
  const doc: Omit<PropertyDocument, "id"> = {
    propertyId,
    name: displayName(file.name),
    category,
    relatedId: settlementId,
    tenantId,
    sharedWithTenant: !!tenantId && fd.get("shared") === "on",
    storagePath,
    uploadedAt: new Date().toISOString(),
    size: file.size,
    mimeType: mime,
    notes: field(fd, "notes"),
  };

  try {
    await putObject(storagePath, bytes, mime);
    try {
      await ref.set(doc);
    } catch (err) {
      await deleteObject(storagePath).catch(() => {});
      throw err;
    }
  } catch (err) {
    console.error("Nahrání dokumentu selhalo", err);
    return fail("generic", 500);
  }
  return NextResponse.json({ id: ref.id }, { status: 201 });
}
