"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Mail, CheckCircle2, MessageSquare } from "lucide-react";
import { CATEGORIES } from "@/lib/calculators/categories";
import { getLiveCalculators } from "@/lib/calculators/registry";
import { route } from "@/lib/router";

/**
 * Calculator request / suggestion page.
 *
 * Users describe what they need. We don't store anything server-side — the
 * submission generates a mailto: link (or the user can copy the description
 * into their own email). This is honest: we don't pretend to "submit" data
 * we never receive.
 */
export function RequestView() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const liveCount = getLiveCalculators().length;
  const requestEmail = "calc-requests@everycalc.app";
  const mailtoSubject = title ? `Calculator request: ${title}` : "Calculator request";
  const mailtoBody = `Title: ${title}

Category: ${category}

Description:
${description}

${email ? `Reply-to: ${email}` : ""}

---
Sent from EveryCalc's request form (https://everycalc.app/#/request)`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Open the user's email client with a pre-filled message
    window.location.href = `mailto:${requestEmail}?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`;
    setSubmitted(true);
  }

  function copyToClipboard() {
    navigator.clipboard?.writeText(`${mailtoSubject}\n\n${mailtoBody}`);
    setSubmitted(true);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-2">
        <Badge variant="secondary" className="gap-1">
          <Lightbulb className="h-3 w-3" />
          {liveCount} calculators live · suggestions welcome
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Request a calculator</h1>
        <p className="text-muted-foreground">
          We&apos;re constantly expanding the library. If a calculator you need isn&apos;t here,
          tell us about it. We only publish tools whose formulas, inputs and assumptions we can
          verify — so requests may take time, but we never publish half-built calculators.
        </p>
      </header>

      {submitted ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3 py-8">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <h2 className="text-xl font-semibold">Your email client should have opened</h2>
              <p className="text-muted-foreground max-w-md">
                If it didn&apos;t, copy the text below and send it to{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{requestEmail}</code>
              </p>
              <pre className="text-xs bg-muted p-4 rounded-md max-w-md text-left whitespace-pre-wrap break-words">
{`${mailtoSubject}

${mailtoBody}`}
              </pre>
              <Button variant="outline" onClick={copyToClipboard}>
                Copy to clipboard
              </Button>
              <p className="text-xs text-muted-foreground pt-4">
                We don&apos;t store your submission on a server — the form just opens your email
                client with a pre-filled message. See our{" "}
                <a href={route.privacy()} className="underline hover:text-foreground">privacy policy</a>.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tell us what you need</CardTitle>
            <CardDescription>The more specific you are about inputs, formula and expected output, the faster we can build it.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Calculator name *</Label>
                <Input
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Wind chill calculator"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Suggested category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">— Pick a category —</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">What should it compute? *</Label>
                <Textarea
                  id="description"
                  required
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={`Describe the calculation:
- What inputs does the user provide?
- What output do they expect?
- What formula or method should be used?
- Are there edge cases or limitations to flag?`}
                />
                <p className="text-xs text-muted-foreground">
                  Mentioning a verifiable source (textbook, official standard, peer-reviewed paper) speeds up review.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Your email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com — only if you want a reply"
                />
                <p className="text-xs text-muted-foreground">
                  Optional. We&apos;ll only use it to reply about your request. Never sold or shared.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button type="submit" className="gap-1.5">
                  <Mail className="h-4 w-4" />
                  Open in email client
                </Button>
                <Button type="button" variant="outline" onClick={copyToClipboard}>
                  Copy text instead
                </Button>
              </div>

              <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5 inline mr-1" />
                <strong>How this works:</strong> Clicking submit opens your email client with a
                pre-filled message to <code className="bg-background px-1 rounded">{requestEmail}</code>.
                We don&apos;t run a backend that stores form submissions — your data never touches
                our server. If your email client doesn&apos;t open, use the &quot;Copy text instead&quot;
                button and send it manually.
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Before you request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Try searching first — many calculators have multiple names (e.g. &quot;mean&quot; vs &quot;average&quot;).</p>
          <p>• Check the &quot;On the roadmap&quot; section of relevant category pages — your request may already be queued.</p>
          <p>• We don&apos;t publish calculators whose formulas we can&apos;t verify. Tools needing live data
            (current exchange rates, real-time stock prices) are out of scope unless we can integrate a reliable free source.</p>
          <p>• Requests typically take 1-4 weeks to ship, depending on complexity and review.</p>
        </CardContent>
      </Card>
    </div>
  );
}
