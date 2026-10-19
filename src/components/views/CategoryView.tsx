"use client";

import { useMemo } from "react";
import { CalculatorCard } from "@/components/site/CalculatorCard";
import { CATEGORIES, getCategory } from "@/lib/calculators/categories";
import { getLiveByCategory, getPlannedByCategory } from "@/lib/calculators/registry";
import { route, useRouter } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Construction } from "lucide-react";

interface Props {
  categoryId: string;
}

export function CategoryView({ categoryId }: Props) {
  const router = useRouter();
  const category = getCategory(categoryId);
  const live = useMemo(() => getLiveByCategory(categoryId), [categoryId]);
  const planned = useMemo(() => getPlannedByCategory(categoryId), [categoryId]);

  if (!category) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-semibold mb-2">Category not found</h1>
        <p className="text-muted-foreground mb-6">This category doesn't exist.</p>
        <Button asChild>
          <a href={route.home()}>Back to home</a>
        </Button>
      </div>
    );
  }

  const Icon = category.icon;
  const nextCategories = CATEGORIES.filter((c) => c.order > category.order).slice(0, 3);
  const iconBgClass =
    category.color === "emerald" ? "bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 text-emerald-600 dark:text-emerald-400"
    : category.color === "rose" ? "bg-gradient-to-br from-rose-500/15 to-rose-600/10 text-rose-600 dark:text-rose-400"
    : category.color === "amber" ? "bg-gradient-to-br from-amber-500/15 to-amber-600/10 text-amber-600 dark:text-amber-400"
    : category.color === "sky" ? "bg-gradient-to-br from-sky-500/15 to-sky-600/10 text-sky-600 dark:text-sky-400"
    : category.color === "violet" ? "bg-gradient-to-br from-violet-500/15 to-violet-600/10 text-violet-600 dark:text-violet-400"
    : "bg-gradient-to-br from-slate-500/15 to-slate-600/10 text-slate-600 dark:text-slate-400";

  return (
    <div className="space-y-10">
      {/* Category header */}
      <header className="flex items-start gap-4 pb-6 border-b border-border/60">
        <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${iconBgClass} shrink-0`}>
          <Icon className="h-8 w-8" />
        </span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{category.name}</h1>
          <p className="text-muted-foreground mt-1.5">{category.description}</p>
          <p className="text-xs text-primary font-medium mt-2">
            {live.length} live calculator{live.length === 1 ? "" : "s"}
            {planned.length > 0 && ` · ${planned.length} planned`}
          </p>
        </div>
      </header>

      {/* Live calculators */}
      {live.length > 0 ? (
        <section>
          <h2 className="text-xl font-bold mb-5">Available calculators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {live.map((c) => (
              <CalculatorCard key={c.slug} calculator={c} />
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
            <Construction className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-semibold mb-1">No calculators published yet</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              This category is queued for a future build phase. We only publish
              calculators once their math is implemented and verified by tests.
            </p>
          </div>
        </section>
      )}

      {/* Planned roadmap (visible but clearly marked) */}
      {planned.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-1">On the roadmap</h2>
          <p className="text-sm text-muted-foreground mb-4">
            These calculators are tracked in the registry and will go live as their
            math is implemented and tested.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {planned.map((c) => (
              <div
                key={c.slug}
                className="rounded-xl border border-dashed border-border/60 p-3.5 opacity-70"
                aria-disabled
              >
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{c.description}</div>
                <div className="text-[10px] mt-1.5 text-muted-foreground">Planned · Part {c.part ?? "—"}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Continue browsing */}
      {nextCategories.length > 0 && (
        <section className="pt-6 border-t border-border/60">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Continue browsing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {nextCategories.map((c) => {
              const NIcon = c.icon;
              return (
                <a key={c.id} href={route.category(c.id)} className="flex items-center gap-3 rounded-xl border border-border/60 p-3.5 hover:bg-accent hover:border-primary/20 transition-all focus-ring">
                  <NIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate">{c.name}</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                </a>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
