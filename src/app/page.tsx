"use client";

import { useEffect } from "react";
import { useRouter } from "@/lib/router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { HomeView } from "@/components/views/HomeView";
import { CategoryView } from "@/components/views/CategoryView";
import { CalculatorView } from "@/components/views/CalculatorView";
import { SearchView } from "@/components/views/SearchView";
import { DirectoryView } from "@/components/views/DirectoryView";
import { RequestView } from "@/components/views/RequestView";
import { PrivacyView } from "@/components/views/PrivacyView";
import { NotFoundView } from "@/components/views/NotFoundView";
import { getCategory } from "@/lib/calculators/categories";
import { getCalculator, getLiveCalculators } from "@/lib/calculators/registry";

// Production domain — update this if deploying to a different URL.
const SITE_URL = "https://everycalchub.vercel.app";

/**
 * EveryCalc SPA shell.
 *
 * The sandbox only exposes the `/` route, so the entire calculator platform
 * lives behind the hash. The router (see src/lib/router.ts) parses
 * `#/`, `#/directory`, `#/category/:id`, `#/calculator/:slug`,
 * `#/search?q=`, `#/request`, `#/privacy` and we render the matching view below.
 *
 * Per-route document.title, <meta name="description">, canonical URL, and
 * JSON-LD structured data are kept in sync here so each page has unique,
 * indexable metadata for SEO.
 */
