"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import type { Icon } from "@phosphor-icons/react";
import {
  BookOpenText,
  CaretRight,
  ChartLineUp,
  ChartPieSlice,
  CheckCircle,
  ClipboardText,
  Command,
  MagnifyingGlass,
  Moon,
  Plus,
  ShieldCheck,
  SquaresFour,
  Sun,
  X,
} from "@phosphor-icons/react";

import { useApp } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: Icon;
  description: string;
};

const navigation: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    short: "Home",
    icon: SquaresFour,
    description: "Performance and daily risk",
  },
  {
    href: "/plan",
    label: "Plan builder",
    short: "Plan",
    icon: ClipboardText,
    description: "Rules and position sizing",
  },
  {
    href: "/journal",
    label: "Trade journal",
    short: "Journal",
    icon: BookOpenText,
    description: "Review execution quality",
  },
  {
    href: "/analytics",
    label: "Analytics",
    short: "Insights",
    icon: ChartPieSlice,
    description: "Patterns and performance",
  },
  {
    href: "/vault",
    label: "Rules vault",
    short: "Rules",
    icon: ShieldCheck,
    description: "Protocols and settings",
  },
];

const pageCopy: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Dashboard",
    subtitle: "Monday, 31 August 2026 · London session",
  },
  "/plan": {
    title: "Trading plan",
    subtitle: "Structure-shift 3.83R · version 4",
  },
  "/journal": {
    title: "Trade journal",
    subtitle: "48 reviewed trades · July–August 2026",
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Evidence over intuition · all strategies",
  },
  "/vault": {
    title: "Rules vault",
    subtitle: "6 active rules · last reviewed 28 August",
  },
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, openNewTrade } = useApp();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const page = pageCopy[pathname] ?? pageCopy["/"];

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((current) => !current);
      }
      if (
        event.key.toLowerCase() === "n" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        const element = document.activeElement?.tagName;
        if (
          element !== "INPUT" &&
          element !== "TEXTAREA" &&
          element !== "SELECT"
        )
          openNewTrade();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openNewTrade]);

  const filtered = useMemo(
    () =>
      navigation.filter((item) =>
        `${item.label} ${item.description}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );

  const go = (href: string) => {
    router.push(href);
    setPaletteOpen(false);
    setQuery("");
  };

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[120] -translate-y-20 rounded-lg bg-gold px-3 py-2 text-xs font-medium text-[#1b1505] focus:translate-y-0"
      >
        Skip to content
      </a>

      <aside className="glass fixed inset-y-0 left-0 z-40 hidden w-[228px] flex-col border-y-0 border-l-0 lg:flex">
        <Link
          href="/"
          className="flex h-16 items-center gap-3 border-b border-line px-5"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-mint text-[#06140f] shadow-[0_8px_24px_rgba(var(--mint-rgb),.18)]">
            <ChartLineUp size={17} weight="bold" />
          </span>
          <span>
            <span className="block text-[13.5px] font-[580] tracking-[-0.02em] text-ink">
              Meridian
            </span>
            <span className="block text-[9.5px] tracking-[0.07em] text-faint">
              TRADING OS
            </span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="flex-1 space-y-1 p-3">
          <p className="eyebrow px-3 pb-2 pt-3">Workspace</p>
          {navigation.map((item) => {
            const active = pathname === item.href;
            const NavIcon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-[11px] border px-3 py-2.5 text-[12.5px] transition-all duration-200",
                  active
                    ? "border-line bg-raised text-ink shadow-[inset_0_1px_0_rgba(255,255,255,.025)]"
                    : "hover:bg-raised/70 border-transparent text-muted hover:text-ink",
                )}
              >
                <NavIcon
                  size={17}
                  weight={active ? "fill" : "regular"}
                  className={
                    active ? "text-mint" : "text-faint group-hover:text-muted"
                  }
                />
                <span className="flex-1">{item.label}</span>
                {active ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-line p-3">
          <div className="rounded-xl border border-line bg-raised px-3.5 py-3.5">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Daily risk</span>
              <span className="number text-[10px] text-gold">1 / 3R</span>
            </div>
            <div className="bg-sunken mt-3 h-1 overflow-hidden rounded-full">
              <div className="h-full w-1/3 rounded-full bg-gold" />
            </div>
            <p className="mt-2.5 text-[10.5px] leading-relaxed text-faint">
              Two risk units available before lockout.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
            <span className="bg-overlay flex h-8 w-8 items-center justify-center rounded-full border border-line text-[11px] font-medium text-ink">
              MA
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] text-ink">
                Mahir Aman
              </span>
              <span className="block truncate text-[10px] text-faint">
                Process account
              </span>
            </span>
            <CheckCircle size={15} weight="fill" className="text-mint" />
          </div>
        </div>
      </aside>

      <div className="lg:pl-[228px]">
        <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-x-0 border-t-0 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              aria-label="Meridian dashboard"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-mint text-[#06140f] lg:hidden"
            >
              <ChartLineUp size={17} weight="bold" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-[580] tracking-[-0.02em] text-ink">
                {page.title}
              </h1>
              <p className="number truncate text-[10.5px] text-faint">
                {page.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaletteOpen(true)}
              className="bg-sunken hidden h-9 min-w-48 items-center gap-2 rounded-[10px] border border-line px-3 text-left text-[11.5px] text-faint transition-colors hover:border-[var(--line-strong)] hover:text-muted sm:flex"
            >
              <MagnifyingGlass size={14} />
              <span className="flex-1">Search workspace</span>
              <kbd className="number rounded border border-line bg-raised px-1.5 py-0.5 text-[9.5px]">
                ⌘K
              </kbd>
            </button>
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto max-w-[1440px] px-4 pb-32 pt-5 sm:px-6 sm:pt-6 lg:pb-10"
        >
          {children}
        </main>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="glass safe-bottom fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-x-0 border-b-0 lg:hidden"
      >
        {navigation.map((item) => {
          const active = pathname === item.href;
          const NavIcon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-[58px] flex-col items-center justify-center gap-1 text-[9.5px] transition-colors",
                active ? "text-mint" : "text-faint",
              )}
            >
              {active ? (
                <span className="absolute top-0 h-px w-7 bg-mint shadow-[0_0_12px_var(--mint)]" />
              ) : null}
              <NavIcon size={18} weight={active ? "fill" : "regular"} />
              <span>{item.short}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={openNewTrade}
        className="fixed bottom-[84px] right-4 z-50 flex h-12 items-center gap-2 rounded-full bg-gold px-5 text-[12.5px] font-semibold text-[#1b1505] shadow-[0_12px_36px_rgba(var(--gold-rgb),.26),0_3px_12px_rgba(0,0,0,.35)] transition-transform duration-200 hover:scale-[1.025] active:scale-[.97] lg:bottom-6 lg:right-6"
      >
        <Plus size={16} weight="bold" />
        <span>New trade</span>
        <kbd className="number ml-1 hidden rounded bg-black/10 px-1.5 py-0.5 text-[9px] sm:inline">
          N
        </kbd>
      </button>

      <Dialog.Root open={paletteOpen} onOpenChange={setPaletteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-[#030407]/65 backdrop-blur-sm" />
          <Dialog.Content
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              searchRef.current?.focus();
            }}
            className="glass fixed left-1/2 top-[14vh] z-[80] w-[calc(100%-1.5rem)] max-w-[560px] -translate-x-1/2 overflow-hidden rounded-2xl shadow-float focus:outline-none"
          >
            <Dialog.Title className="sr-only">Command menu</Dialog.Title>
            <Dialog.Description className="sr-only">
              Search and navigate the Meridian workspace.
            </Dialog.Description>
            <div className="flex h-14 items-center gap-3 border-b border-line px-4">
              <Command size={16} className="text-faint" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-full flex-1 bg-transparent text-[13.5px] text-ink outline-none"
                placeholder="Jump to a screen or action"
                aria-label="Search workspace"
              />
              <Dialog.Close asChild>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-faint hover:bg-raised hover:text-muted"
                  aria-label="Close command menu"
                >
                  <X size={15} />
                </button>
              </Dialog.Close>
            </div>
            <div className="max-h-[360px] overflow-y-auto p-2">
              <p className="eyebrow px-3 pb-2 pt-2">Navigate</p>
              {filtered.length ? (
                filtered.map((item) => {
                  const NavIcon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => go(item.href)}
                      className="group flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left hover:bg-raised"
                    >
                      <span className="bg-sunken flex h-8 w-8 items-center justify-center rounded-lg border border-line text-faint group-hover:text-mint">
                        <NavIcon size={15} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[12.5px] text-ink">
                          {item.label}
                        </span>
                        <span className="block text-[10.5px] text-faint">
                          {item.description}
                        </span>
                      </span>
                      <CaretRight size={13} className="text-faint" />
                    </button>
                  );
                })
              ) : (
                <p className="px-4 py-8 text-center text-[12px] text-faint">
                  No workspace result matches “{query}”.
                </p>
              )}
              <div className="my-2 h-px bg-line" />
              <button
                onClick={() => {
                  setPaletteOpen(false);
                  openNewTrade();
                }}
                className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left hover:bg-raised"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-[#1b1505]">
                  <Plus size={15} weight="bold" />
                </span>
                <span className="flex-1 text-[12.5px] text-ink">
                  Log a new trade
                </span>
                <Badge tone="gold">N</Badge>
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
