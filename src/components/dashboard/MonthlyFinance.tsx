import { useTranslations } from "next-intl";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FinanceLine {
  labelKey: string;
  amount: number;
}

export interface MonthlyFinanceData {
  incomeLines: FinanceLine[];
  expenseLines: FinanceLine[];
}

interface MonthlyFinanceProps {
  data: MonthlyFinanceData;
}

function formatCZK(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(amount);
}

function FinanceSection({
  title,
  lines,
  total,
  variant,
}: {
  title: string;
  lines: { label: string; amount: number }[];
  total: number;
  variant: "income" | "expense";
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-3">
        {variant === "income" ? (
          <TrendingUp className="h-4 w-4 text-green-600" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <ul className="space-y-1.5">
        {lines.map((line) => (
          <li key={line.label} className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">{line.label}</span>
            <span className="text-sm tabular-nums">{formatCZK(line.amount)}</span>
          </li>
        ))}
      </ul>
      <div
        className={cn(
          "mt-3 pt-3 border-t border-border flex items-center justify-between",
          variant === "income" ? "text-green-700" : "text-red-600"
        )}
      >
        <span className="text-sm font-semibold">Celkem</span>
        <span className="text-sm font-bold tabular-nums">{formatCZK(total)}</span>
      </div>
    </div>
  );
}

export default function MonthlyFinance({ data }: MonthlyFinanceProps) {
  const t = useTranslations("dashboard");

  const totalIncome = data.incomeLines.reduce((s, l) => s + l.amount, 0);
  const totalExpense = data.expenseLines.reduce((s, l) => s + l.amount, 0);
  const balance = totalIncome - totalExpense;

  const incomeResolved = data.incomeLines.map((l) => ({
    label: t(l.labelKey as Parameters<typeof t>[0]),
    amount: l.amount,
  }));

  const expenseResolved = data.expenseLines.map((l) => ({
    label: t(l.labelKey as Parameters<typeof t>[0]),
    amount: l.amount,
  }));

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-semibold text-sm">{t("monthlyFinance")}</h2>
      </div>

      <div className="p-5">
        {/* Příjmy / Výdaje — side by side */}
        <div className="flex gap-8 flex-col sm:flex-row">
          <FinanceSection
            title={t("income")}
            lines={incomeResolved}
            total={totalIncome}
            variant="income"
          />
          {/* Dělicí čára */}
          <div className="w-px bg-border hidden sm:block" />
          <div className="border-t border-border sm:hidden" />
          <FinanceSection
            title={t("expenses")}
            lines={expenseResolved}
            total={totalExpense}
            variant="expense"
          />
        </div>

        {/* Saldo */}
        <div
          className={cn(
            "mt-5 pt-4 border-t border-border flex items-center justify-between",
          )}
        >
          <div className="flex items-center gap-1.5">
            {balance > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : balance < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-semibold text-sm">{t("balance")}</span>
          </div>
          <span
            className={cn(
              "text-lg font-bold tabular-nums",
              balance > 0 ? "text-green-700" : balance < 0 ? "text-red-600" : "text-foreground"
            )}
          >
            {balance > 0 ? "+" : ""}
            {formatCZK(balance)}
          </span>
        </div>
      </div>
    </div>
  );
}
