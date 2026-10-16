"use client";

import { useRef } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PropertyDocument, DocumentCategory } from "@/lib/types";
import { formatDate } from "@/lib/format";

interface DocumentsTabProps {
  documents: PropertyDocument[];
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

export default function DocumentsTab({ documents }: DocumentsTabProps) {
  const t = useTranslations("properties");
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Prototyp: soubor se nevkládá nikam, jen zobrazíme alert
    alert(`Prototyp: Soubor „${file.name}" by byl nahrán do Firebase Storage. Napojení přijde později.`);
    e.target.value = "";
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <File className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground max-w-sm">
          {t("noDocumentsForProp")}
        </p>
        <button
          type="button"
          onClick={handleUploadClick}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Upload className="h-3.5 w-3.5" />
          {t("uploadDocument")}
        </button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Záhlaví */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {t("documentCount", { count: documents.length })}
        </p>
        <button
          type="button"
          onClick={handleUploadClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Upload className="h-3.5 w-3.5" />
          {t("uploadDocument")}
        </button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Seznam dokumentů */}
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 hover:bg-muted/30 transition-colors"
          >
            {/* Ikona */}
            <div className="shrink-0 h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground mt-0.5">
              <CategoryIcon category={doc.category} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <p className="text-sm font-medium leading-tight break-all">{doc.name}</p>
                <button
                  type="button"
                  title="Stáhnout"
                  className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className={"text-xs font-medium px-1.5 py-0.5 rounded border border-border bg-muted text-muted-foreground"}>
                  {t(`documentCategory.${doc.category}` as Parameters<typeof t>[0])}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(doc.uploadedAt, locale)}</span>
                {doc.size && (
                  <span className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</span>
                )}
              </div>

              {doc.notes && (
                <p className="mt-1.5 text-xs text-muted-foreground">{doc.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
