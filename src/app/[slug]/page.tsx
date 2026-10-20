import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ALL_CALCULATORS } from "@/lib/calculators/registry";
import { getLiveCalculatorSlugs, getLiveCalculatorMeta } from "@/lib/calculators/registry-data";
import { CATEGORIES_DATA, getCategoryData } from "@/lib/calculators/categories-data";
import { calculatorNameToSeoSlug, buildSeoToRegistryMap, categoryUrlPath } from "@/lib/calculators/seo-urls";

const SITE_URL = "https://everycalchub.vercel.app";

// Build reverse lookup: seoSlug → registrySlug
const seoToRegistry = buildSeoToRegistryMap(
  ALL_CALCULATORS.filter((c) => c.status === "live")
);

// Also build category SEO map
const categorySeoToId = new Map<string, string>();
const categoryIdToSeo = new Map<string, string>();
for (const c of CATEGORIES_DATA) {
  const seo = categoryUrlPath(c.id, c.name).slice(1); // remove leading /
  categorySeoToId.set(seo, c.id);
  categoryIdToSeo.set(c.id, seo);
}

// Reserved slugs that should NOT be treated as calculator pages
const RESERVED = new Set(["directory", "privacy", "request", "sitemap.xml", "robots.txt", "api"]);

export function generateStaticParams() {
  const params: { slug: string }[] = [];
  // Calculator pages
  for (const slug of getLiveCalculatorSlugs()) {
    const meta = getLiveCalculatorMeta(slug);
    if (meta) params.push({ slug: calculatorNameToSeoSlug(meta.name) });
  }
  // Category pages
  for (const [seo] of categorySeoToId.entries()) {
    params.push({ slug: seo });
  }
  return params;
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then((p) => {
    const { slug } = p;

    // Check if it's a calculator page
    const registrySlug = seoToRegistry.get(slug);
    if (registrySlug) {
      const calc = getLiveCalculatorMeta(registrySlug);
      if (calc) {
        return {
          title: `${calc.name} — Free Online Tool | EveryCalc`,
          description: `${calc.description} Free, no signup. Runs in your browser.`,
          alternates: { canonical: `${SITE_URL}/${slug}` },
          openGraph: {
            title: `${calc.name} — EveryCalc`,
            description: calc.description,
            url: `${SITE_URL}/${slug}`,
            type: "website",
          },
        };
      }
    }

    // Check if it's a category page
    const catId = categorySeoToId.get(slug);
    if (catId) {
      const cat = getCategoryData(catId);
      if (cat) {
        return {
          title: `${cat.name} Calculators — EveryCalc`,
          description: `${cat.description} Browse all ${cat.name.toLowerCase()} calculators.`,
          alternates: { canonical: `${SITE_URL}/${slug}` },
          openGraph: {
            title: `${cat.name} Calculators — EveryCalc`,
            description: cat.description,
            url: `${SITE_URL}/${slug}`,
          },
        };
      }
    }

    return { title: "Page not found" };
  });
}

