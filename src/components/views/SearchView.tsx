"use client";

import { useMemo } from "react";
import { Search, SearchX } from "lucide-react";
import { CalculatorCard } from "@/components/site/CalculatorCard";
import { searchCalculators } from "@/lib/calculators/search";
import { route } from "@/lib/router";
import { CATEGORIES } from "@/lib/calculators/categories";

interface Props { query: string; }

export function SearchView({ query }: Props) {
  const results = useMemo(() => searchCalculators(query, 200), [query]);

  return (
    <div className="space-y-8">
      <header className="pb-6 border-b border-border/60">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Search results</h1>
        <p className="text-muted-foreground mt-1.5">
          {results.length === 0
            ? <>No calculators match &quot;<span className="font-medium text-foreground">{query}</span>&quot;.</>
            : <>{results.length} calculator{results.length === 1 ? "" : "s"} matching &quot;<span className="font-medium text-foreground">{query}</span>&quot;</>}
        </p>
      </header>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center max-w-lg mx-auto">
          <div className="flex h-16 w-16 mx-auto mb-5 items-center justify-center rounded-2xl bg-muted">
            <SearchX className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-semibold text-lg mb-1">No matches found</p>
          <p className="text-sm text-muted-foreground mb-6">
            Try a different keyword, or browse by category.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.slice(0, 6).map((c) => (
              <a key={c.id} href={route.category(c.id)} className="rounded-full border border-border/60 px-3.5 py-1.5 text-xs font-medium hover:bg-accent hover:border-primary/20 transition-all focus-ring">
                {c.name}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((r) => (
            <CalculatorCard key={r.calculator.slug} calculator={r.calculator} highlight={r.matchedOn.includes("keywords") ? "synonym match" : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
