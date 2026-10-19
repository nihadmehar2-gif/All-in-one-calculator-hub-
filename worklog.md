---
Task ID: part-1
Agent: main (Z.ai)
Task: Build a scalable calculator platform foundation ("EveryCalc") — directory, search, 32 categories, working calculators with tests, and an architecture that supports hundreds of future calculators without UI changes.

Work Log:
- Loaded fullstack-dev skill and bootstrapped Next.js 16 project (already in workspace as skeleton, no pre-existing EveryCalc code).
- Designed central type system (`src/lib/calculators/types.ts`) defining Category, FieldSchema, CalculatorResult, TestCase, CalculatorDefinition, TestResult, SearchResult.
- Defined 32 categories with stable ids, Lucide icons, color tokens, and roadmap order (`src/lib/calculators/categories.tsx`).
- Implemented 15 fully working calculators across 9 categories, each with a pure `calculate()` function and self-verifying test cases:
    * basic-math: percentage, average, fraction-to-decimal
    * finance: loan-payment (with amortization chart), compound-interest (with growth chart)
    * health: bmi (metric + imperial)
    * conversions: length-converter (8 units), temperature-converter (4 scales)
    * date-time: date-difference
    * statistics: median-mode, standard-deviation
    * geometry: triangle-area-heron, circle-area
    * science: ohms-law
    * education: gpa
- Registered 60+ "planned" calculators with `status: "planned"` (no calculate fn, no tests) — invisible to search/UI but tracked for future Parts (`src/lib/calculators/impl/_planned.ts`).
- Built central registry (`src/lib/calculators/registry.ts`) with validateRegistry() guard against duplicate slugs and dangling references.
- Built search engine (`src/lib/calculators/search.ts`) with weighted token matching across name / description / category / curated synonyms.
- Built test runner (`src/lib/calculators/test-runner.ts`) + CLI (`scripts/run-tests.ts`) — 33/33 tests pass.
- Built tiny hash router (`src/lib/router.ts`) — required because the sandbox only exposes the `/` route; the entire SPA lives behind the hash.
- Built UI shell: Header (sticky, with live search dropdown), Footer (sticky, mt-auto), Breadcrumbs, CalculatorCard, FieldRenderer (typed: number/text/select/checkbox/date/textarea), CalculatorRunner (live recomputes, key-based remount), ResultRow, ResultChart (recharts line/bar/pie), RelatedCalculators.
- Built views: HomeView (hero + featured + all 32 categories), CategoryView (live + roadmap), CalculatorView (runner + related), SearchView, DirectoryView (A–Z grouped by category).
- Replaced `src/app/page.tsx` with main app shell that routes via hash segments; updates document.title per route for SEO.
- Updated `src/app/layout.tsx` with EveryCalc metadata (title template, OG, Twitter, robots), next-themes ThemeProvider.
- Updated `public/robots.txt` with sitemap reference; added `public/sitemap.xml`.
- Fixed bug found by Agent Browser: Next.js `<Link>` intercepts clicks and doesn't fire `hashchange` for hash-only hrefs — switched all internal links to plain `<a>` tags.
- Lint clean (`bun run lint` passes).
- Agent Browser golden-path verified: homepage renders all 32 categories + 6 featured calculators; BMI page computes correctly (70kg/175cm → 22.9 Normal); live input updates work (185/90 → 26.3 Overweight); loan-payment matches test ($1,264.14/mo for $200k @ 6.5%/30y) and renders amortization chart; search "interest" returns compound-interest + loan-payment; directory shows all 15 grouped by category; taxes category page honestly shows "0 live calculators · 3 planned"; mobile viewport (375×812) renders correctly with working mobile menu.
- No runtime/console errors during the session.

Stage Summary:
- Architecture: central registry → live/planned calculators → search/router → typed UI. Adding a new calculator requires only appending to `LIVE_CALCULATORS` or `PLANNED_CALCULATORS` — zero UI or routing changes.
- 15 live calculators, 33 passing tests, 9 of 32 categories populated, 60+ planned calculators tracked.
- Single hash-routed SPA at `/`; future Parts can either extend the hash router or migrate to real Next.js routes without touching calculator code.
- Honest reporting: every published calculator works; "planned" calculators never appear in search, directory, or category "available" lists.
- Remaining work for Parts 2–5: implement planned calculators by category (Part 2: shopping, basic-math extensions, finance extras, conversions; Part 3: algebra, calculus, statistics distributions, taxes, business, education, CS, productivity; Part 4: chemistry, engineering, construction, data-networking, automotive, cooking, agriculture, environment; Part 5: pets, parenting, astronomy, manufacturing, logistics, specialized, real-estate, sports).
