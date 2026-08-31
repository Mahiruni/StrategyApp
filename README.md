# Meridian — Trading Plan & Journal

Meridian is a high-signal trading workspace for turning a strategy into a repeatable process. It combines a structured plan builder, fast trade logging, detailed review, behavioral analytics, and a rules vault in one responsive interface.

The frontend is intentionally dark-first, restrained, and data-dense. Mint represents positive execution, coral represents risk, and gold is reserved for deliberate actions and attention.

## Core views

- **Dashboard:** equity and drawdown, risk envelope, performance metrics, daily checklist, outcome distribution, and recent trades.
- **Plan builder:** seven-step plan workflow with live Fibonacci levels, XAUUSD position sizing, and a 3.83R outcome visualizer.
- **Trade journal:** search, multi-filtering, sortable columns, CSV export, local entries, screenshot attachment, and an accessible trade-review drawer.
- **Analytics:** cumulative R, setup attribution, time-of-day heatmap, market contribution, and behavior-based insights.
- **Rules vault:** personal rulebook, pre-commit checklist, psychology protocols, version history, theme, motion, and sound preferences.

## Tech stack

- Next.js 15 App Router
- React 19 + TypeScript
- Tailwind CSS with CSS-variable theming
- Framer Motion
- Recharts
- Radix Dialog primitives and shadcn-style UI architecture
- Phosphor Icons
- Fontsource variable Inter and JetBrains Mono fonts

## Local setup

Requirements: Node.js 20.10 or newer and npm 10 or newer.

```bash
git clone https://github.com/Mahiruni/StrategyApp.git
cd StrategyApp
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
```

## Deploy to Vercel

1. Import the GitHub repository into Vercel.
2. Keep the detected framework preset as **Next.js**.
3. Set `NEXT_PUBLIC_APP_URL` to the production URL.
4. Deploy. No additional build configuration is required.

The default build command is `next build`, and Vercel serves the App Router output automatically.

## Environment variables

| Variable              | Required    | Purpose                                                         |
| --------------------- | ----------- | --------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | Recommended | Canonical URL used by metadata, robots, and sitemap generation. |

## Local data behavior

This deliverable is a production-grade frontend and does not require a backend. New trade entries, plan edits, custom rules, and preferences persist in `localStorage`. The storage boundary is isolated in the client components so it can later be replaced by Supabase, Postgres, or another API without redesigning the UI.

## Folder structure

```text
app/
  analytics/        Analytics route
  journal/          Journal route
  plan/             Plan builder route
  vault/            Rules and settings route
  layout.tsx        Metadata, providers, and application shell
components/
  analytics/        Analytics visuals and insight cards
  dashboard/        Dashboard metrics and charts
  journal/          Journal table and review drawer
  plan/             Multi-step plan builder and calculators
  vault/            Rules, protocols, and preferences
  ui/               Reusable shadcn-style primitives
lib/
  data.ts           Deterministic realistic demo dataset
  types.ts          Shared domain types
  utils.ts          Formatting and class utilities
public/             Static visual assets
```

## Accessibility and performance

- Keyboard command menu with `Cmd/Ctrl + K`; press `N` to open a new trade.
- Visible focus states, semantic dialogs, tables, tabs, labels, and live toast announcements.
- WCAG-aware contrast in dark and light modes.
- Reduced-motion support through both system settings and workspace preferences.
- Locally bundled variable fonts, route-level metadata, zero external image requests, and package import optimization.

## Strategy defaults

The included demonstration plan follows the current Meridian structure-shift playbook: H4/H1 context, M15 execution, Fibonacci entry at `0.71`, stop at `0.95`, TP1 at `0.00`, and TP2 at `-0.21` for an approximate `3.83R` final target.
