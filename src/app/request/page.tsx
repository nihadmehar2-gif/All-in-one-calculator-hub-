import type { Metadata } from "next";
import { getLiveCalculators } from "@/lib/calculators/registry";

const SITE_URL = "https://everycalchub.vercel.app";

export const metadata: Metadata = {
  title: "Request a Calculator — EveryCalc",
  description: "Suggest a new calculator. We only publish tools whose formulas we can verify.",
  alternates: { canonical: `${SITE_URL}/request` },
};

export default function RequestPage() {
  const count = getLiveCalculators().length;
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
        <a href="/">Home</a> {" › "}
        <span>Request a Calculator</span>
      </nav>
      <h1>Request a Calculator</h1>
      <p style={{ fontSize: "1.125rem", color: "#555", marginBottom: "1.5rem" }}>
        We&apos;re constantly expanding the library with {count} calculators live today. If a calculator you need isn&apos;t here, tell us about it.
      </p>
      <p style={{ padding: "1rem", background: "#f8f8f8", borderRadius: "0.75rem" }}>
        To submit a request, use our interactive form which opens your email client with a pre-filled message.
      </p>
      <p style={{ marginTop: "1.5rem" }}>
        <a href="/#/request">Open interactive request form →</a>
      </p>
    </div>
  );
}
