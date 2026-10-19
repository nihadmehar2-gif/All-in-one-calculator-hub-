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

  return (
    <div className="space-y-8">
      {/* Category header */}
      <header className="flex items-start gap-4 pb-6 border-b">
        <span className={`flex h-14 w-14 items-center justify-center rounded-xl shrink-0 ${
          category.color === "emerald" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          : category.color === "rose" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
          : category.color === "amber" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          : category.color === "sky" ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
          : category.color === "violet" ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
        }`}>
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{category.name}</h1>
          <p className="text-muted-foreground mt-1">{category.description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {live.length} live calculator{live.length === 1 ? "" : "s"}
            {planned.length > 0 && ` · ${planned.length} planned`}
          </p>
        </div>
      </header>

      {/* Live calculators */}
      {live.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold mb-4">Available calculators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {live.map((c) => (
              <CalculatorCard key={c.slug} calculator={c} />
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="rounded-md border border-dashed p-8 text-center">
            <Construction className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
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
                className="rounded-md border border-dashed p-3 opacity-70"
                aria-disabled
              >
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{c.description}</div>
                <div className="text-[10px] mt-1 text-muted-foreground">Planned · Part {c.part ?? "—"}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Continue browsing */}
      {nextCategories.length > 0 && (
        <section className="pt-6 border-t">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Continue browsing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {nextCategories.map((c) => {
              const NIcon = c.icon;
              return (
                <a
                  key={c.id}
                  href={route.category(c.id)}
                  className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent"
                >
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
