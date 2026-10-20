import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLiveCalculatorMeta, getLiveCalculatorSlugs } from "@/lib/calculators/registry-data";
import { getCategoryData } from "@/lib/calculators/categories-data";

const SITE_URL = "https://nihad-calculator.vercel.app";

export function generateStaticParams() {
  return getLiveCalculatorSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then((p) => {
    const calc = getLiveCalculatorMeta(p.slug);
    if (!calc) return { title: "Calculator not found" };
    const cat = getCategoryData(calc.category);
    return {
      title: calc.name,
      description: calc.description,
      alternates: { canonical: `${SITE_URL}/calculator/${p.slug}` },
      openGraph: {
        title: `${calc.name} — EveryCalc`,
        description: calc.description,
        url: `${SITE_URL}/calculator/${p.slug}`,
      },
    };
  });
}

export default async function CalculatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const calc = getLiveCalculatorMeta(slug);
  if (!calc) notFound();
  const cat = getCategoryData(calc.category);

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
        <a href="/">Home</a> {" › "}
        {cat && <><a href={`/category/${cat.id}`}>{cat.name}</a> {" › "}</>}
        <span>{calc.name}</span>
      </nav>
      <h1>{calc.name}</h1>
      <p style={{ fontSize: "1.125rem", color: "#555", marginBottom: "1.5rem" }}>{calc.description}</p>
      <div style={{ padding: "1.5rem", background: "#f8f8f8", borderRadius: "0.75rem", marginBottom: "1.5rem" }}>
        <p style={{ margin: 0 }}>
          This calculator runs in your browser.{" "}
          <a href={`/#/calculator/${slug}`}>Open the interactive calculator →</a>
        </p>
      </div>
      {calc.related && calc.related.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>Related calculators</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {calc.related.slice(0, 6).map((r) => {
              const rc = getLiveCalculatorMeta(r);
              if (!rc) return null;
              return (
                <li key={r} style={{ marginBottom: "0.5rem" }}>
                  <a href={`/calculator/${r}`}>{rc.name}</a>
                  <span style={{ color: "#777", fontSize: "0.875rem" }}> — {rc.description}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: calc.name,
            description: calc.description,
            url: `${SITE_URL}/calculator/${slug}`,
            applicationCategory: cat?.name ?? "Calculator",
            operatingSystem: "Web browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
    </div>
  );
}
