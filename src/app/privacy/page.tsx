import type { Metadata } from "next";

const SITE_URL = "https://nihad-calculator.vercel.app";

export const metadata: Metadata = {
  title: "Privacy Policy — EveryCalc",
  description: "EveryCalc privacy policy. All calculator math runs in your browser. No analytics, no cookies, no backend storage.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
        <a href="/">Home</a> {" › "}
        <span>Privacy Policy</span>
      </nav>
      <h1>Privacy Policy</h1>
      <p style={{ fontSize: "1.125rem", color: "#555", marginBottom: "1.5rem" }}>
        EveryCalc is designed to be private by default. This page explains exactly what data we do (and don&apos;t) collect.
      </p>

      <h2>Calculator Inputs and Results</h2>
      <p>All math runs entirely in your browser. When you type numbers into a calculator, they never leave your device. We do not transmit, log, or store your inputs or results on any server.</p>

      <h2>Analytics and Tracking</h2>
      <p>We use Google Analytics 4 (GA4) to understand aggregate traffic patterns — page views, session duration, and approximate geographic region. GA4 does NOT collect your calculator inputs, results, or personal information. All calculator math runs entirely in your browser.</p>

      <h2>Cookies</h2>
      <p>Google Analytics sets two cookies (_ga and _ga_) containing a randomly generated anonymous ID — not your name or email. We also use your browser&apos;s theme preference (light/dark) stored in localStorage. You can block GA4 cookies in your browser settings without affecting calculator functionality.</p>

      <h2>Calculator Request Form</h2>
      <p>The request form does not submit data to a server. Clicking submit opens your email client with a pre-filled message. The content goes directly from your email provider to ours.</p>

      <h2>Third-Party Resources</h2>
      <p>EveryCalc loads fonts and UI libraries from its own domain. We do not embed third-party widgets.</p>

      <h2>Your Rights</h2>
      <p>Because we don&apos;t collect personal data, there&apos;s nothing for us to delete or export. Calculator inputs stay in your browser.</p>

      <p style={{ marginTop: "2rem" }}>
        <a href="/#/privacy">Open full interactive privacy policy →</a>
      </p>
    </div>
  );
}
