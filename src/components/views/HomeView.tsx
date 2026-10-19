"use client";

import { useState, useMemo } from "react";
import { Search, ArrowRight, ShieldCheck, Zap, Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/calculators/categories";
import { getLiveCalculators, getCategoryCounts } from "@/lib/calculators/registry";
import { searchCalculators } from "@/lib/calculators/search";
import { route, useRouter } from "@/lib/router";
import { CalculatorCard } from "@/components/site/CalculatorCard";

const iconBg: Record<string, string> = {
  emerald: "bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 text-emerald-600 dark:text-emerald-400",
  rose: "bg-gradient-to-br from-rose-500/15 to-rose-600/10 text-rose-600 dark:text-rose-400",
  amber: "bg-gradient-to-br from-amber-500/15 to-amber-600/10 text-amber-600 dark:text-amber-400",
  sky: "bg-gradient-to-br from-sky-500/15 to-sky-600/10 text-sky-600 dark:text-sky-400",
  violet: "bg-gradient-to-br from-violet-500/15 to-violet-600/10 text-violet-600 dark:text-violet-400",
  slate: "bg-gradient-to-br from-slate-500/15 to-slate-600/10 text-slate-600 dark:text-slate-400",
};

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
    <div className="space-y-16">
      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 pt-12 sm:pt-16 pb-8">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 h-72 w-72 rounded-full bg-sky-500/8 blur-3xl pointer-events-none" />

        {/* Decorative math symbols */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden="true">
          <span className="absolute top-8 left-[8%] text-5xl font-bold text-primary/5" style={{ fontFamily: "var(--font-display), serif" }}>π</span>
          <span className="absolute top-16 right-[10%] text-4xl font-bold text-primary/5" style={{ fontFamily: "var(--font-display), serif" }}>∑</span>
          <span className="absolute bottom-12 left-[15%] text-3xl font-bold text-primary/5">√</span>
          <span className="absolute bottom-20 right-[12%] text-5xl font-bold text-primary/5" style={{ fontFamily: "var(--font-display), serif" }}>∫</span>
          <span className="absolute top-1/3 left-[20%] text-2xl text-primary/5">÷</span>
          <span className="absolute top-1/2 right-[18%] text-3xl text-primary/5">±</span>
          <span className="absolute bottom-1/3 left-[25%] text-4xl font-bold text-primary/5">%</span>
        </div>

        <div className="relative text-center max-w-3xl mx-auto">
          <Badge className="mb-6 gap-1.5 badge-gradient border-0 shadow-glow">
            <Sparkles className="h-3.5 w-3.5" />
            {liveCount} calculators across {totalCategoriesWithCalc} categories
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold max-w-3xl mx-auto" style={{ fontFamily: "var(--font-display), serif", letterSpacing: "-0.04em", lineHeight: 1.02 }}>
            Every Calculation.
            <br />
            <span className="text-gradient italic font-medium">One Simple Place.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Free, fast, and private. All math runs locally in your browser — no signups,
            no tracking, no API calls. From percentages to physics.
          </p>

          {/* Search */}
          <form onSubmit={submit} className="mt-8 max-w-xl mx-auto relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={'Try "loan", "BMI", "triangle area"…'}
              className="pl-12 pr-32 h-14 text-base rounded-2xl shadow-premium-lg border-border/50 bg-card"
              aria-label="Search calculators"
            />
            <Button type="submit" className="absolute right-2 top-2 h-10 rounded-xl bg-hero-gradient shadow-glow hover:opacity-90 transition-opacity">
              Search
            </Button>
            {preview.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-border/60 bg-popover shadow-premium-lg overflow-hidden z-20 text-left">
                {preview.map((r) => (
                  <button key={r.calculator.slug} type="button" onClick={() => router.navigate(route.calculator(r.calculator.slug))} className="block w-full px-4 py-2.5 hover:bg-accent transition-colors">
                    <div className="text-sm font-medium">{r.calculator.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{r.calculator.description}</div>
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> 100% client-side</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" /> Instant results</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-primary" /> Self-verifying math</span>
          </div>
        </div>
      </section>

      {/* ═══ Featured calculators ═══ */}
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured calculators</h2>
          <a href={route.directory()} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((c) => (
            <CalculatorCard key={c.slug} calculator={c} />
          ))}
        </div>
      </section>

      {/* ═══ Browse by category ═══ */}
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold">Browse by category</h2>
          <a href={route.directory()} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors">
            Explore all <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const count = counts[c.id] ?? 0;
            const bgClass = iconBg[c.color] ?? iconBg.slate;
            return (
              <a key={c.id} href={route.category(c.id)} className="group card-premium rounded-xl p-4 focus-ring">
                <div className="flex items-start gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${bgClass} shrink-0 transition-transform group-hover:scale-105`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">{c.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{c.description}</div>
                    <div className="text-[10px] mt-1.5 font-medium text-primary/70">
                      {count > 0 ? `${count} calculator${count === 1 ? "" : "s"}` : "Coming soon"}
                    </div>
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
