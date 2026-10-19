"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Code, Cookie, Server, Mail } from "lucide-react";

/**
 * Privacy policy page.
 *
 * IMPORTANT: This policy must match the actual data practices of the site.
 * EveryCalc is a client-side-only calculator platform:
 *   - No backend database stores user inputs or calculations
 *   - No analytics are wired up (no GA, no Plausible, no nothing)
 *   - No advertising scripts
 *   - No cookies set by us
 *   - The only "form" on the site opens the user's own email client
 * If any of this changes, this page MUST be updated to match.
 */
export function PrivacyView() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-2">
        <Badge variant="secondary" className="gap-1">
          <Shield className="h-3 w-3" />
          Effective date: October 2025
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">
          EveryCalc is designed to be private by default. This page explains exactly what data we
          do (and don&apos;t) collect, in plain language.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Code className="h-4 w-4" />
            Calculator inputs and results
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>All math runs entirely in your browser.</strong> When you type numbers into a
            calculator, they never leave your device. We do not transmit, log, or store your
            inputs or results on any server.
          </p>
          <p>
            There is no backend database of calculator activity. Refreshing the page clears
            your inputs (we don&apos;t even use localStorage for them).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4" />
            Analytics and tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>We do not currently run any analytics on EveryCalc.</strong> No Google
            Analytics, no Plausible, no Mixpanel, no Hotjar, no Facebook Pixel — nothing.
          </p>
          <p>
            If we add privacy-friendly analytics in the future (e.g. a self-hosted, cookie-free
            option that only counts aggregate page views), we will update this page and disclose
            exactly what is collected. We will <strong>never</strong> add cross-site tracking
            or advertising scripts.
          </p>
          <p>
            Our hosting provider (whoever serves the static HTML and JavaScript) may keep
            standard server access logs (IP, user agent, request path) for security and abuse
            prevention. Those logs are not shared with us in identifiable form.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Cookie className="h-4 w-4" />
            Cookies and local storage
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>EveryCalc does not set any cookies.</strong>
          </p>
          <p>
            We do use your browser&apos;s theme preference (light/dark/system) which is stored
            by <code className="bg-muted px-1 py-0.5 rounded text-xs">next-themes</code> in
            localStorage. This stays on your device and is never sent to us.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            The calculator request form
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            The <a href="#/request" className="underline">request form</a> does <strong>not</strong>
            submit data to a server. Clicking &quot;submit&quot; opens your own email client
            (mailto: link) with a pre-filled message. The content goes directly from your email
            provider to ours — it never touches EveryCalc&apos;s infrastructure.
          </p>
          <p>
            If you provide your email address in the form, we&apos;ll only use it to reply to
            your specific request. We don&apos;t add addresses to a mailing list, and we
            don&apos;t sell or share them.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Third-party resources</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            EveryCalc loads fonts and UI libraries from our own domain. We do not embed
            third-party widgets (no YouTube, no Twitter, no Disqus, no Google reCAPTCHA).
          </p>
          <p>
            External links (e.g. to Wikipedia for formula references) go directly to the
            destination — we don&apos;t use redirect trackers.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your rights (GDPR / CCPA)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Because we don&apos;t collect personal data, there&apos;s nothing for us to delete,
            export, or correct. Calculator inputs stay in your browser; clear them by clearing
            your browser data or just refreshing the page.
          </p>
          <p>
            If you email us, that email becomes a record we hold. You can request deletion of
            past emails by replying to the relevant thread.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Changes to this policy</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            If we change what data we collect, we&apos;ll update this page and bump the effective
            date at the top. We will never silently add tracking or advertising — any change in
            that direction will be announced here first.
          </p>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center pt-4">
        Questions about privacy? Email{" "}
        <a href="mailto:privacy@nihad-calculator.vercel.app" className="underline">privacy@nihad-calculator.vercel.app</a>.
      </p>
    </div>
  );
}
