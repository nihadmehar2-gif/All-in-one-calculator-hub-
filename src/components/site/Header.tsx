"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useSyncExternalStore } from "react";
import { Search, Calculator, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { searchCalculators } from "@/lib/calculators/search";
import { route, useRouter } from "@/lib/router";
import { getCategory } from "@/lib/calculators/categories";

// useSyncExternalStore-safe empty store to track client mount.
const emptyStore = {
  subscribe(cb: () => void) {
    cb();
    return () => {};
  },
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

  const results = useMemo(() => (q.trim() ? searchCalculators(q, 8) : []), [q]);

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (q.trim()) {
      router.navigate(route.search(q.trim()));
      setOpen(false);
      setMobileOpen(false);
      inputRef.current?.blur();
    }
  }

  function pickCalculator(slug: string) {
    router.navigate(route.calculator(slug));
    setQ("");
    setOpen(false);
    setMobileOpen(false);
  }

  function onSearchChange(v: string) {
    setQ(v);
    setOpen(true);
  }

  // Close mobile nav when navigating
  function onNavigate(to: string) {
    router.navigate(to);
    setOpen(false);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-6">
        <button
          type="button"
          onClick={() => onNavigate(route.home())}
          className="flex items-center gap-2 shrink-0"
          aria-label="EveryCalc home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Calculator className="h-5 w-5" />
          </span>
          <span className="hidden font-semibold text-base tracking-tight sm:inline">
            EveryCalc
          </span>
        </button>

        {/* Desktop search */}
        <form
          onSubmit={submitSearch}
          className="relative hidden flex-1 max-w-xl md:block"
          role="search"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Search 15+ calculators — finance, math, health…"
              className="pl-9 pr-3"
              aria-label="Search calculators"
            />
          </div>
          {open && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-md border bg-popover shadow-md overflow-hidden z-50">
              <ul className="max-h-96 overflow-y-auto">
                {results.map((r) => {
                  const cat = getCategory(r.calculator.category);
                  return (
                    <li key={r.calculator.slug}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickCalculator(r.calculator.slug)}
                        className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-accent"
                      >
                        <span className="text-sm font-medium">{r.calculator.name}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {r.calculator.description}
                        </span>
                        {cat && <Badge variant="outline" className="text-[10px] py-0 h-4 mt-0.5">{cat.name}</Badge>}
                      </button>
                    </li>
                  );
                })}
                <li>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => submitSearch()}
                    className="w-full px-3 py-2 text-left text-xs text-muted-foreground hover:bg-accent border-t"
                  >
                    See all results for &quot;{q}&quot; →
                  </button>
                </li>
              </ul>
            </div>
          )}
        </form>

        <nav className="ml-auto hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onNavigate(route.home())}>
            Home
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate(route.directory())}>
            Directory
          </Button>
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile search + nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-3 space-y-3">
          <form onSubmit={submitSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={q}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setOpen(true)}
              placeholder="Search calculators…"
              className="pl-9"
              aria-label="Search calculators"
            />
            {open && results.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 rounded-md border bg-popover shadow-md overflow-hidden z-50">
                {results.slice(0, 6).map((r) => (
                  <button
                    key={r.calculator.slug}
                    type="button"
                    onClick={() => pickCalculator(r.calculator.slug)}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    {r.calculator.name}
                  </button>
                ))}
              </div>
            )}
          </form>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => onNavigate(route.home())}>
              Home
            </Button>
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => onNavigate(route.directory())}>
              Directory
            </Button>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
