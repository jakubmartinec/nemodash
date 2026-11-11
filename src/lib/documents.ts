// Pravidla pro nahrané dokumenty — sdílí je prohlížeč i server
import type { DocumentCategory, PropertyDocument } from "@/lib/types";

// Vercel přijme požadavek do 4,5 MB; fotky se v prohlížeči zmenší hluboko pod limit
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const DOCUMENT_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
} as const;

export type DocumentMime = keyof typeof DOCUMENT_TYPES;

export const DOCUMENT_CATEGORIES: readonly DocumentCategory[] = [
  "invoice",
  "contract",
  "inspection",
  "insurance",
  "photo",
  "other",
];

// Typ podle obsahu souboru, ne podle přípony nebo hlavičky od klienta
export function sniffMime(head: Uint8Array): DocumentMime | undefined {
  const starts = (...bytes: number[]) => bytes.every((b, i) => head[i] === b);
  const ascii = (from: number, to: number) => String.fromCharCode(...head.subarray(from, to));
  if (starts(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(0, 5) === "%PDF-") return "application/pdf";
  return undefined;
}

// Správce vidí vše, nájemník jen dokumenty, které mu správce zpřístupnil
export function canViewDocument(
  session: { role: "admin" | "tenant"; tenantId?: string },
  doc: Pick<PropertyDocument, "tenantId" | "sharedWithTenant">
): boolean {
  if (session.role === "admin") return true;
  return doc.sharedWithTenant === true && !!doc.tenantId && doc.tenantId === session.tenantId;
}

export const documentUrl = (id: string, download = false) =>
  `/api/documents/${id}${download ? "?download=1" : ""}`;
