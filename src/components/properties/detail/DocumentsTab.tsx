import { useTranslations } from "next-intl";
import { FolderOpen } from "lucide-react";

export default function DocumentsTab() {
  const t = useTranslations("properties");

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
      <p className="text-sm text-muted-foreground max-w-sm">
        {t("documentsPlaceholder")}
      </p>
    </div>
  );
}
