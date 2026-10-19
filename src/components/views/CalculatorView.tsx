"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, BookOpen, ArrowLeft } from "lucide-react";
import { CalculatorRunner } from "@/components/site/CalculatorRunner";
import { RelatedCalculators } from "@/components/site/RelatedCalculators";
import { getCalculator } from "@/lib/calculators/registry";
import { getCategory } from "@/lib/calculators/categories";
import { route } from "@/lib/router";

const iconBg: Record<string, string> = {
  emerald: "bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 text-emerald-600 dark:text-emerald-400",
  rose: "bg-gradient-to-br from-rose-500/15 to-rose-600/10 text-rose-600 dark:text-rose-400",
  amber: "bg-gradient-to-br from-amber-500/15 to-amber-600/10 text-amber-600 dark:text-amber-400",
  sky: "bg-gradient-to-br from-sky-500/15 to-sky-600/10 text-sky-600 dark:text-sky-400",
  violet: "bg-gradient-to-br from-violet-500/15 to-violet-600/10 text-violet-600 dark:text-violet-400",
  slate: "bg-gradient-to-br from-slate-500/15 to-slate-600/10 text-slate-600 dark:text-slate-400",
};

interface Props { slug: string; }

export function CalculatorView({ slug }: Props) {
  const calc = useMemo(() => getCalculator(slug), [slug]);

  if (!calc) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold mb-2">Calculator not found</h1>
        <p className="text-muted-foreground mb-6">&quot;{slug}&quot; isn&apos;t in the registry.</p>
        <Button asChild><a href={route.directory()}>Browse all calculators</a></Button>
      </div>
    );
  }

  if (calc.status !== "live") {
    return (
      <div className="text-center py-20 max-w-lg mx-auto">
        <div className="flex h-16 w-16 mx-auto mb-5 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{calc.name}</h1>
        <p className="text-muted-foreground mb-2">This calculator is on the roadmap but hasn&apos;t been published yet.</p>
        <p className="text-sm text-muted-foreground mb-6">We only publish calculators once their math is implemented and verified. It&apos;s tracked for Part {calc.part ?? "—"} of the build.</p>
        <div className="flex gap-2 justify-center">
          <Button asChild variant="outline"><a href={route.category(calc.category)}>Back to category</a></Button>
          <Button asChild><a href={route.directory()}>Browse available tools</a></Button>
        </div>
      </div>
    );
  }

  const cat = getCategory(calc.category);
  const Icon = cat?.icon ?? AlertCircle;
  const bgClass = cat ? (iconBg[cat.color] ?? iconBg.slate) : iconBg.slate;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="pb-6 border-b border-border/60">
        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${bgClass} shrink-0`}>
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            {cat && (
              <a href={route.category(cat.id)} className="inline-flex items-center gap-1 text-xs font-medium text-primary mb-2 hover:underline">
                <ArrowLeft className="h-3 w-3" />
                {cat.name}
              </a>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{calc.name}</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl leading-relaxed">{calc.description}</p>
          </div>
        </div>
      </header>

      <CalculatorRunner key={calc.slug} calculator={calc} />

      {calc.learnMore && (
        <section className="rounded-2xl border border-border/60 bg-muted/30 p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
            <BookOpen className="h-4 w-4 text-primary" />
            Learn more
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{calc.learnMore}</p>
        </section>
      )}

      <RelatedCalculators current={calc} limit={4} />
    </div>
  );
}