export default async function CatchAllPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Skip reserved routes
  if (RESERVED.has(slug)) {
    notFound();
  }

  // Check if it's a calculator page
  const registrySlug = seoToRegistry.get(slug);
  if (registrySlug) {
    const calc = getLiveCalculatorMeta(registrySlug);
    if (calc) {
      const cat = getCategoryData(calc.category);
      const catSeo = cat ? categoryIdToSeo.get(cat.id) : null;

      // Build related links
      const relatedSlugs = calc.related || [];
      const related = relatedSlugs
        .map((r) => getLiveCalculatorMeta(r))
        .filter((c): c is NonNullable<typeof c> => c !== undefined)
        .slice(0, 4);
      if (related.length < 4) {
        const sameCat = getLiveCalculatorSlugs()
          .map((s) => getLiveCalculatorMeta(s))
          .filter((c): c is NonNullable<typeof c> => c !== undefined)
          .filter((c) => c.category === calc.category && c.slug !== registrySlug && !related.some((r) => r.slug === c.slug));
        while (related.length < 4 && sameCat.length > 0) {
          related.push(sameCat.shift()!);
        }
      }

      return (
        <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
          <nav style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "#666" }}>
            <a href="/" style={{ color: "#5b21b6", textDecoration: "none" }}>Home</a>
            {" › "}
            {cat && catSeo && <><a href={`/${catSeo}`} style={{ color: "#5b21b6", textDecoration: "none" }}>{cat.name}</a>{" › "}</>}
            <span>{calc.name}</span>
          </nav>

          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>{calc.name}</h1>
          <p style={{ fontSize: "1.125rem", color: "#555", marginBottom: "2rem" }}>{calc.description}</p>

          <div style={{ padding: "1.5rem", background: "#f8f8f8", borderRadius: "0.75rem", marginBottom: "2rem", border: "1px solid #e0e0e0" }}>
            <p style={{ margin: 0, fontSize: "1rem" }}>
              <a href={`/#/calculator/${registrySlug}`} style={{ color: "#5b21b6", fontWeight: 600, textDecoration: "none" }}>
                Open the interactive {calc.name.toLowerCase()} →
              </a>
            </p>
            <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#777" }}>
              The calculator runs in your browser with live results, charts, and copy-to-clipboard.
            </p>
          </div>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>How to use this calculator</h2>
            <p style={{ color: "#444", lineHeight: 1.6 }}>
              Click "Open the interactive calculator" above to launch the tool. Enter your values in the input fields
              and results update instantly. Use the Reset button to restore defaults, and the Copy button to copy results.
            </p>
          </section>

          {related.length > 0 && (
            <section style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>Related calculators</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "0.75rem" }}>
                {related.map((r) => (
                  <div key={r.slug} style={{ padding: "0.75rem", border: "1px solid #e0e0e0", borderRadius: "0.5rem" }}>
                    <a href={`/${calculatorNameToSeoSlug(r.name)}`} style={{ fontWeight: 600, textDecoration: "none", color: "#5b21b6" }}>
                      {r.name}
                    </a>
                    <p style={{ fontSize: "0.8125rem", color: "#666", marginTop: "0.25rem" }}>{r.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {cat && catSeo && (
            <p style={{ marginTop: "2rem" }}>
              <a href={`/${catSeo}`} style={{ color: "#5b21b6", textDecoration: "none" }}>
                ← Browse all {cat.name} calculators
              </a>
            </p>
          )}

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: calc.name,
                description: calc.description,
                url: `${SITE_URL}/${slug}`,
                applicationCategory: cat?.name ?? "Calculator",
                operatingSystem: "Web browser",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              }),
            }}
          />
        </div>
      );
    }
  }

  // Check if it's a category page
  const catId = categorySeoToId.get(slug);
  if (catId) {
    const cat = getCategoryData(catId);
    if (cat) {
      const live = getLiveCalculatorSlugs()
        .map((s) => getLiveCalculatorMeta(s))
        .filter((c): c is NonNullable<typeof c> => c !== undefined)
        .filter((c) => c.category === catId);

      return (
        <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
          <nav style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "#666" }}>
            <a href="/" style={{ color: "#5b21b6", textDecoration: "none" }}>Home</a>
            {" › "}
            <span>{cat.name}</span>
          </nav>

          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>{cat.name} Calculators</h1>
          <p style={{ fontSize: "1.125rem", color: "#555", marginBottom: "0.5rem" }}>{cat.description}</p>
          <p style={{ color: "#777", marginBottom: "1.5rem" }}>{live.length} calculator{live.length === 1 ? "" : "s"} available</p>

          {live.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {live.map((c) => (
                <div key={c.slug} style={{ padding: "1rem", border: "1px solid #e0e0e0", borderRadius: "0.75rem" }}>
                  <a href={`/${calculatorNameToSeoSlug(c.name)}`} style={{ fontWeight: 600, textDecoration: "none", color: "#5b21b6" }}>
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
            <a href="/directory" style={{ color: "#5b21b6", textDecoration: "none" }}>← Browse all calculators</a>
          </p>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                name: `${cat.name} Calculators`,
                description: cat.description,
                url: `${SITE_URL}/${slug}`,
                hasPart: live.map((c) => ({
                  "@type": "WebApplication",
                  name: c.name,
                  url: `${SITE_URL}/${calculatorNameToSeoSlug(c.name)}`,
                })),
              }),
            }}
          />
        </div>
      );
    }
  }

  notFound();
}
