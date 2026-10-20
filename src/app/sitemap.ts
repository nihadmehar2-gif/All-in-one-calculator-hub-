import type { MetadataRoute } from "next";
import { getLiveCalculatorSlugs, getLiveCalculatorMeta, getCategoryCountsData } from "@/lib/calculators/registry-data";
import { CATEGORIES_DATA } from "@/lib/calculators/categories-data";
import { calculatorNameToSeoSlug, categoryUrlPath } from "@/lib/calculators/seo-urls";

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
      const catSeo = categoryUrlPath(cat.id, cat.name).slice(1);
      entries.push({
        url: `${SITE_URL}/${catSeo}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // All live calculator pages with SEO-friendly URLs
  for (const slug of getLiveCalculatorSlugs()) {
    const meta = getLiveCalculatorMeta(slug);
    if (meta) {
      const seoSlug = calculatorNameToSeoSlug(meta.name);
      entries.push({
        url: `${SITE_URL}/${seoSlug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
