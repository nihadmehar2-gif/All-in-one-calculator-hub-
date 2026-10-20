import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Sora, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Display serif for hero headings and large numbers — beautiful optical sizing
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

// Geometric sans for section/card headings — modern, distinctive
const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Refined body font — more personality than Geist, very readable
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Keep mono for code/numbers
const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://nihad-calculator.vercel.app";
const SITE_DESCRIPTION =
  "Every Calculator — your all-in-one calculator hub with 224 free online calculators across 31 categories. Finance, health, math, science, conversions and more. No tracking, no signups.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Every Calculator — Free Online Calculators | All-in-One Calculator Hub",
    template: "%s — Every Calculator",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  keywords: [
    "calculator", "calculators", "free calculator", "online calculator",
    "finance calculator", "loan calculator", "BMI", "unit converter",
    "math calculator", "percentage calculator", "compound interest",
    "statistics calculator", "geometry calculator", "EveryCalc",
  ],
  authors: [{ name: "EveryCalc" }],
  applicationName: "EveryCalc",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Every Calculator — Free Online Calculators | All-in-One Calculator Hub",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Every Calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Every Calculator — Free Online Calculators",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="ZD9SdIXWF3yJhDc3HSp5Ti6QufX1rrttnUxM6AFeVSY" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Every Calculator",
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/#/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${fraunces.variable} ${sora.variable} ${jakarta.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Google Analytics (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7ZZQ8MD3P5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7ZZQ8MD3P5', {
              page_path: window.location.pathname + window.location.hash,
            });
          `}
        </Script>
        <noscript>
          <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Every Calculator — Free Online Calculators</h2>
            <p>Every Calculator is your all-in-one calculator hub with 224 free online calculators across 31 categories. All math runs locally in your browser — no tracking, no signups.</p>
            <h2>Categories</h2>
            <ul>
              <li>Basic Mathematics — percentage, average, fractions, GCD/LCM, scientific calculator</li>
              <li>Finance and Banking — loan payment, compound interest, mortgage, retirement, credit card payoff</li>
              <li>Health and Fitness — BMI, BMR, body fat, heart rate zones, hydration, macros</li>
              <li>Statistics and Probability — mean, median, standard deviation, binomial, normal distribution</li>
              <li>Geometry — triangle area, circle, sphere, cylinder, polygon, coordinate geometry</li>
              <li>Algebra — linear equations, quadratic solver, systems, sequences, permutations</li>
              <li>Calculus — numerical derivative, definite integral</li>
              <li>Science and Physics — Ohm&apos;s law, kinematics, force, energy, gas laws</li>
              <li>Chemistry — molar mass, molarity, dilution</li>
              <li>Engineering — resistor color code, voltage divider, RC constant, gear ratio</li>
              <li>Construction — concrete volume, paint coverage, roofing, lumber, HVAC</li>
              <li>Tax and Salary — income tax, take-home pay, sales tax, zakat</li>
              <li>Business — margin, breakeven, ROI, depreciation, inventory turnover</li>
              <li>Real Estate — rent vs buy, rental yield, LTV ratio, property tax</li>
              <li>Conversions — length, mass, temperature, speed, volume, pressure, area, energy</li>
              <li>Date and Time — date difference, age, workday counter, timezone converter</li>
              <li>Computer Science — number base, bitwise, color converter</li>
              <li>Data and Networking — data size, download time, subnet, screen resolution</li>
              <li>Education — GPA, CGPA, marks percentage, weighted average, significant figures</li>
              <li>And many more — automotive, cooking, agriculture, environment, sports, pets, astronomy, manufacturing, logistics, productivity</li>
            </ul>
            <p>Please enable JavaScript to use the calculators.</p>
          </div>
        </noscript>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </NextThemesProvider>
      </body>
    </html>
  );
}
