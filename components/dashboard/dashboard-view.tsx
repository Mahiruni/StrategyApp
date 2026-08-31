"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ShieldCheck,
  TrendUp,
} from "@phosphor-icons/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useApp } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  Badge,
  Panel,
  PanelHeader,
  Skeleton,
} from "@/components/ui/primitives";
import { PageFrame } from "@/components/ui/page-frame";
import { equityData, getStats, trades } from "@/lib/data";
import { cn, formatR, formatPercent } from "@/lib/utils";

const stats = getStats();
const ranges = ["7D", "30D", "90D", "All"] as const;
type Range = (typeof ranges)[number];

const checklistSeed = [
  { id: 1, label: "Read the belief set aloud", done: true },
  { id: 2, label: "Mark the H1 direction and M15 shift", done: true },
  { id: 3, label: "Set the 0.71 entry and 0.95 stop", done: false },
  { id: 4, label: "Review yesterday's rule breaks", done: false },
];

function Delta({ value, suffix = "" }: { value: number; suffix?: string }) {
  const positive = value >= 0;
  const DeltaIcon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "number inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px]",
        positive
          ? "border-[rgba(var(--mint-rgb),.18)] bg-[var(--mint-soft)] text-mint"
          : "border-[rgba(var(--coral-rgb),.18)] bg-[var(--coral-soft)] text-coral",
      )}
    >
      <DeltaIcon size={10} weight="bold" />
      {Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  );
}