export default function Home() {
  const router = useRouter();
  const { segments, query } = router;

  useEffect(() => {
    let title = "Every Calculator — Free Online Calculators | All-in-One Calculator Hub";
    let description = "Every Calculator — your all-in-one calculator hub with 224 free online calculators across 31 categories. Finance, health, math, science, conversions and more. No tracking, no signups.";
    let canonicalPath = "/";
    let jsonLdType: "website" | "calculator" | "webpage" | null = "website";

    if (segments[0] === "directory") {
      title = "All calculators — EveryCalc";
      description = `Browse all ${getLiveCalculators().length} live EveryCalc calculators, grouped by category. Finance, math, health, conversions, statistics and more — all 100% client-side.`;
      canonicalPath = "/#/directory";
      jsonLdType = "webpage";
    } else if (segments[0] === "category" && segments[1]) {
      const id = decodeURIComponent(segments[1]);
      const cat = getCategory(id);
      if (cat) {
        title = `${cat.name} calculators — EveryCalc`;
        description = `${cat.description} Available calculators in the ${cat.name} category, all with worked examples and self-verifying math.`;
        canonicalPath = `/#/category/${id}`;
        jsonLdType = "webpage";
      }
    } else if (segments[0] === "calculator" && segments[1]) {
      const slug = decodeURIComponent(segments[1]);
      const calc = getCalculator(slug);
      if (calc && calc.status === "live") {
        title = `${calc.name} — EveryCalc`;
        description = calc.description;
        canonicalPath = `/#/calculator/${slug}`;
        jsonLdType = "calculator";
      }
    } else if (segments[0] === "search") {
      const q = query.get("q") ?? "";
      title = `Search: ${q} — EveryCalc`;
      description = `Search results for "${q}" across all EveryCalc calculators.`;
      canonicalPath = `/#/search?q=${encodeURIComponent(q)}`;
      jsonLdType = null; // search results pages shouldn't be indexed
    } else if (segments[0] === "request") {
      title = "Request a calculator — EveryCalc";
      description = "Suggest a new calculator. We only publish tools whose formulas we can verify — describe what you need and we'll consider building it.";
      canonicalPath = "/#/request";
      jsonLdType = "webpage";
    } else if (segments[0] === "privacy") {
      title = "Privacy Policy — EveryCalc";
      description = "EveryCalc's privacy policy. All calculator math runs in your browser. We don't run analytics, advertising, or set cookies. Read the full details.";
      canonicalPath = "/#/privacy";
      jsonLdType = "webpage";
    }

    document.title = title;

    // Meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", SITE_URL + canonicalPath);

    // robots meta — don't index search results
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", segments[0] === "search" ? "noindex, follow" : "index, follow");

    // Open Graph
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", title);
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute("content", description);
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute("content", SITE_URL + canonicalPath);

    // Twitter card
    let twTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twTitle) {
      twTitle = document.createElement("meta");
      twTitle.setAttribute("name", "twitter:title");
      document.head.appendChild(twTitle);
    }
    twTitle.setAttribute("content", title);
    let twDesc = document.querySelector('meta[name="twitter:description"]');
    if (!twDesc) {
      twDesc = document.createElement("meta");
      twDesc.setAttribute("name", "twitter:description");
      document.head.appendChild(twDesc);
    }
    twDesc.setAttribute("content", description);

    // JSON-LD structured data (replace any existing)
    const existingJsonLd = document.getElementById("jsonld-dynamic");
    if (existingJsonLd) existingJsonLd.remove();
    if (jsonLdType) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "jsonld-dynamic";
      const jsonLd: Record<string, unknown> = {
        "@context": "https://schema.org",
      };
      if (jsonLdType === "website") {
        jsonLd["@type"] = "WebSite";
        jsonLd.name = "Every Calculator";
        jsonLd.url = SITE_URL + "/";
        jsonLd.description = description;
        jsonLd.potentialAction = {
          "@type": "SearchAction",
          target: `${SITE_URL}/#/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        };
      } else if (jsonLdType === "calculator") {
        const slug = decodeURIComponent(segments[1] ?? "");
        const calc = getCalculator(slug);
        if (calc) {
          const cat = getCategory(calc.category);
          jsonLd["@type"] = "WebApplication";
          jsonLd.name = calc.name;
          jsonLd.description = calc.description;
          jsonLd.url = `${SITE_URL}/#/calculator/${slug}`;
          jsonLd.applicationCategory = cat?.name ?? "Calculator";
          jsonLd.operatingSystem = "Web browser";
          jsonLd.offers = { "@type": "Offer", price: "0", priceCurrency: "USD" };
        }
      } else if (jsonLdType === "webpage") {
        jsonLd["@type"] = "WebPage";
        jsonLd.name = title.replace(" — EveryCalc", "");
        jsonLd.description = description;
        jsonLd.url = SITE_URL + canonicalPath;
        jsonLd.isPartOf = { "@type": "WebSite", name: "EveryCalc", url: SITE_URL + "/" };
      }
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [segments, query]);

  let view: React.ReactNode;
  let is404 = false;
  if (segments[0] === "directory") view = <DirectoryView />;
  else if (segments[0] === "category" && segments[1]) {
    const id = decodeURIComponent(segments[1]);
    if (getCategory(id)) {
      view = <CategoryView categoryId={id} />;
    } else {
      view = <NotFoundView message={`The category "${id}" doesn't exist. Try browsing from the home page.`} />;
      is404 = true;
    }
  }
  else if (segments[0] === "calculator" && segments[1]) {
    const slug = decodeURIComponent(segments[1]);
    const calc = getCalculator(slug);
    if (calc && calc.status === "live") {
      view = <CalculatorView slug={slug} />;
    } else if (calc && calc.status === "planned") {
      // CalculatorView handles planned state itself
      view = <CalculatorView slug={slug} />;
    } else {
      view = <NotFoundView message={`The calculator "${slug}" doesn't exist. It may have been renamed — try searching.`} />;
      is404 = true;
    }
  }
  else if (segments[0] === "search") view = <SearchView query={query.get("q") ?? ""} />;
  else if (segments[0] === "request") view = <RequestView />;
  else if (segments[0] === "privacy") view = <PrivacyView />;
  else if (segments[0] === undefined || segments[0] === "") view = <HomeView />;
  else {
    view = <NotFoundView />;
    is404 = true;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      {!is404 && <Breadcrumbs />}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-8">
        {view}
      </main>
      <Footer />
    </div>
  );
}
