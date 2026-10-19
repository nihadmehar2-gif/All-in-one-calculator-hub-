"use client";

import type { ResultRow as ResultRowType } from "@/lib/calculators/types";
import { cn } from "@/lib/utils";

interface Props {
  row: ResultRowType;
  compact?: boolean;
}

const emphasisClasses: Record<NonNullable<ResultRowType["emphasis"]>, string> = {
  primary: "border-primary/40 bg-primary/5",
  normal: "border-border",
  warning: "border-amber-500/40 bg-amber-50 dark:bg-amber-950/20",
  success: "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20",
};

const valueClasses: Record<NonNullable<ResultRowType["emphasis"]>, string> = {
  primary: "text-primary text-3xl font-semibold result-value",
  normal: "text-foreground text-base font-medium",
  warning: "text-amber-700 dark:text-amber-300 text-base font-medium",
  success: "text-emerald-700 dark:text-emerald-300 text-2xl font-semibold result-value",
};

export function ResultRow({ row, compact }: Props) {
  const emphasis = row.emphasis ?? "normal";
  if (compact || emphasis === "normal") {
    return (
      <div className="flex items-baseline justify-between gap-3 py-1 border-b last:border-0">
        <span className="text-sm text-muted-foreground">{row.label}</span>
        <span className="text-sm font-medium tabular-nums text-right">{row.value}</span>
      </div>
    );
  }
  return (
    <div className={cn("rounded-md border p-4", emphasisClasses[emphasis])}>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{row.label}</div>
      <div className={cn("mt-1 tabular-nums", valueClasses[emphasis])}>{row.value}</div>
      {row.hint && <div className="mt-1 text-xs text-muted-foreground">{row.hint}</div>}
    </div>
  );
}
