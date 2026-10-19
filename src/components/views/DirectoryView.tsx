"use client";

import { useMemo, useState } from "react";
import { CalculatorCard } from "@/components/site/CalculatorCard";
import { CATEGORIES } from "@/lib/calculators/categories";
import { getLiveCalculators } from "@/lib/calculators/registry";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { route, useRouter } from "@/lib/router";

export function DirectoryView() {
  const router = useRouter();
  const all = useMemo(() => getLiveCalculators().slice().sort((a, b) => a.name.localeCompare(b.name)), []);
  const [filter, setFilter] = useState("");

  const filtered = filter.trim()
    ? all.filter((c) => {
        const q = filter.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      })
    : all;

  // Group by category
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
    <div className="space-y-6">
      <header className="pb-4 border-b">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">All calculators</h1>
        <p className="text-muted-foreground mt-1">
          {all.length} live calculators, grouped by category. Every entry below is fully implemented and self-tested.
        </p>
        <div className="relative mt-4 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter directory…"
            className="pl-9"
          />
        </div>
      </header>

      {grouped.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">No matches in the directory.</p>
      ) : (
        <div className="space-y-8">
          {grouped.map(([catId, calcs]) => {
            const cat = CATEGORIES.find((x) => x.id === catId);
            if (!cat) return null;
            const Icon = cat.icon;
            return (
              <section key={catId}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-base font-semibold">{cat.name}</h2>
                  <span className="text-xs text-muted-foreground">({calcs.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
