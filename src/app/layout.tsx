import type { Metadata } from "next";
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
  "EveryCalc is a free, open calculator platform. 100% client-side math across 31 categories — finance, health, math, science, conversions and more. No tracking, no signups.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EveryCalc — Every calculator in one place",
    template: "%s — EveryCalc",
  },
  description: SITE_DESCRIPTION,
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
    title: "EveryCalc — Every calculator in one place",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "EveryCalc",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EveryCalc",
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
      </head>
      <body
        className={`${fraunces.variable} ${sora.variable} ${jakarta.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </NextThemesProvider>
      </body>
    </html>
  );
}
