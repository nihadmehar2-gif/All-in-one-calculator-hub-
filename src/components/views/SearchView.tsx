"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CalculatorCard } from "@/components/site/CalculatorCard";
import { searchCalculators } from "@/lib/calculators/search";
import { route } from "@/lib/router";
import { CATEGORIES } from "@/lib/calculators/categories";

interface Props {
  query: string;
}

export function SearchView({ query }: Props) {
  const results = useMemo(() => searchCalculators(query, 200), [query]);

  return (
    <div className="space-y-6">
      <header className="pb-4 border-b">
        <h1 className="text-2xl font-bold tracking-tight">
          Search results
        </h1>
        <p className="text-muted-foreground mt-1">
          {results.length === 0
            ? <>No calculators match "<span className="font-medium text-foreground">{query}</span>".</>
            : <>{results.length} calculator{results.length === 1 ? "" : "s"} matching "<span className="font-medium text-foreground">{query}</span>"</>}
        </p>
      </header>

      {results.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <Search className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">No matches</p>
          <p className="text-sm text-muted-foreground mb-4">
            Try a different keyword, or browse by category.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.slice(0, 6).map((c) => (
              <a
                key={c.id}
                href={route.category(c.id)}
                className="rounded-full border px-3 py-1 text-xs hover:bg-accent"
              >
                {c.name}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r) => (
            <CalculatorCard
              key={r.calculator.slug}
              calculator={r.calculator}
              highlight={r.matchedOn.includes("keywords") ? "synonym match" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
