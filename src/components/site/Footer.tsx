"use client";

import { Calculator, Github, Heart, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/lib/calculators/categories";
import { route } from "@/lib/router";
import { getLiveCalculators } from "@/lib/calculators/registry";

export function Footer() {
  const liveCount = getLiveCalculators().length;
  const popularCategories = CATEGORIES.slice(0, 8);

  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-hero-gradient shadow-glow">
                <Calculator className="h-4 w-4 text-white" />
              </span>
              <span className="font-bold text-lg" style={{ fontFamily: "var(--font-display), serif" }}>EveryCalc</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              A free, open calculator platform. {liveCount} calculators live today,
              with more added every build.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Client-side</span>
              <span className="inline-flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-primary" /> Instant</span>
              <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-primary" /> Verified</span>
            </div>
          </div>

          {/* Top categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Top categories</h3>
            <ul className="space-y-2.5 text-sm">
              {popularCategories.map((c) => (
                <li key={c.id}>
                  <a href={route.category(c.id)} className="text-muted-foreground hover:text-primary transition-colors">{c.name}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Browse */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Browse</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href={route.home()} className="text-muted-foreground hover:text-primary transition-colors">Home</a></li>
              <li><a href={route.directory()} className="text-muted-foreground hover:text-primary transition-colors">All calculators</a></li>
              <li><a href={route.category("finance")} className="text-muted-foreground hover:text-primary transition-colors">Finance</a></li>
              <li><a href={route.category("health")} className="text-muted-foreground hover:text-primary transition-colors">Health</a></li>
              <li><a href={route.category("conversions")} className="text-muted-foreground hover:text-primary transition-colors">Conversions</a></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">About</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href={route.request()} className="text-muted-foreground hover:text-primary transition-colors">Request a calculator</a></li>
              <li><a href={route.privacy()} className="text-muted-foreground hover:text-primary transition-colors">Privacy policy</a></li>
              <li className="text-muted-foreground">100% client-side math</li>
              <li className="text-muted-foreground">No tracking, no ads</li>
              <li className="text-muted-foreground">Works offline</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} EveryCalc. All calculations run locally in your browser.</span>
          <span className="flex items-center gap-2">
            <Github className="h-3.5 w-3.5" />
            <span>Open architecture</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
