"use client";

import type { CalculatorDefinition } from "@/lib/calculators/types";
import { getCalculator, getLiveByCategory } from "@/lib/calculators/registry";
import { CalculatorCard } from "./CalculatorCard";

interface Props {
  current: CalculatorDefinition;
  limit?: number;
}

export function RelatedCalculators({ current, limit = 4 }: Props) {
  const related = (current.related ?? [])
    .map((slug) => getCalculator(slug))
    .filter((c): c is CalculatorDefinition => Boolean(c) && c!.status === "live");

  // Fill up to `limit` with same-category siblings if explicit related is short.
  if (related.length < limit) {
    const siblings = getLiveByCategory(current.category)
      .filter((c) => c.slug !== current.slug && !related.some((r) => r.slug === c.slug));
    while (related.length < limit && siblings.length > 0) {
      const next = siblings.shift();
      if (next) related.push(next);
    }
  }

  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold mb-4">Related calculators</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {related.slice(0, limit).map((c) => (
          <CalculatorCard key={c.slug} calculator={c} />
        ))}
      </div>
    </section>
  );
}
