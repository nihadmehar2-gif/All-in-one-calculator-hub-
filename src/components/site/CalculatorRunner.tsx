"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Sparkles, CheckCircle2, Copy, Check } from "lucide-react";
import { FieldRenderer } from "./FieldRenderer";
import { ResultRow } from "@/components/ui/result-row";
import { ResultChart } from "@/components/ui/result-chart";
import type { CalculatorDefinition, CalculatorResult } from "@/lib/calculators/types";

interface Props { calculator: CalculatorDefinition; }

function buildDefaults(calc: CalculatorDefinition): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of calc.inputs) {
    out[f.name] = f.default ?? (f.type === "checkbox" ? false : f.type === "select" ? f.options?.[0]?.value : "");
  }
  return out;
}

type Computed = | { ok: true; value: CalculatorResult } | { ok: false; error: string };

export function CalculatorRunner({ calculator }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>(() => buildDefaults(calculator));
  const [copied, setCopied] = useState(false);

  const computed: Computed = useMemo(() => {
    try { return { ok: true, value: calculator.calculate(values) }; }
    catch (e) { return { ok: false, error: (e as Error).message }; }
  }, [calculator, values]);

  function reset() { setValues(buildDefaults(calculator)); }
  function setField(name: string, v: unknown) { setValues((prev) => ({ ...prev, [name]: v })); }

  function copyResults() {
    if (!computed.ok) return;
    const lines: string[] = [];
    computed.value.rows.forEach((r) => lines.push(`${r.label}: ${r.value}`));
    computed.value.sections?.forEach((s) => {
      if (s.title) lines.push(`\n${s.title}`);
      s.rows.forEach((r) => lines.push(`  ${r.label}: ${r.value}`));
    });
    navigator.clipboard?.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ═══ Input panel ═══ */}
      <Card className="rounded-2xl border-border/60 shadow-premium">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Inputs</CardTitle>
              <CardDescription className="text-xs">Results update live as you type.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={reset} className="h-8 gap-1.5 text-xs focus-ring rounded-lg">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {calculator.inputs.map((f) => (
            <FieldRenderer key={f.name} field={f} value={values[f.name]} onChange={(v) => setField(f.name, v)} />
          ))}
        </CardContent>
      </Card>

      {/* ═══ Results panel ═══ */}
      <Card className="rounded-2xl border-border/60 shadow-premium bg-gradient-to-br from-card to-muted/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Results</CardTitle>
            </div>
            {computed.ok && computed.value?.rows?.length > 0 && (
              <Button variant="ghost" size="sm" onClick={copyResults} className="h-8 gap-1.5 text-xs focus-ring rounded-lg">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!computed.ok ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              <p className="font-medium mb-1">Couldn&apos;t compute</p>
              <p className="text-xs">{computed.error}</p>
            </div>
          ) : computed.value ? (
            <div className="space-y-5">
              {computed.value.rows.length > 0 && (
                <div className="space-y-2.5">
                  {computed.value.rows.map((r) => (
                    <ResultRow key={r.key} row={r} />
                  ))}
                </div>
              )}
              {computed.value.sections?.map((s, i) => (
                <div key={i} className="space-y-2">
                  {s.title && <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.title}</h4>}
                  {s.rows.map((r) => (
                    <ResultRow key={r.key} row={r} compact />
                  ))}
                </div>
              ))}
              {computed.value.chart && <ResultChart chart={computed.value.chart} />}
              {computed.value.summary && (
                <div className="flex gap-2 rounded-xl border border-border/60 bg-muted/40 p-3.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{computed.value.summary}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Enter values to see results.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
