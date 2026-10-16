"use client";

// Sdílené prvky formulářů správy
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block space-y-1", className)}>
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-border bg-card p-4 space-y-4">
      <legend className="px-1 text-sm font-semibold">{title}</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </fieldset>
  );
}

export function FormError({ error }: { error?: string }) {
  const t = useTranslations("forms.errors");
  if (!error) return null;
  return (
    <p role="alert" className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
      {t(error)}
    </p>
  );
}

export function SubmitBar({ pending, cancelHref, label }: { pending: boolean; cancelHref?: string; label?: string }) {
  const t = useTranslations("forms");
  return (
    <div className="flex items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? t("saving") : (label ?? t("save"))}
      </button>
      {cancelHref && (
        <Link href={cancelHref} className="text-sm text-muted-foreground hover:text-foreground">
          {t("cancel")}
        </Link>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
