import "server-only";

// Cloud Storage přes JSON API — soubory čte a zapisuje jen server, bucket není veřejný
import { adminAccessToken, DOCUMENTS_BUCKET } from "./admin";

const API = "https://storage.googleapis.com";
const objectUrl = (path: string) => `${API}/storage/v1/b/${DOCUMENTS_BUCKET}/o/${encodeURIComponent(path)}`;

async function call(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${await adminAccessToken()}`);
  return fetch(url, { ...init, headers, cache: "no-store" });
}

async function fail(op: string, res: Response): Promise<never> {
  throw new Error(`Cloud Storage ${op} ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

// ifGenerationMatch=0 — existující objekt se nikdy nepřepíše
export async function putObject(path: string, data: ArrayBuffer, contentType: string): Promise<void> {
  const url = `${API}/upload/storage/v1/b/${DOCUMENTS_BUCKET}/o?uploadType=media&ifGenerationMatch=0&name=${encodeURIComponent(path)}`;
  const res = await call(url, { method: "POST", headers: { "Content-Type": contentType }, body: data });
  if (!res.ok) await fail("upload", res);
}

export async function getObject(path: string): Promise<Response> {
  const res = await call(`${objectUrl(path)}?alt=media`);
  if (!res.ok) await fail("download", res);
  return res;
}

export async function deleteObject(path: string): Promise<void> {
  const res = await call(objectUrl(path), { method: "DELETE" });
  if (!res.ok && res.status !== 404) await fail("delete", res);
}
