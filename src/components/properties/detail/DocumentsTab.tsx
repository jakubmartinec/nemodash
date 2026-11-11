"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  FileText,
  FileImage,
  FileCheck,
  Shield,
  Receipt,
  File,
  Upload,
  Download,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PropertyDocument, DocumentCategory, Tenant, UtilitySettlement } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { documentUrl } from "@/lib/documents";
import DocumentUploadForm from "@/components/documents/DocumentUploadForm";

interface DocumentsTabProps {
  propertyId: string;
  documents: PropertyDocument[];
  tenants: Tenant[];
  settlements: UtilitySettlement[];
}

function CategoryIcon({ category, className }: { category: DocumentCategory; className?: string }) {
  const cls = cn("h-4 w-4 shrink-0", className);
  switch (category) {
    case "contract": return <FileText className={cls} />;
    case "inspection": return <FileCheck className={cls} />;
    case "insurance": return <Shield className={cls} />;
    case "invoice": return <Receipt className={cls} />;
    case "photo": return <FileImage className={cls} />;
    default: return <File className={cls} />;
  }
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const badge = "text-xs font-medium px-1.5 py-0.5 rounded border border-border bg-muted text-muted-foreground";
const iconButton =
  "shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50";

export default function DocumentsTab({ propertyId, documents, tenants, settlements }: DocumentsTabProps) {
  const t = useTranslations("properties");
  const tDoc = useTranslations("documents");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ?settlement=<id> — přišli jsme z vyúčtování přes „Přiložit doklad“
  const settlementParam = searchParams.get("settlement") ?? undefined;
  const [uploading, setUploading] = useState(!!settlementParam);
  const [busyId, setBusyId] = useState<string>();
  const [error, setError] = useState("");

  const tenantName = (id?: string) => tenants.find((x) => x.id === id)?.name;

  async function mutate(doc: PropertyDocument, init: RequestInit) {
    setBusyId(doc.id);
    setError("");
    try {
      const res = await fetch(documentUrl(doc.id), init);
      if (!res.ok) throw new Error(String(res.status));
      router.refresh();
    } catch {
      setError(tDoc("errors.generic"));
    } finally {
      setBusyId(undefined);
    }
  }

  const toggleShare = (doc: PropertyDocument) =>
    mutate(doc, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sharedWithTenant: !doc.sharedWithTenant }),
    });

  function remove(doc: PropertyDocument) {
    if (window.confirm(tDoc("confirmDelete", { name: doc.name }))) mutate(doc, { method: "DELETE" });
  }

  const uploadButton = (
    <button
      type="button"
      onClick={() => setUploading(true)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      <Upload className="h-3.5 w-3.5" />
      {t("uploadDocument")}
    </button>
  );

  const form = uploading && (
    <DocumentUploadForm
      propertyId={propertyId}
      tenants={tenants}
      settlements={settlements}
      initialSettlementId={settlementParam}
      onDone={() => {
        setUploading(false);
        if (settlementParam) router.replace("?tab=documents", { scroll: false });
      }}
    />
  );

  if (documents.length === 0) {
    return (
      <div className="space-y-4">
        {form || (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <File className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground max-w-sm">{t("noDocumentsForProp")}</p>
            {uploadButton}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Záhlaví */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">{t("documentCount", { count: documents.length })}</p>
        {!uploading && uploadButton}
      </div>

      {form}

      {error && (
        <p role="alert" className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {/* Seznam dokumentů */}
      <div className="space-y-2">
        {documents.map((doc) => {
          const busy = busyId === doc.id;
          const tenant = tenantName(doc.tenantId);
          return (
            <div
              key={doc.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 hover:bg-muted/30 transition-colors"
            >
              <div className="shrink-0 h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground mt-0.5">
                <CategoryIcon category={doc.category} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  {doc.storagePath ? (
                    <a
                      href={documentUrl(doc.id)}
                      target="_blank"
                      rel="noopener"
                      className="text-sm font-medium leading-tight break-all text-brand-text hover:underline"
                    >
                      {doc.name}
                    </a>
                  ) : (
                    <p className="text-sm font-medium leading-tight break-all">{doc.name}</p>
                  )}

                  {doc.storagePath && (
                    <div className="flex items-center gap-0.5">
                      {doc.tenantId && (
                        <button
                          type="button"
                          onClick={() => toggleShare(doc)}
                          disabled={busy}
                          title={doc.sharedWithTenant ? tDoc("shareOff") : tDoc("shareOn")}
                          aria-label={doc.sharedWithTenant ? tDoc("shareOff") : tDoc("shareOn")}
                          className={iconButton}
                        >
                          {doc.sharedWithTenant ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      )}
                      <a
                        href={documentUrl(doc.id, true)}
                        title={tDoc("download")}
                        aria-label={tDoc("download")}
                        className={iconButton}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => remove(doc)}
                        disabled={busy}
                        title={tDoc("delete")}
                        aria-label={tDoc("delete")}
                        className={cn(iconButton, "hover:text-danger")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className={badge}>{t(`documentCategory.${doc.category}` as Parameters<typeof t>[0])}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(doc.uploadedAt, locale)}</span>
                  {doc.size && <span className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</span>}
                  {tenant && <span className="text-xs text-muted-foreground">{tenant}</span>}
                  {doc.tenantId && (
                    <span className={cn(badge, "inline-flex items-center gap-1")}>
                      {doc.sharedWithTenant ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {doc.sharedWithTenant ? tDoc("shared") : tDoc("notShared")}
                    </span>
                  )}
                </div>

                {doc.notes && <p className="mt-1.5 text-xs text-muted-foreground">{doc.notes}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
