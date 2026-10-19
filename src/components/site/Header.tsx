"use client";

import { useState, useMemo, useRef, useSyncExternalStore } from "react";
import { Search, Calculator, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { searchCalculators } from "@/lib/calculators/search";
import { route, useRouter } from "@/lib/router";
import { getCategory } from "@/lib/calculators/categories";
import { getLiveCalculators } from "@/lib/calculators/registry";

const emptyStore = {
  subscribe(cb: () => void) { cb(); return () => {}; },
  getSnapshot: () => true,
  getServerSnapshot: () => false,
};

export function Header() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptyStore.subscribe, emptyStore.getSnapshot, emptyStore.getServerSnapshot);
  const inputRef = useRef<HTMLInputElement>(null);
  const liveCount = getLiveCalculators().length;

  const results = useMemo(() => (q.trim() ? searchCalculators(q, 8) : []), [q]);

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (q.trim()) {
      router.navigate(route.search(q.trim()));
      setOpen(false); setMobileOpen(false);
      inputRef.current?.blur();
    }
  }

  function pickCalculator(slug: string) {
    router.navigate(route.calculator(slug));
    setQ(""); setOpen(false); setMobileOpen(false);
  }

  function onSearchChange(v: string) { setQ(v); setOpen(true); }
  function onNavigate(to: string) { router.navigate(to); setOpen(false); setMobileOpen(false); }

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-6">
        {/* Logo */}
        <button type="button" onClick={() => onNavigate(route.home())} className="flex items-center gap-2.5 shrink-0 focus-ring rounded-lg" aria-label="EveryCalc home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-hero-gradient shadow-glow">
            <Calculator className="h-5 w-5 text-white" />
          </span>
          <span className="hidden font-bold text-lg tracking-tight sm:inline" style={{ fontFamily: "var(--font-display), serif" }}>
            EveryCalc
          </span>
        </button>

        {/* Desktop search */}
        <form onSubmit={submitSearch} className="relative hidden flex-1 max-w-xl md:block" role="search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder={`Search ${liveCount}+ calculators — finance, math, health…`}
              className="pl-10 pr-3 h-10 rounded-xl bg-muted/50 border-border/50 focus-visible:bg-card transition-colors"
              aria-label="Search calculators"
            />
          </div>
          {open && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-border/60 bg-popover shadow-premium-lg overflow-hidden z-50">
              <ul className="max-h-96 overflow-y-auto">
                {results.map((r) => {
                  const cat = getCategory(r.calculator.category);
                  return (
                    <li key={r.calculator.slug}>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pickCalculator(r.calculator.slug)} className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left hover:bg-accent transition-colors">
                        <span className="text-sm font-medium">{r.calculator.name}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{r.calculator.description}</span>
                        {cat && <Badge variant="outline" className="text-[10px] py-0 h-4 mt-0.5">{cat.name}</Badge>}
                      </button>
                    </li>
                  );
                })}
                <li>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => submitSearch()} className="w-full px-4 py-2.5 text-left text-xs text-muted-foreground hover:bg-accent border-t border-border/50 transition-colors">
                    See all results for &quot;{q}&quot; →
                  </button>
                </li>
              </ul>
            </div>
          )}
        </form>

        {/* Desktop nav */}
        <nav className="ml-auto hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onNavigate(route.home())} className="focus-ring">Home</Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate(route.directory())} className="focus-ring">Directory</Button>
          {mounted && (
            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="focus-ring rounded-lg">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}
        </nav>

        <Button variant="ghost" size="icon" className="ml-auto md:hidden focus-ring rounded-lg" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile search + nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/60 glass px-4 py-4 space-y-3">
          <form onSubmit={submitSearch} className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" value={q} onChange={(e) => onSearchChange(e.target.value)} onFocus={() => setOpen(true)} placeholder="Search calculators…" className="pl-10 h-10 rounded-xl bg-muted/50" aria-label="Search calculators" />
            {open && results.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-border/60 bg-popover shadow-premium-lg overflow-hidden z-50">
                {results.slice(0, 6).map((r) => (
                  <button key={r.calculator.slug} type="button" onClick={() => pickCalculator(r.calculator.slug)} className="block w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors">
                    {r.calculator.name}
                  </button>
                ))}
              </div>
            )}
          </form>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1 focus-ring" onClick={() => onNavigate(route.home())}>Home</Button>
            <Button variant="ghost" size="sm" className="flex-1 focus-ring" onClick={() => onNavigate(route.directory())}>Directory</Button>
            {mounted && (
              <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="focus-ring rounded-lg">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
