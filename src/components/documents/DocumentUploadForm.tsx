"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { inputClass } from "@/components/forms/FormKit";
import { formatDate } from "@/lib/format";
import { prepareUpload } from "@/lib/image-upload";
import { DOCUMENT_CATEGORIES, MAX_UPLOAD_BYTES } from "@/lib/documents";
import type { DocumentCategory, Tenant, UtilitySettlement } from "@/lib/types";

const ERRORS = ["demo", "forbidden", "required", "notFound", "tooLarge", "unsupportedType", "generic"];

interface DocumentUploadFormProps {
  propertyId: string;
  tenants: Tenant[];
  settlements: UtilitySettlement[];
  initialSettlementId?: string;
  onDone: () => void;
}

export default function DocumentUploadForm({
  propertyId,
  tenants,
  settlements,
  initialSettlementId,
  onDone,
}: DocumentUploadFormProps) {
  const t = useTranslations("documents");
  const tProp = useTranslations("properties");
  const tSet = useTranslations("settlement");
  const locale = useLocale();
  const router = useRouter();

  const initial = settlements.find((s) => s.id === initialSettlementId);
  const [settlementId, setSettlementId] = useState(initial?.id ?? "");
  const [tenantId, setTenantId] = useState(initial?.tenantId ?? "");
  const [category, setCategory] = useState<DocumentCategory>(initial ? "invoice" : "other");
  const [shared, setShared] = useState(!!initial);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const tenantName = (id: string) => tenants.find((x) => x.id === id)?.name ?? "";

  // Doklad k vyúčtování: nájemník z vyúčtování, druh faktura, zpřístupnit
  function chooseSettlement(id: string) {
    setSettlementId(id);
    const s = settlements.find((x) => x.id === id);
    if (s) {
      setTenantId(s.tenantId);
      setCategory("invoice");
      setShared(true);
    }
  }

  function chooseTenant(id: string) {
    setTenantId(id);
    if (!id) setShared(false);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const original = form.get("file");
    if (!(original instanceof File) || original.size === 0) {
      setError(t("errors.required"));
      return;
    }

    setPending(true);
    try {
      const file = await prepareUpload(original);
      if (file.size > MAX_UPLOAD_BYTES) {
        setError(t("errors.tooLarge"));
        return;
      }
      form.set("file", file);
      form.set("propertyId", propertyId);
      if (tenantId) form.set("tenantId", tenantId);
      const res = await fetch("/api/documents", { method: "POST", body: form });
      if (!res.ok) {
        const { error: key } = (await res.json().catch(() => ({}))) as { error?: string };
        setError(t(`errors.${key && ERRORS.includes(key) ? key : "generic"}`));
        return;
      }
      router.refresh();
      onDone();
    } catch {
      setError(t("errors.generic"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-card p-4 space-y-4">
      <label className="block space-y-1">
        <span className="text-sm font-medium">{t("file")}</span>
        <input
          type="file"
          name="file"
          accept="image/*,application/pdf"
          required
          className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm hover:file:bg-muted"
        />
        <span className="block text-xs text-muted-foreground">{t("fileHint")}</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {settlements.length > 0 && (
          <label className="block space-y-1">
            <span className="text-sm font-medium">{t("settlement")}</span>
            <select
              name="settlementId"
              value={settlementId}
              onChange={(e) => chooseSettlement(e.target.value)}
              className={inputClass}
            >
              <option value="">{t("noSettlement")}</option>
              {settlements.map((s) => (
                <option key={s.id} value={s.id}>
                  {`${tSet(`utility.${s.utility}`)} ${formatDate(s.periodFrom, locale)} – ${formatDate(s.periodTo, locale)} · ${tenantName(s.tenantId)}`}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block space-y-1">
          <span className="text-sm font-medium">{t("category")}</span>
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as DocumentCategory)}
            className={inputClass}
          >
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{tProp(`documentCategory.${c}`)}</option>
            ))}
          </select>
        </label>

        {tenants.length > 0 && (
          <label className="block space-y-1">
            <span className="text-sm font-medium">{t("tenant")}</span>
            <select
              value={tenantId}
              onChange={(e) => chooseTenant(e.target.value)}
              disabled={!!settlementId}
              className={inputClass}
            >
              <option value="">{t("noTenant")}</option>
              {tenants.map((x) => (
                <option key={x.id} value={x.id}>{x.name}</option>
              ))}
            </select>
          </label>
        )}

        <label className="block space-y-1">
          <span className="text-sm font-medium">{t("notes")}</span>
          <input name="notes" maxLength={300} className={inputClass} />
        </label>
      </div>

      {tenantId && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="shared"
            checked={shared}
            onChange={(e) => setShared(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          {t("share")}
        </label>
      )}

      {error && (
        <p role="alert" className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? t("uploading") : t("submit")}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
