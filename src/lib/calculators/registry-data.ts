/**
 * Server-safe calculator data (no "use client", no calculate functions).
 * Used by server components for metadata and sitemap generation.
 */
import { ALL_CALCULATORS } from "./registry";

export function getLiveCalculatorSlugs(): string[] {
  return ALL_CALCULATORS.filter((c) => c.status === "live").map((c) => c.slug);
}

export function getLiveCalculatorMeta(slug: string): { name: string; description: string; category: string; related?: string[] } | undefined {
  const calc = ALL_CALCULATORS.find((c) => c.slug === slug && c.status === "live");
  if (!calc) return undefined;
  return {
    name: calc.name,
    description: calc.description,
    category: calc.category,
    related: calc.related,
  };
}

export function getLiveCalculatorCount(): number {
  return ALL_CALCULATORS.filter((c) => c.status === "live").length;
}

export function getLiveByCategoryData(catId: string): { slug: string; name: string; description: string }[] {
  return ALL_CALCULATORS
    .filter((c) => c.status === "live" && c.category === catId)
    .map((c) => ({ slug: c.slug, name: c.name, description: c.description }));
}

export function getCategoryCountsData(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of ALL_CALCULATORS) {
    if (c.status === "live") {
      out[c.category] = (out[c.category] ?? 0) + 1;
    }
  }
  return out;
}
