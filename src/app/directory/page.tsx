import type { Metadata } from "next";
import { getLiveByCategoryData } from "@/lib/calculators/registry-data";
import { CATEGORIES_DATA } from "@/lib/calculators/categories-data";

const SITE_URL = "https://nihad-calculator.vercel.app";

export const metadata: Metadata = {
  title: "All Calculators — EveryCalc",
  description: "Browse all 224 EveryCalc calculators, grouped by category. Finance, math, health, conversions, statistics and more.",
  alternates: { canonical: `${SITE_URL}/directory` },
};

export default function DirectoryPage() {
  const all = CATEGORIES_DATA.map((cat) => ({
    cat,
    calcs: getLiveByCategoryData(cat.id),
  })).filter((g) => g.calcs.length > 0);

  const totalCount = all.reduce((s, g) => s + g.calcs.length, 0);

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
        <a href="/">Home</a> {" › "}
        <span>All Calculators</span>
      </nav>
      <h1>All Calculators</h1>
      <p style={{ fontSize: "1.125rem", color: "#555", marginBottom: "1.5rem" }}>
        {totalCount} live calculators, grouped by category.
      </p>
      {all.map(({ cat, calcs }) => (
        <div key={cat.id} style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
            <a href={`/category/${cat.id}`} style={{ textDecoration: "none", color: "#1a1a2e" }}>{cat.name}</a>
            <span style={{ fontSize: "0.875rem", color: "#777", fontWeight: 400 }}> ({calcs.length})</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
            {calcs.map((c) => (
              <div key={c.slug} style={{ padding: "0.75rem", border: "1px solid #e0e0e0", borderRadius: "0.5rem" }}>
                <a href={`/calculator/${c.slug}`} style={{ fontWeight: 600, textDecoration: "none", color: "#5b21b6" }}>
                  {c.name}
                </a>
                <p style={{ fontSize: "0.8125rem", color: "#666", marginTop: "0.25rem" }}>{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <p style={{ marginTop: "2rem" }}>
        <a href="/#/directory">Open interactive directory →</a>
      </p>
    </div>
  );
}
