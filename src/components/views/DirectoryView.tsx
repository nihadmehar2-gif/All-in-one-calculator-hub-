"use client";

import { useMemo, useState } from "react";
import { CalculatorCard } from "@/components/site/CalculatorCard";
import { CATEGORIES } from "@/lib/calculators/categories";
import { getLiveCalculators } from "@/lib/calculators/registry";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const iconBg: Record<string, string> = {
  emerald: "bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 text-emerald-600 dark:text-emerald-400",
  rose: "bg-gradient-to-br from-rose-500/15 to-rose-600/10 text-rose-600 dark:text-rose-400",
  amber: "bg-gradient-to-br from-amber-500/15 to-amber-600/10 text-amber-600 dark:text-amber-400",
  sky: "bg-gradient-to-br from-sky-500/15 to-sky-600/10 text-sky-600 dark:text-sky-400",
  violet: "bg-gradient-to-br from-violet-500/15 to-violet-600/10 text-violet-600 dark:text-violet-400",
  slate: "bg-gradient-to-br from-slate-500/15 to-slate-600/10 text-slate-600 dark:text-slate-400",
};

export function DirectoryView() {
  const all = useMemo(() => getLiveCalculators().slice().sort((a, b) => a.name.localeCompare(b.name)), []);
  const [filter, setFilter] = useState("");

  const filtered = filter.trim()
    ? all.filter((c) => {
        const q = filter.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      })
    : all;

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const c of filtered) {
      if (!map.has(c.category)) map.set(c.category, []);
      map.get(c.category)!.push(c);
    }
    return [...map.entries()].sort((a, b) => {
      const ca = CATEGORIES.find((x) => x.id === a[0]);
      const cb = CATEGORIES.find((x) => x.id === b[0]);
      return (ca?.order ?? 999) - (cb?.order ?? 999);
    });
  }, [filtered]);

  return (
    <div className="space-y-8">
      <header className="pb-6 border-b border-border/60">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">All calculators</h1>
        <p className="text-muted-foreground mt-1.5">
          {all.length} live calculators, grouped by category. Every entry below is fully implemented and self-tested.
        </p>
        <div className="relative mt-5 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter directory…" className="pl-10 h-10 rounded-xl bg-muted/50 border-border/50" />
        </div>
      </header>

      {grouped.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">No matches in the directory.</p>
      ) : (
        <div className="space-y-10">
          {grouped.map(([catId, calcs]) => {
            const cat = CATEGORIES.find((x) => x.id === catId);
            if (!cat) return null;
            const Icon = cat.icon;
            const bgClass = iconBg[cat.color] ?? iconBg.slate;
            return (
              <section key={catId}>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${bgClass}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-bold">{cat.name}</h2>
                  <span className="text-xs text-muted-foreground font-medium">({calcs.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {calcs.map((c) => (
                    <CalculatorCard key={c.slug} calculator={c} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
