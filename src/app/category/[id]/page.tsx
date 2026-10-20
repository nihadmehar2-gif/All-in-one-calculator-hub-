import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES_DATA, getCategoryData } from "@/lib/calculators/categories-data";
import { getLiveByCategoryData } from "@/lib/calculators/registry-data";

const SITE_URL = "https://nihad-calculator.vercel.app";

export function generateStaticParams() {
  return CATEGORIES_DATA.map((c) => ({ id: c.id }));
}

export function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return params.then((p) => {
    const cat = getCategoryData(p.id);
    if (!cat) return { title: "Category not found" };
    const live = getLiveByCategoryData(p.id);
    return {
      title: `${cat.name} calculators`,
      description: `${cat.description} ${live.length} calculator${live.length === 1 ? "" : "s"} available.`,
      alternates: { canonical: `${SITE_URL}/category/${p.id}` },
      openGraph: {
        title: `${cat.name} calculators — EveryCalc`,
        description: cat.description,
        url: `${SITE_URL}/category/${p.id}`,
      },
    };
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cat = getCategoryData(id);
  if (!cat) notFound();
  const live = getLiveByCategoryData(id);

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
        <a href="/">Home</a> {" › "}
        <span>{cat.name}</span>
      </nav>
      <h1>{cat.name} Calculators</h1>
      <p style={{ fontSize: "1.125rem", color: "#555", marginBottom: "0.5rem" }}>{cat.description}</p>
      <p style={{ color: "#777", marginBottom: "1.5rem" }}>{live.length} calculator{live.length === 1 ? "" : "s"} available</p>

      {live.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {live.map((c) => (
            <div key={c.slug} style={{ padding: "1rem", border: "1px solid #e0e0e0", borderRadius: "0.75rem" }}>
              <a href={`/calculator/${c.slug}`} style={{ fontWeight: 600, textDecoration: "none", color: "#5b21b6" }}>
                {c.name}
              </a>
              <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>{c.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ padding: "2rem", border: "2px dashed #ddd", borderRadius: "0.75rem", textAlign: "center", color: "#888" }}>
          Calculators in this category are coming soon.
        </p>
      )}

      <p style={{ marginTop: "2rem" }}>
        <a href={`/#/category/${id}`}>Open interactive category page →</a>
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${cat.name} Calculators`,
            description: cat.description,
            url: `${SITE_URL}/category/${id}`,
            hasPart: live.map((c) => ({
              "@type": "WebApplication",
              name: c.name,
              url: `${SITE_URL}/calculator/${c.slug}`,
            })),
          }),
        }}
      />
    </div>
  );
}
