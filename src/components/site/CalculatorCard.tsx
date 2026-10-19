"use client";

import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CalculatorDefinition } from "@/lib/calculators/types";
import { getCategory } from "@/lib/calculators/categories";
import { route } from "@/lib/router";

const colorClasses: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
};

interface Props {
  calculator: CalculatorDefinition;
  highlight?: string;
}

export function CalculatorCard({ calculator, highlight }: Props) {
  const cat = getCategory(calculator.category);
  const colorClass = cat ? (colorClasses[cat.color] ?? colorClasses.slate) : colorClasses.slate;
  const Icon = cat?.icon ?? Calculator;

  return (
    <a href={route.calculator(calculator.slug)} className="group block h-full">
      <Card className="h-full transition-all hover:shadow-md hover:border-foreground/20 hover:-translate-y-0.5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorClass} shrink-0`}>
              <Icon className="h-4 w-4" />
            </div>
            {cat && (
              <Badge variant="outline" className="text-[10px] font-normal">
                {cat.name}
              </Badge>
            )}
          </div>
          <CardTitle className="text-base mt-2 leading-tight group-hover:text-primary">
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