function EquityPanel({ loading }: { loading: boolean }) {
  const [range, setRange] = useState<Range>("All");
  const data = useMemo(() => {
    const count = { "7D": 8, "30D": 19, "90D": 34, All: equityData.length }[
      range
    ];
    return equityData.slice(-count);
  }, [range]);
  const current = data.at(-1)?.equity ?? 0;
  const starting = data[0]?.equity ?? 0;
  const trough = Math.min(...data.map((item) => item.drawdown));

  return (
    <Panel className="min-h-[356px] p-5 sm:p-6 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">Equity curve</div>
          {loading ? (
            <Skeleton className="h-10 w-44" />
          ) : (
            <div className="flex items-end gap-3">
              <span className="number text-[34px] font-medium leading-none tracking-[-0.06em] sm:text-[39px]">
                {formatR(current, 1)}
              </span>
              <Delta value={current - starting} suffix="R" />
            </div>
          )}
          <p className="number mt-2.5 text-[10.5px] text-faint">
            {data.length} trades · trough {formatR(trough, 1)}
          </p>
        </div>

        <div
          className="bg-sunken inline-flex rounded-[9px] border border-line p-0.5"
          role="tablist"
          aria-label="Equity range"
        >
          {ranges.map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={range === item}
              onClick={() => setRange(item)}
              className={cn(
                "number rounded-[7px] px-2.5 py-1.5 text-[10px] transition-all",
                range === item
                  ? "bg-raised text-ink shadow-sm"
                  : "text-faint hover:text-muted",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 h-[205px]">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 4, bottom: 0, left: 4 }}
            >
              <defs>
                <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--mint)"
                    stopOpacity={0.25}
                  />
                  <stop offset="100%" stopColor="var(--mint)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="drawdownFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--coral)" stopOpacity={0} />
                  <stop
                    offset="100%"
                    stopColor="var(--coral)"
                    stopOpacity={0.18}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--line)"
                strokeDasharray="3 5"
              />
              <XAxis dataKey="label" hide />
              <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
              <ReferenceLine
                y={0}
                stroke="var(--line-strong)"
                strokeDasharray="3 4"
              />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="var(--coral)"
                strokeOpacity={0.45}
                strokeWidth={1}
                fill="url(#drawdownFill)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="var(--mint)"
                strokeWidth={2}
                fill="url(#equityFill)"
                activeDot={{
                  r: 4,
                  fill: "var(--mint)",
                  stroke: "var(--canvas)",
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
              />
              <Tooltip
                cursor={{ stroke: "var(--line-strong)" }}
                contentStyle={{
                  background: "var(--raised)",
                  border: "1px solid var(--line-strong)",
                  borderRadius: 10,
                  color: "var(--text)",
                  fontFamily: "JetBrains Mono Variable",
                  fontSize: 10,
                  boxShadow: "0 12px 30px rgba(0,0,0,.3)",
                }}
                formatter={(value, name) => [
                  formatR(Number(value)),
                  name === "equity" ? "Cumulative" : "Drawdown",
                ]}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="mt-3 flex items-center gap-5 border-t border-line pt-3 text-[10.5px] text-faint">
        <span className="inline-flex items-center gap-2">
          <i className="h-0.5 w-3.5 rounded bg-mint" /> Cumulative R
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="h-0.5 w-3.5 rounded bg-coral" /> Drawdown
        </span>
      </div>
    </Panel>
  );
}

function RiskEnvelope({ loading }: { loading: boolean }) {
  const dailyUsed = 1;
  const circumference = 2 * Math.PI * 53;
  const progress = (dailyUsed / 3) * circumference * 0.75;

  return (
    <Panel className="min-h-[356px] p-5 sm:p-6">
      <PanelHeader
        title="Risk envelope"
        meta="Resets at New York close"
        action={<Badge tone="gold">Today</Badge>}
      />
      {loading ? (
        <div className="mt-6 space-y-5">
          <Skeleton className="mx-auto h-32 w-32 rounded-full" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
      ) : (
        <>
          <div className="relative mx-auto mt-4 h-[132px] w-[132px]">
            <svg
              viewBox="0 0 120 120"
              className="h-full w-full -rotate-[225deg]"
              role="img"
              aria-label="One of three daily risk units used"
            >
              <circle
                cx="60"
                cy="60"
                r="53"
                fill="none"
                stroke="var(--line)"
                strokeWidth="8"
                strokeDasharray={`${circumference * 0.75} ${circumference}`}
                strokeLinecap="round"
              />
              <circle
                cx="60"
                cy="60"
                r="53"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="8"
                strokeDasharray={`${progress} ${circumference}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="number text-[25px] font-medium">1 / 3</span>
              <span className="mt-1 text-[9.5px] text-faint">units used</span>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            <RiskMeter
              label="Drawdown headroom"
              value={Math.abs(stats.maxDrawdown)}
              max={12}
              display={`${formatR(stats.maxDrawdown, 1)} / −12R`}
              tone="coral"
            />
            <RiskMeter
              label="Rule adherence"
              value={stats.adherence * 100}
              max={100}
              display={formatPercent(stats.adherence)}
              tone="mint"
            />
          </div>
          <div className="mt-5 flex gap-2.5 rounded-xl border border-[rgba(var(--gold-rgb),.18)] bg-[var(--gold-soft)] px-3.5 py-3">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-gold" />
            <p className="text-[11.5px] leading-relaxed text-muted">
              Two units remain. The daily lockout is armed.
            </p>
          </div>
        </>
      )}
    </Panel>
  );
}

function RiskMeter({
  label,
  value,
  max,
  display,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  display: string;
  tone: "mint" | "coral";
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[11.5px] text-muted">{label}</span>
        <span className="number text-[10px] text-faint">{display}</span>
      </div>
      <div className="bg-sunken h-1.5 overflow-hidden rounded-full">
        <div
          className={
            tone === "mint"
              ? "h-full rounded-full bg-mint"
              : "h-full rounded-full bg-coral"
          }
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );
}

const metrics = [
  {
    label: "Win rate",
    value: formatPercent(stats.winRate),
    delta: 2.4,
    note: "target ≥ 30%",
  },
  {
    label: "Average R",
    value: formatR(stats.averageR),
    delta: 0.3,
    note: "per trade",
  },
  {
    label: "Profit factor",
    value: stats.profitFactor.toFixed(2),
    delta: 0.18,
    note: "gross / loss",
  },
  {
    label: "Max drawdown",
    value: formatR(stats.maxDrawdown, 1),
    delta: -1.2,
    note: "peak to trough",
  },
  {
    label: "Expectancy",
    value: formatR(stats.expectancy),
    delta: 0.3,
    note: "per attempt",
  },
];

function MetricStrip({ loading }: { loading: boolean }) {
  return (
    <section className="surface relative z-[1] grid overflow-hidden sm:grid-cols-3 lg:col-span-3 lg:grid-cols-5">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={cn(
            "interactive-surface px-5 py-4",
            index > 0 && "border-t border-line sm:border-l sm:border-t-0",
            index === 3 && "sm:border-l-0 lg:border-l",
          )}
        >
          <p className="text-[10.5px] text-faint">{metric.label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-6 w-20" />
          ) : (
            <>
              <p className="number mt-2 text-[21px] font-medium leading-none tracking-[-0.04em]">
                {metric.value}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <Delta value={metric.delta} />
                <span className="text-[9.5px] text-faint">{metric.note}</span>
              </div>
            </>
          )}
        </div>
      ))}
    </section>
  );
}

function Distribution({ loading }: { loading: boolean }) {
  const buckets = [
    {
      name: "−1R",
      value: trades.filter((trade) => trade.result === -1).length,
      color: "var(--coral)",
    },
    {
      name: "0–1R",
      value: trades.filter((trade) => trade.result > -1 && trade.result <= 1)
        .length,
      color: "var(--coral)",
    },
    {
      name: "1–2R",
      value: trades.filter((trade) => trade.result > 1 && trade.result <= 2)
        .length,
      color: "var(--mint)",
    },
    {
      name: "2–3R",
      value: trades.filter((trade) => trade.result > 2 && trade.result <= 3)
        .length,
      color: "var(--mint)",
    },
    {
      name: "3R+",
      value: trades.filter((trade) => trade.result > 3).length,
      color: "var(--mint)",
    },
  ];
  return (
    <Panel className="p-5">
      <PanelHeader
        title="R distribution"
        meta="Fixed-target outcome profile"
        action={
          <span className="number text-[10px] text-faint">48 trades</span>
        }
      />
      <div className="mt-5 h-40">
        {loading ? (
          <Skeleton className="h-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={buckets}
              margin={{ top: 4, right: 0, left: -30, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--line)"
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "var(--text-3)",
                  fontSize: 9,
                  fontFamily: "JetBrains Mono Variable",
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "var(--text-3)",
                  fontSize: 9,
                  fontFamily: "JetBrains Mono Variable",
                }}
              />
              <Tooltip
                cursor={{ fill: "var(--line)" }}
                contentStyle={{
                  background: "var(--raised)",
                  border: "1px solid var(--line-strong)",
                  borderRadius: 9,
                  fontSize: 10,
                }}
              />
              <Bar
                dataKey="value"
                radius={[5, 5, 0, 0]}
                isAnimationActive={false}
              >
                {buckets.map((bucket) => (
                  <Cell
                    key={bucket.name}
                    fill={bucket.color}
                    fillOpacity={0.76}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <p className="mt-3 text-[10.5px] leading-relaxed text-faint">
        The −1R column should remain tallest. Edge comes from asymmetric
        winners, not frequent wins.
      </p>
    </Panel>
  );
}

function DailyPlan({ loading }: { loading: boolean }) {
  const { notify } = useApp();
  const [items, setItems] = useState(checklistSeed);
  const complete = items.filter((item) => item.done).length;
  const toggle = (id: number) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item,
    );
    setItems(next);
    const selected = next.find((item) => item.id === id);
    if (selected?.done) notify(`Checked off — ${selected.label.toLowerCase()}`);
  };
  return (
    <Panel className="p-5">
      <PanelHeader
        title="Today's plan"
        meta="Pre-session execution checklist"
        action={
          <Badge tone={complete === items.length ? "mint" : "neutral"}>
            {complete}/{items.length}
          </Badge>
        }
      />
      {loading ? (
        <div className="mt-5 space-y-2">
          {items.map((item) => (
            <Skeleton key={item.id} className="h-10" />
          ))}
        </div>
      ) : (
        <ul className="mt-4 space-y-1.5">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => toggle(item.id)}
                aria-pressed={item.done}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-colors",
                  item.done ? "bg-sunken" : "hover:border-line hover:bg-raised",
                )}
              >
                <span
                  className={cn(
                    "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border",
                    item.done
                      ? "border-mint bg-mint text-[#06140f]"
                      : "border-[var(--line-strong)] text-transparent",
                  )}
                >
                  <Check size={11} weight="bold" />
                </span>
                <span
                  className={cn(
                    "text-[12px]",
                    item.done ? "text-faint line-through" : "text-ink",
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="bg-sunken mt-4 h-1 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full bg-mint transition-[width] duration-500 ease-premium"
          style={{ width: `${(complete / items.length) * 100}%` }}
        />
      </div>
    </Panel>
  );
}

function Insights() {
  const insightRows = [
    {
      label: "Sweep + reclaim",
      value: "+8.4R",
      note: "6 trades · all rules kept",
      positive: true,
    },
    {
      label: "London 09:00–11:00",
      value: "+11.2R",
      note: "highest expectancy window",
      positive: true,
    },
    {
      label: "Session open drive",
      value: "−3.0R",
      note: "3 of 5 broke hands-off rule",
      positive: false,
    },
    {
      label: "After 15:00",
      value: "−2.0R",
      note: "consider ending earlier",
      positive: false,
    },
  ];
  return (
    <Panel className="p-5">
      <PanelHeader
        title="What's working"
        meta="Last 30 trades · rule-adjusted"
        action={<TrendUp size={16} className="text-mint" />}
      />
      <ul className="mt-5 space-y-4">
        {insightRows.map((row) => (
          <li key={row.label} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                row.positive ? "bg-mint" : "bg-coral",
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[12px] text-ink">
                  {row.label}
                </span>
                <span
                  className={cn(
                    "number text-[11px]",
                    row.positive ? "text-mint" : "text-coral",
                  )}
                >
                  {row.value}
                </span>
              </div>
              <p className="mt-0.5 text-[10.5px] text-faint">{row.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function RecentTrades({ loading }: { loading: boolean }) {
  const recent = [...trades].slice(-7).reverse();
  return (
    <Panel className="overflow-hidden lg:col-span-3">
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <PanelHeader
          title="Recent trades"
          meta="Execution quality at a glance"
        />
        <Button asChild variant="ghost" size="sm">
          <Link href="/journal">
            Open journal <ArrowRight size={13} />
          </Link>
        </Button>
      </div>
      {loading ? (
        <div className="space-y-2 px-5 pb-5">
          {recent.slice(0, 5).map((trade) => (
            <Skeleton key={trade.id} className="h-11" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-[11.5px]">
            <thead>
              <tr className="border-y border-line text-[10px] font-normal text-faint">
                <th className="px-5 py-2.5 font-normal">Trade</th>
                <th className="px-5 py-2.5 font-normal">Instrument</th>
                <th className="px-5 py-2.5 font-normal">Setup</th>
                <th className="px-5 py-2.5 text-right font-normal">Rules</th>
                <th className="px-5 py-2.5 text-right font-normal">Result</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((trade) => (
                <tr
                  key={trade.id}
                  className="hover:bg-raised/60 border-b border-line transition-colors last:border-0"
                >
                  <td className="number px-5 py-3 text-muted">{trade.tag}</td>
                  <td className="px-5 py-3 text-ink">
                    {trade.symbol}
                    <span className="ml-2 text-[9.5px] text-faint">
                      {trade.side}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted">{trade.setup}</td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className="inline-flex items-end gap-[3px]"
                      title={`${trade.adherence} of 7 rules kept`}
                    >
                      {Array.from({ length: 7 }, (_, index) => (
                        <i
                          key={index}
                          className={cn(
                            "block w-[3px] rounded-sm",
                            index < trade.adherence
                              ? "h-3 bg-mint opacity-80"
                              : "h-3 border border-coral opacity-75",
                          )}
                        />
                      ))}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "number px-5 py-3 text-right",
                      trade.result > 0 ? "text-mint" : "text-coral",
                    )}
                  >
                    {formatR(trade.result)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

export function DashboardView() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 620);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <PageFrame>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <EquityPanel loading={loading} />
        <RiskEnvelope loading={loading} />
        <MetricStrip loading={loading} />
        <Distribution loading={loading} />
        <DailyPlan loading={loading} />
        <Insights />
        <RecentTrades loading={loading} />
      </div>
    </PageFrame>
  );
}
