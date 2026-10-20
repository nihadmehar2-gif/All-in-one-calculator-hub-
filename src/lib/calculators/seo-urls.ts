/**
 * EveryCalc — SEO URL Mapping
 * 
 * Maps calculator slugs (registry IDs) to SEO-friendly URLs.
 * Pattern: /{descriptive-name}-calculator
 * 
 * This is the single source of truth for URL generation across the app.
 * Both server components and client components use these functions.
 */

// Cache of slug → seoSlug
const seoSlugCache = new Map<string, string>();

/** Generate an SEO-friendly URL slug from a calculator name. */
export function calculatorNameToSeoSlug(name: string): string {
  if (seoSlugCache.has(name)) return seoSlugCache.get(name)!;

  let s = name.toLowerCase()
    .replace(/\band\b/gi, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  // Remove trailing "calculator" if present, then re-add for consistency
  s = s.replace(/-calculator$/, "");
  if (!s.endsWith("calculator")) s += "-calculator";
  
  seoSlugCache.set(name, s);
  return s;
}

/** Build the full calculator page URL path (without domain). */
export function calculatorUrlPath(registrySlug: string, name: string): string {
  return `/${calculatorNameToSeoSlug(name)}`;
}

/** Build the full category page URL path (without domain). */
export function categoryUrlPath(categoryId: string, categoryName: string): string {
  let s = categoryName.toLowerCase()
    .replace(/\band\b/gi, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  s = s.replace(/-calculators$/, "").replace(/-calculator$/, "");
  if (!s.endsWith("calculators")) s += "-calculators";
  return `/${s}`;
}

/** Build a reverse lookup: seoSlug → registrySlug */
export function buildSeoToRegistryMap(
  calculators: { slug: string; name: string }[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const c of calculators) {
    const seo = calculatorNameToSeoSlug(c.name);
    map.set(seo, c.slug);
  }
  return map;
}

/** Build a reverse lookup: categorySeoId → categoryId */
export function buildCategorySeoMap(
  categories: { id: string; name: string }[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const c of categories) {
    let s = c.name.toLowerCase()
      .replace(/\band\b/gi, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    s = s.replace(/-calculators$/, "").replace(/-calculator$/, "");
    if (!s.endsWith("calculators")) s += "-calculators";
    map.set(s, c.id);
  }
  return map;
}
