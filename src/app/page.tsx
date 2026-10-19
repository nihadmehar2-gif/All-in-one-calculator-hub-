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
import { getCategory } from "@/lib/calculators/categories";
import { getCalculator } from "@/lib/calculators/registry";
import { getLiveCalculators } from "@/lib/calculators/registry";

/**
 * EveryCalc SPA shell.
 *
 * The sandbox only exposes the `/` route, so the entire calculator platform
 * lives behind the hash. The router (see src/lib/router.ts) parses
 * `#/`, `#/directory`, `#/category/:id`, `#/calculator/:slug`,
 * `#/search?q=` and we render the matching view below.
 *
 * Per-route document.title and <meta name="description"> are kept in sync
 * here so each calculator has unique, shareable metadata for SEO.
 */
export default function Home() {
  const router = useRouter();
  const { segments, query } = router;

  useEffect(() => {
    let title = "EveryCalc — Every calculator in one place";
    let description = "EveryCalc is a free, open calculator platform with hundreds of tools across 32 categories. All math runs locally in your browser — no tracking, no signups.";

    if (segments[0] === "directory") {
      title = "All calculators — EveryCalc";
      description = `Browse all ${getLiveCalculators().length} live EveryCalc calculators, grouped by category. Finance, math, health, conversions, statistics and more — all 100% client-side.`;
    } else if (segments[0] === "category" && segments[1]) {
      const id = decodeURIComponent(segments[1]);
      const cat = getCategory(id);
      if (cat) {
        title = `${cat.name} calculators — EveryCalc`;
        description = `${cat.description} Available calculators in the ${cat.name} category, all with worked examples and self-verifying math.`;
      }
    } else if (segments[0] === "calculator" && segments[1]) {
      const slug = decodeURIComponent(segments[1]);
      const calc = getCalculator(slug);
      if (calc) {
        title = `${calc.name} — EveryCalc`;
        description = calc.description;
      }
    } else if (segments[0] === "search") {
      const q = query.get("q") ?? "";
      title = `Search: ${q} — EveryCalc`;
      description = `Search results for "${q}" across all EveryCalc calculators.`;
    }

    document.title = title;

    // Update or create the meta description tag
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);

    // Also update og:title and og:description for share previews
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
  }, [segments, query]);

  let view: React.ReactNode;
  if (segments[0] === "directory") view = <DirectoryView />;
  else if (segments[0] === "category" && segments[1]) view = <CategoryView categoryId={decodeURIComponent(segments[1])} />;
  else if (segments[0] === "calculator" && segments[1]) view = <CalculatorView slug={decodeURIComponent(segments[1])} />;
  else if (segments[0] === "search") view = <SearchView query={query.get("q") ?? ""} />;
  else view = <HomeView />;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <Breadcrumbs />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-8">
        {view}
      </main>
      <Footer />
    </div>
  );
}
