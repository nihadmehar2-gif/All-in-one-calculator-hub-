"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, BookOpen } from "lucide-react";
import { CalculatorRunner } from "@/components/site/CalculatorRunner";
import { RelatedCalculators } from "@/components/site/RelatedCalculators";
import { getCalculator } from "@/lib/calculators/registry";
import { getCategory } from "@/lib/calculators/categories";
import { route } from "@/lib/router";

interface Props {
  slug: string;
}

export function CalculatorView({ slug }: Props) {
  const calc = useMemo(() => getCalculator(slug), [slug]);

  if (!calc) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-semibold mb-2">Calculator not found</h1>
        <p className="text-muted-foreground mb-6">"{slug}" isn't in the registry.</p>
        <Button asChild>
          <a href={route.directory()}>Browse all calculators</a>
        </Button>
      </div>
    );
  }

  if (calc.status !== "live") {
    return (
      <div className="text-center py-16 max-w-lg mx-auto">
        <AlertCircle className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-semibold mb-2">{calc.name}</h1>
        <p className="text-muted-foreground mb-2">
          This calculator is on the roadmap but hasn't been published yet.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          We only publish calculators once their math is implemented and verified.
          It's tracked for Part {calc.part ?? "—"} of the build.
        </p>
        <div className="flex gap-2 justify-center">
          <Button asChild variant="outline">
            <a href={route.category(calc.category)}>Back to category</a>
          </Button>
          <Button asChild>
            <a href={route.directory()}>Browse available tools</a>
          </Button>
        </div>
      </div>
    );
  }

  const cat = getCategory(calc.category);

  return (
    <div className="space-y-6">
      <header className="pb-6 border-b">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{calc.name}</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">{calc.description}</p>
        {cat && (
          <a
            href={route.category(cat.id)}
            className="inline-block mt-3 text-xs text-muted-foreground hover:text-foreground"
          >
            ← Back to {cat.name}
          </a>
        )}
      </header>

      <CalculatorRunner key={calc.slug} calculator={calc} />

      {calc.learnMore && (
        <section className="rounded-md border bg-muted/30 p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold mb-2">
            <BookOpen className="h-4 w-4" />
            Learn more
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{calc.learnMore}</p>
        </section>
      )}

      <RelatedCalculators current={calc} limit={4} />
    </div>
  );
}
