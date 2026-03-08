import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: {
    icon: "bg-muted text-muted-foreground",
    value: "text-foreground",
  },
  success: {
    icon: "bg-green-100 text-green-700",
    value: "text-green-700",
  },
  warning: {
    icon: "bg-yellow-100 text-yellow-700",
    value: "text-yellow-700",
  },
  danger: {
    icon: "bg-red-100 text-red-700",
    value: "text-red-700",
  },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  variant = "default",
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className="rounded-lg border border-border bg-card p-5 flex items-start gap-4">
      <div className={cn("rounded-md p-2.5 shrink-0", styles.icon)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground truncate">{label}</p>
        <p className={cn("text-2xl font-bold mt-0.5 tabular-nums", styles.value)}>
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{subtext}</p>
        )}
      </div>
    </div>
  );
}
