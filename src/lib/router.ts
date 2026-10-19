"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Tiny hash-based router for the EveryCalc SPA.
 *
 * The sandbox only exposes the `/` route in the preview iframe, so the
 * entire calculator platform lives behind the hash. Routes are bookmarkable
 * and the browser back button works as expected.
 *
 * Route shapes:
 *   #/                          — home (search + categories + directory)
 *   #/directory                 — A–Z full directory
 *   #/category/:id              — a single category page
 *   #/calculator/:slug          — a single calculator
 *   #/search?q=foo              — search results
 */

export interface ParsedRoute {
  path: string;
  segments: string[];
  query: URLSearchParams;
  raw: string;
}

function parseHash(): ParsedRoute {
  let h = window.location.hash || "#/";
  if (h.startsWith("#")) h = h.slice(1);
  if (!h.startsWith("/")) h = "/" + h;
  const [pathPart, queryPart] = h.split("?");
  const path = pathPart || "/";
  const segments = path.split("/").filter(Boolean);
  const query = new URLSearchParams(queryPart ?? "");
  return { path, segments, query, raw: h };
}

export function useRouter(): ParsedRoute & { navigate: (to: string) => void } {
  const [route, setRoute] = useState<ParsedRoute>(() =>
    typeof window === "undefined" ? { path: "/", segments: [], query: new URLSearchParams(), raw: "/" } : parseHash(),
  );

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    // Ensure we always have a hash so back/forward behaves predictably.
    if (!window.location.hash) window.location.replace("#/");
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    if (!to.startsWith("#")) to = "#" + (to.startsWith("/") ? to : "/" + to);
    if (window.location.hash === to) {
      // Force a re-render even if hash is identical (e.g., search with same q)
      setRoute(parseHash());
    } else {
      window.location.hash = to;
    }
    // Scroll to top on every navigation
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return { ...route, navigate };
}

/** Build a route URL for navigation / href attributes. */
export const route = {
  home: () => "#/",
  directory: () => "#/directory",
  category: (id: string) => `#/category/${id}`,
  calculator: (slug: string) => `#/calculator/${slug}`,
  search: (q: string) => `#/search?q=${encodeURIComponent(q)}`,
};
