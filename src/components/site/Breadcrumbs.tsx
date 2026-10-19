"use client";

import { ChevronRight } from "lucide-react";
import { useRouter, route } from "@/lib/router";
import { getCategory } from "@/lib/calculators/categories";
import { getCalculator } from "@/lib/calculators/registry";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs() {
  const router = useRouter();
  const { segments, query } = router;
  const crumbs: Crumb[] = [{ label: "Home", href: route.home() }];

  if (segments[0] === "directory") {
    crumbs.push({ label: "All calculators" });
  } else if (segments[0] === "category" && segments[1]) {
    const cat = getCategory(segments[1]);
    if (cat) crumbs.push({ label: cat.name });
  } else if (segments[0] === "calculator" && segments[1]) {
    const calc = getCalculator(segments[1]);
    if (calc) {
      const cat = getCategory(calc.category);
      if (cat) crumbs.push({ label: cat.name, href: route.category(cat.id) });
      crumbs.push({ label: calc.name });
    }
  } else if (segments[0] === "search") {
    const q = query.get("q") ?? "";
    crumbs.push({ label: `Search: "${q}"` });
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
              {c.href && !isLast ? (
                <a href={c.href} className="hover:text-foreground">{c.label}</a>
              ) : (
                <span className={isLast ? "text-foreground font-medium" : ""}>{c.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
