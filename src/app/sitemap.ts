import type { MetadataRoute } from "next";
import { getLiveCalculatorSlugs, getCategoryCountsData } from "@/lib/calculators/registry-data";
import { CATEGORIES_DATA } from "@/lib/calculators/categories-data";

const SITE_URL = "https://nihad-calculator.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/directory`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/request`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  // Category pages with live calculators
  const counts = getCategoryCountsData();
  for (const cat of CATEGORIES_DATA) {
    if ((counts[cat.id] ?? 0) > 0) {
      entries.push({
        url: `${SITE_URL}/category/${cat.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // All live calculator pages
  for (const slug of getLiveCalculatorSlugs()) {
    entries.push({
      url: `${SITE_URL}/calculator/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
