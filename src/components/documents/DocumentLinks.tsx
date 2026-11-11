import { FileImage, FileText } from "lucide-react";
import { documentUrl } from "@/lib/documents";
import type { PropertyDocument } from "@/lib/types";

// Odkazy na nahrané doklady (otevřou se v nové kartě přes server, který ověří přístup)
export default function DocumentLinks({ documents, title }: { documents: PropertyDocument[]; title?: string }) {
  const files = documents.filter((d) => d.storagePath);
  if (files.length === 0) return null;
  return (
    <div className="space-y-1.5">
      {title && <p className="text-xs font-medium text-muted-foreground">{title}</p>}
      <ul className="flex flex-wrap gap-2">
        {files.map((d) => {
          const Icon = d.mimeType?.startsWith("image/") ? FileImage : FileText;
          return (
            <li key={d.id} className="min-w-0">
              <a
                href={documentUrl(d.id)}
                target="_blank"
                rel="noopener"
                className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-brand-text hover:bg-muted"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{d.name}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
