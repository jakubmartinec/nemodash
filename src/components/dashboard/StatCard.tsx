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
    icon: "bg-success-soft text-success",
    value: "text-success",
  },
  warning: {
    icon: "bg-warning-soft text-warning",
    value: "text-warning",
  },
  danger: {
    icon: "bg-danger-soft text-danger",
    value: "text-danger",
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
