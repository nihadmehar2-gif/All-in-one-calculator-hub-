"use client";

import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CalculatorDefinition } from "@/lib/calculators/types";
import { getCategory } from "@/lib/calculators/categories";
import { route } from "@/lib/router";

/* Gradient icon backgrounds per category color */
const iconBg: Record<string, string> = {
  emerald: "bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 text-emerald-600 dark:text-emerald-400",
  rose: "bg-gradient-to-br from-rose-500/15 to-rose-600/10 text-rose-600 dark:text-rose-400",
  amber: "bg-gradient-to-br from-amber-500/15 to-amber-600/10 text-amber-600 dark:text-amber-400",
  sky: "bg-gradient-to-br from-sky-500/15 to-sky-600/10 text-sky-600 dark:text-sky-400",
  violet: "bg-gradient-to-br from-violet-500/15 to-violet-600/10 text-violet-600 dark:text-violet-400",
  slate: "bg-gradient-to-br from-slate-500/15 to-slate-600/10 text-slate-600 dark:text-slate-400",
};

const hoverBorder: Record<string, string> = {
  emerald: "hover:border-emerald-500/30",
  rose: "hover:border-rose-500/30",
  amber: "hover:border-amber-500/30",
  sky: "hover:border-sky-500/30",
  violet: "hover:border-violet-500/30",
  slate: "hover:border-primary/30",
};

interface Props {
  calculator: CalculatorDefinition;
  highlight?: string;
}

export function CalculatorCard({ calculator, highlight }: Props) {
  const cat = getCategory(calculator.category);
  const colorKey = cat?.color ?? "slate";
  const iconClass = iconBg[colorKey] ?? iconBg.slate;
  const borderClass = hoverBorder[colorKey] ?? hoverBorder.slate;
  const Icon = cat?.icon ?? Calculator;

  return (
    <a href={route.calculator(calculator.slug)} className="group block h-full focus-ring rounded-xl">
      <Card className={`h-full card-premium ${borderClass} rounded-xl`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass} shrink-0 transition-transform group-hover:scale-105`}>
              <Icon className="h-5 w-5" />
            </div>
            {cat && (
              <Badge variant="outline" className="text-[10px] font-normal border-border/60">
                {cat.name}
              </Badge>
            )}
          </div>
          <CardTitle className="text-base mt-2.5 leading-tight group-hover:text-primary transition-colors">
            {calculator.name}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-xs">
            {calculator.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {highlight && (
            <p className="text-xs text-muted-foreground italic line-clamp-1">
              ← {highlight}
            </p>
          )}
        </CardContent>
      </Card>
    </a>
  );
}
