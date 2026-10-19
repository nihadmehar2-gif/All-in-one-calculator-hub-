"use client";

import { Calculator, Github, Heart } from "lucide-react";
import { CATEGORIES } from "@/lib/calculators/categories";
import { route } from "@/lib/router";
import { getLiveCalculators } from "@/lib/calculators/registry";

export function Footer() {
  const liveCount = getLiveCalculators().length;
  const popularCategories = CATEGORIES.slice(0, 8);

  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Calculator className="h-4 w-4" />
              </span>
              <span className="font-semibold">EveryCalc</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A free, open calculator platform. {liveCount} calculators live today,
              with more added every build.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Top categories
            </h3>
            <ul className="space-y-2 text-sm">
              {popularCategories.map((c) => (
                <li key={c.id}>
                  <a
                    href={route.category(c.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Browse
            </h3>
            <ul className="space-y-2 text-sm">
              <li><a href={route.home()} className="text-muted-foreground hover:text-foreground">Home</a></li>
              <li><a href={route.directory()} className="text-muted-foreground hover:text-foreground">All calculators</a></li>
              <li><a href={route.category("finance")} className="text-muted-foreground hover:text-foreground">Finance</a></li>
              <li><a href={route.category("health")} className="text-muted-foreground hover:text-foreground">Health</a></li>
              <li><a href={route.category("conversions")} className="text-muted-foreground hover:text-foreground">Conversions</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              About
            </h3>
            <ul className="space-y-2 text-sm">
              <li><a href={route.request()} className="text-muted-foreground hover:text-foreground">Request a calculator</a></li>
              <li><a href={route.privacy()} className="text-muted-foreground hover:text-foreground">Privacy policy</a></li>
              <li className="text-muted-foreground">100% client-side math</li>
              <li className="text-muted-foreground">No tracking, no ads</li>
              <li className="text-muted-foreground">Works offline</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} EveryCalc. All calculations run locally in your browser.</span>
          <span className="flex items-center gap-3">
            <Github className="h-3.5 w-3.5" />
            <span>Open architecture</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
