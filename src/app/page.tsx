"use client";

import { useEffect } from "react";
import { useRouter, route } from "@/lib/router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { HomeView } from "@/components/views/HomeView";
import { CategoryView } from "@/components/views/CategoryView";
import { CalculatorView } from "@/components/views/CalculatorView";
import { SearchView } from "@/components/views/SearchView";
import { DirectoryView } from "@/components/views/DirectoryView";

export default function Home() {
  const router = useRouter();
  const { segments, query } = router;

  // Keep document.title in sync with the route for basic SEO/UX.
  useEffect(() => {
    let title = "EveryCalc — Every calculator in one place";
    if (segments[0] === "directory") title = "All calculators — EveryCalc";
    else if (segments[0] === "category" && segments[1]) title = `${decodeURIComponent(segments[1]).replace(/-/g, " ")} — EveryCalc`;
    else if (segments[0] === "calculator" && segments[1]) title = `${decodeURIComponent(segments[1]).replace(/-/g, " ")} — EveryCalc`;
    else if (segments[0] === "search") title = `Search: ${query.get("q") ?? ""} — EveryCalc`;
    document.title = title;
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
