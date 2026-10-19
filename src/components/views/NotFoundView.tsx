"use client";

import { Compass, Search, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { route } from "@/lib/router";
import { getLiveCalculators } from "@/lib/calculators/registry";

/**
 * Custom 404 / not-found view.
 *
 * Triggered when:
 *   - The hash route points to a category or calculator slug that doesn't exist
 *   - The user manually types a bad URL
 *
 * Note: because we're a hash-based SPA, the actual HTTP status is always 200
 * for `/`. This view is what users see when the route resolves to nothing.
 */
export function NotFoundView({ message }: { message?: string }) {
  const totalCalcs = getLiveCalculators().length;
  return (
    <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Compass className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-5xl font-bold tracking-tight">404</h1>
        <h2 className="text-xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {message ?? "We couldn't find what you're looking for. The calculator may have been renamed or removed, or the URL might have a typo."}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild variant="default">
          <a href={route.home()}>
            <Home className="h-4 w-4 mr-1.5" />
            Back to home
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={route.directory()}>
            <Search className="h-4 w-4 mr-1.5" />
            Browse all {totalCalcs} calculators
          </a>
        </Button>
        <Button asChild variant="ghost">
          <a href={route.search("")}>
            <Search className="h-4 w-4 mr-1.5" />
            Search
          </a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground pt-6">
        Looking for a calculator we don&apos;t have?{" "}
        <a href={route.request()} className="underline hover:text-foreground">Request it</a>.
      </p>
    </div>
  );
}
