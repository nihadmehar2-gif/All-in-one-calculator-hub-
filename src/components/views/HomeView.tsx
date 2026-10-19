"use client";

import { useState, useMemo } from "react";
import { Search, ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/calculators/categories";
import { getLiveCalculators, getCategoryCounts } from "@/lib/calculators/registry";
import { searchCalculators } from "@/lib/calculators/search";
import { route, useRouter } from "@/lib/router";
import { CalculatorCard } from "@/components/site/CalculatorCard";

export function HomeView() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const counts = useMemo(() => getCategoryCounts(), []);
  const live = useMemo(() => getLiveCalculators(), []);
  const liveCount = live.length;
  const totalCategoriesWithCalc = Object.keys(counts).length;

  const preview = useMemo(() => (q.trim() ? searchCalculators(q, 5) : []), [q]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (q.trim()) router.navigate(route.search(q.trim()));
  }

  const featured = live.slice(0, 6);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-8 sm:py-12">
        <Badge variant="secondary" className="mb-4 gap-1">
          <Sparkles className="h-3 w-3" />
          {liveCount} live calculators across {totalCategoriesWithCalc} categories
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl mx-auto" style={{ fontFamily: "var(--font-display), serif", letterSpacing: "-0.04em", lineHeight: 1.02 }}>
          Every calculator you need, <span className="italic font-medium text-primary">in one place.</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Free, fast, private. All math runs locally in your browser — no signups,
          no tracking, no API calls. From percentages to physics.
        </p>

        <form onSubmit={submit} className="mt-8 max-w-xl mx-auto relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={'Try "loan", "BMI", "triangle area"…'}
            className="pl-12 pr-28 h-12 text-base"
            aria-label="Search calculators"
          />
          <Button type="submit" className="absolute right-1.5 top-1.5 h-9">
            Search
          </Button>
          {preview.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-md border bg-popover shadow-md overflow-hidden z-20 text-left">
              {preview.map((r) => (
                <button
                  key={r.calculator.slug}
                  type="button"
                  onClick={() => router.navigate(route.calculator(r.calculator.slug))}
                  className="block w-full px-4 py-2 hover:bg-accent"
                >
                  <div className="text-sm font-medium">{r.calculator.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{r.calculator.description}</div>
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> 100% client-side</span>
          <span className="inline-flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Instant results</span>
          <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> Self-verifying math</span>
        </div>
      </section>

      {/* Featured calculators */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold">Featured calculators</h2>
          <a href={route.directory()} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((c) => (
            <CalculatorCard key={c.slug} calculator={c} />
          ))}
        </div>
      </section>

      {/* All categories */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Browse by category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const count = counts[c.id] ?? 0;
            return (
              <a
                key={c.id}
                href={route.category(c.id)}
                className="group flex items-start gap-3 rounded-lg border p-3 hover:shadow-sm hover:border-foreground/20 transition-all"
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-md shrink-0 ${
                  c.color === "emerald" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : c.color === "rose" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                  : c.color === "amber" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  : c.color === "sky" ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                  : c.color === "violet" ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                }`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-tight group-hover:text-primary">{c.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{c.description}</div>
                  <div className="text-[10px] mt-1 text-muted-foreground">
                    {count > 0 ? `${count} calculator${count === 1 ? "" : "s"}` : "Coming soon"}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
