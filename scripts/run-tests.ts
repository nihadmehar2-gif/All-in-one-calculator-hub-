/**
 * Standalone test-runner CLI — execute with: bun run scripts/run-tests.ts
 * Exits non-zero if any test fails, so it can be wired into CI later.
 */
import { runTestSuite, summarize } from "../src/lib/calculators/test-runner";

const results = runTestSuite();
const summary = summarize(results);

console.log("═══════════════════════════════════════════");
console.log(" EveryCalc — Calculator Test Suite Results ");
console.log("═══════════════════════════════════════════");
console.log(` Calculators tested : ${summary.totalCalculators}`);
console.log(` Tests passed       : ${summary.totalPassed}`);
console.log(` Tests failed       : ${summary.totalFailed}`);
console.log(` Overall            : ${summary.allGreen ? "PASS ✅" : "FAIL ❌"}`);
console.log("───────────────────────────────────────────");

for (const r of results) {
  const status = r.failed === 0 ? "✅" : "❌";
  console.log(`  ${status}  ${r.slug.padEnd(28)}  ${r.passed}/${r.passed + r.failed} passed`);
  for (const f of r.failures) {
    console.log(`       ✗ ${f.testName}: ${f.message}`);
  }
}

if (!summary.allGreen) {
  console.log("\nSome tests failed.");
  process.exit(1);
} else {
  console.log("\nAll tests passed.");
}
