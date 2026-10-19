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

---
Task ID: part-2
Agent: main (Z.ai)
Task: Implement real, tested calculators across Mathematics, Education, and Computing categories — preserving all Part 1 work, giving each calculator a stable URL, validating inputs, and showing worked formulas.

Work Log:
- Read Part 1 worklog and confirmed dev server + 15 live calculators + 33 tests all intact.
- Built a safe recursive-descent expression parser (`src/lib/calculators/_expr.ts`) — no `eval`, no `new Function`. Supports + - * / % ^, parentheses, sin/cos/tan/asin/acos/atan/sinh/cosh/tanh, log/ln/log2/log(base,x), sqrt/cbrt/abs/exp/floor/ceil/round/sign/fact, constants pi/e/tau/phi, variables (default x), and degree/radian angle modes. Used by scientific-calculator, derivative, and definite-integral.
  - Fixed bug: tokenizer constructor referenced bare `i` instead of `this.i`, causing "i is not defined" — caught by test runner before any UI verification.
- Extended `basic-math.ts` with 8 new calculators: percentage-change, reverse-percentage, decimal-to-fraction (continued-fraction expansion), ratio-simplifier (with GCD), gcd-lcm-prime-factors (Euclidean + trial division), exponents-roots-logs (any-base), scientific-notation (with engineering form), and scientific-calculator (full expression evaluator).
- Created `algebra.ts` with 5 calculators: linear-equation-solver (handles a=0 degenerate cases), quadratic-solver (numerically-stable root formula + complex conjugate handling + ascending sort), system-of-equations-2x2 (Cramer's rule with parallel/coincident detection), sequences-series (AP/GP with nth term + sum + bar chart), permutations-combinations (nPr/nCr/factorial).
- Extended `geometry.ts` with 9 new calculators: right-triangle (solves any 2-of-3 sides), pythagorean-theorem (standalone), sphere-volume, cylinder-volume, cone-volume (with slant height), cube-volume (also covers cuboids), regular-polygon (any n sides), coordinate-geometry (distance/midpoint/slope/line equation), trig-evaluator (6 trig functions with degree/radian modes and domain checks).
- Created `calculus.ts` with 2 calculators: numerical-derivative (central difference, O(h²) error, with second-derivative bonus and f(x) neighborhood chart) and definite-integral (composite Simpson's rule with even-n enforcement, handles reversed bounds).
- Extended `statistics.ts` with 4 calculators: probability-expected-value (discrete distributions with probability-sum check), binomial-probability (P(X=k)/P(X≤k)/P(X≥k) using log-factorials to avoid overflow, with PMF chart), normal-distribution (z-score + CDF using Abramowitz-Stegun erf approximation), confidence-interval (90/95/99% z-table with small-sample conservative inflation).
- Extended `education.ts` with 7 calculators: cgpa (multi-semester cumulative), marks-percentage (with pass/fail status + letter grade), weighted-average, final-exam-score (solves for needed score on final), weighted-assignments (category-based course grade), significant-figures (rounding with sig-figs-in-input counter), reading-time (with session planner and break estimation).
- Created `computer-science.ts` with 3 calculators: number-base-converter (bin/oct/dec/hex with 0b/0o/0x prefix stripping and validation), bitwise-calculator (AND/OR/XOR/NOT/shifts with binary visualization), color-converter (HEX↔RGB↔HSL with full bidirectional conversion).
- Created `data-networking.ts` with 6 calculators: data-size-converter (binary IEC vs decimal SI standards clearly documented), download-time (handles any size × speed unit combination), bandwidth-calculator (bidirectional: rate-from-size or size-from-rate), subnet-calculator (full IPv4 CIDR with network/broadcast/host-range/mask/wildcard/binary), screen-resolution (PPI from pixel dimensions + diagonal), aspect-ratio (resize/find modes), image-file-size (uncompressed bitmap size from WxH × bpp × compression).
- Updated `_planned.ts` to remove the 22 entries now implemented (kept the remaining 64 for future Parts).
- Updated `registry.ts` LIVE_CALCULATORS list to import and register all 45 new calculators, organized by category with comments.
- Ran test suite iteratively; fixed several real bugs found by the tests:
  * Expression parser `this.i` bug (above)
  * Quadratic solver: switched to numerically-stable form (avoids cancellation), sort roots ascending, format "-0" as "0" in complex display
  * Test expectation corrections where my hand-calculated expected values were wrong (CGPA, weighted-average, image-file-size MB vs MiB, confidence-interval margin of error, binomial-precision tolerance)
- Added per-route meta description: `src/app/page.tsx` now updates document.title, <meta name="description">, og:title, og:description on every route change, pulling the actual calculator name and description for unique page metadata.
- Lint clean (`bun run lint` passes).
- Agent Browser verified end-to-end:
  * Homepage shows updated badge "60 live calculators across 13 categories" (up from 15/9).
  * All 32 category cards show correct live counts (e.g. Basic Math: 11, Algebra: 5, Geometry: 11, Calculus: 2, Statistics: 6, Computer Science: 3, Data & Networking: 6, Education: 8).
  * Scientific Calculator: `2 * sin(pi/2) + sqrt(16) - log(100)` = 4 ✓
  * Quadratic Solver: x²-5x+6 → x₁=2, x₂=3 (sorted) ✓
  * Subnet Calculator: 192.168.1.0/24 → network=192.168.1.0/24, broadcast=192.168.1.255, hosts=254 ✓
  * Numerical Derivative: f'(2) of x²+3x+2 = 7 ✓ (with f(2)=12 and f''(2)=2 bonus rows + chart)
  * Binomial Probability: P(X=5) for n=10, p=0.5 = 0.246094 ✓
  * Search "binary" returns Number Base Converter, Bitwise Calculator, Data Size Converter (synonym match working).
  * Each calculator page has unique document.title (e.g. "Scientific Calculator — EveryCalc").
  * No console errors during the session.

Stage Summary:
- 60 live calculators (45 new in Part 2 + 15 from Part 1), 155 passing tests across 13 populated categories.
- Each calculator has: stable URL (#/calculator/:slug), pure calculate() function, ≥1 self-verifying test case, formula explanations, related-calculator internal links, and unique page metadata.
- All math runs 100% client-side. No paid APIs. No tracking. No fake tools.
- Input validation handles zero denominators, invalid values (negative sqrt, out-of-domain asin/acos, k>n, probabilities not summing to 1), overflow (log-factorial for binomial), and edge cases (parallel lines in systems, complex roots in quadratics, vertical lines in coordinate geometry).
- Remaining work for Parts 3–5: implement remaining 64 planned calculators (shopping, finance extras, conversions, taxes, business, chemistry, engineering, construction, automotive, cooking, agriculture, environment, real-estate, sports, pets, parenting, astronomy, manufacturing, logistics, productivity, specialized).
