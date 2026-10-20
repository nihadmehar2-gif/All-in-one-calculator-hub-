import type { Metadata } from "next";
import { getLiveCalculatorSlugs, getLiveCalculatorMeta } from "@/lib/calculators/registry-data";
import { CATEGORIES_DATA } from "@/lib/calculators/categories-data";
import { calculatorNameToSeoSlug, categoryUrlPath } from "@/lib/calculators/seo-urls";

const SITE_URL = "https://nihad-calculator.vercel.app";

export const metadata: Metadata = {
  title: "All Calculators — EveryCalc",
  description: "Browse all 224 EveryCalc calculators, grouped by category. Finance, math, health, conversions, statistics and more.",
  alternates: { canonical: `${SITE_URL}/directory` },
};

export default function DirectoryPage() {
  const all = getLiveCalculatorSlugs()
    .map((s) => getLiveCalculatorMeta(s))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name));

  const grouped = new Map<string, typeof all>();
  for (const c of all) {
    if (!grouped.has(c.category)) grouped.set(c.category, []);
    grouped.get(c.category)!.push(c);
  }
  const sortedGroups = [...grouped.entries()].sort((a, b) => {
    const ca = CATEGORIES_DATA.find((x) => x.id === a[0]);
    const cb = CATEGORIES_DATA.find((x) => x.id === b[0]);
    return (ca?.order ?? 999) - (cb?.order ?? 999);
  });

  const totalCount = all.length;

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "#666" }}>
        <a href="/" style={{ color: "#5b21b6", textDecoration: "none" }}>Home</a>
        {" › "}
        <span>All Calculators</span>
      </nav>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>All Calculators</h1>
      <p style={{ fontSize: "1.125rem", color: "#555", marginBottom: "1.5rem" }}>
        {totalCount} live calculators, grouped by category. Every entry is fully implemented and self-tested.
      </p>
      {sortedGroups.map(([catId, calcs]) => {
        const cat = CATEGORIES_DATA.find((x) => x.id === catId);
        if (!cat) return null;
        const catSeo = categoryUrlPath(cat.id, cat.name).slice(1);
        return (
          <div key={catId} style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
              <a href={`/${catSeo}`} style={{ textDecoration: "none", color: "#1a1a2e" }}>{cat.name}</a>
              <span style={{ fontSize: "0.875rem", color: "#777", fontWeight: 400 }}> ({calcs.length})</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
              {calcs.map((c) => (
                <div key={c.slug} style={{ padding: "0.75rem", border: "1px solid #e0e0e0", borderRadius: "0.5rem" }}>
                  <a href={`/${calculatorNameToSeoSlug(c.name)}`} style={{ fontWeight: 600, textDecoration: "none", color: "#5b21b6" }}>
                    {c.name}
                  </a>
                  <p style={{ fontSize: "0.8125rem", color: "#666", marginTop: "0.25rem" }}>{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <p style={{ marginTop: "2rem" }}>
        <a href="/#/directory" style={{ color: "#5b21b6", textDecoration: "none" }}>Open interactive directory →</a>
      </p>
    </div>
  );
}
