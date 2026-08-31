"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarBlank,
  CheckCircle,
  Clock,
  Crosshair,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge, Panel, PanelHeader } from "@/components/ui/primitives";
import { PageFrame } from "@/components/ui/page-frame";
import { getStats, trades } from "@/lib/data";
import { cn, formatPercent, formatR } from "@/lib/utils";

const ranges = ["30D", "90D", "YTD", "All", "Custom"] as const;
type Range = (typeof ranges)[number];

export function AnalyticsView() {
  const [range, setRange] = useState<Range>("90D");
  const [from, setFrom] = useState("2026-07-01");
  const [to, setTo] = useState("2026-08-30");

  const data = useMemo(() => {
    if (range === "Custom")
      return trades.filter((trade) => trade.date >= from && trade.date <= to);
    const count = {
      "30D": 20,
      "90D": 38,
      YTD: trades.length,
      All: trades.length,
    }[range];
    return trades.slice(-count);
  }, [from, range, to]);

  const stats = useMemo(() => getStats(data), [data]);
  const curve = useMemo(() => {
    let total = 0;
    return data.map((trade) => {
      total += trade.result;
      return {
        tag: trade.tag,
        equity: Number(total.toFixed(2)),
        date: trade.date,
      };
    });
  }, [data]);

  const bySetup = useMemo(() => {
    const names = [...new Set(data.map((trade) => trade.setup))];
    return names.map((name) => {
      const selected = data.filter((trade) => trade.setup === name);
      return {
        name: name.replace("M15 ", ""),
        result: Number(
          selected.reduce((sum, trade) => sum + trade.result, 0).toFixed(2),
        ),
        trades: selected.length,
      };
    });
  }, [data]);

  const bySymbol = useMemo(
    () =>
      ["XAUUSD", "USDJPY", "BTCUSDT"].map((name) => {
        const selected = data.filter((trade) => trade.symbol === name);
        const selectedStats = getStats(selected);
        return { name, ...selectedStats };
      }),
    [data],
  );

  const heatmap = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16];
    return {
      days,
      hours,
      cells: days.flatMap((day, dayIndex) =>
        hours.map((hour) => {
          const matching = data.filter(
            (trade) =>
              new Date(`${trade.date}T12:00:00Z`).getUTCDay() ===
                dayIndex + 1 && trade.hour === hour,
          );
          const average = matching.length
            ? matching.reduce((sum, trade) => sum + trade.result, 0) /
              matching.length
            : 0;
          return { day, hour, average, count: matching.length };
        }),
      ),
    };
  }, [data]);

  return (
    <PageFrame className="space-y-5">
      <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="eyebrow mb-2">Performance intelligence</div>
          <h2 className="text-[22px] font-[570] tracking-[-0.035em] text-ink sm:text-[25px]">
            Find the behavior behind the P&amp;L.
          </h2>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-muted">
            Separate genuine edge from noise, timing, and rule-breaking.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div
            className="bg-sunken inline-flex overflow-x-auto rounded-[10px] border border-line p-0.5"
            role="tablist"
            aria-label="Analytics range"
          >
            {ranges.map((item) => (
              <button
                key={item}
                role="tab"
                aria-selected={range === item}
                onClick={() => setRange(item)}
                className={cn(
                  "number whitespace-nowrap rounded-lg px-3 py-2 text-[10px] transition-colors",
                  range === item
                    ? "bg-raised text-ink"
                    : "text-faint hover:text-muted",
                )}
              >
                {item}
              </button>
            ))}
          </div>
          {range === "Custom" ? (
            <div className="bg-sunken flex items-center gap-2 rounded-[10px] border border-line px-3 py-1.5">
              <CalendarBlank size={14} className="text-faint" />
              <input
                type="date"
                aria-label="Start date"
                value={from}
                max={to}
                onChange={(event) => setFrom(event.target.value)}
                className="number w-[112px] bg-transparent text-[9.5px] text-muted outline-none"
              />
              <span className="text-faint">—</span>
              <input
                type="date"
                aria-label="End date"
                value={to}
                min={from}
                onChange={(event) => setTo(event.target.value)}
                className="number w-[112px] bg-transparent text-[9.5px] text-muted outline-none"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric
          label="Net R"
          value={formatR(stats.totalR, 1)}
          delta="+12.4%"
          tone="mint"
        />
        <Metric
          label="Win rate"
          value={formatPercent(stats.winRate)}
          delta="+2.4%"
          tone="mint"
        />
        <Metric
          label="Profit factor"
          value={stats.profitFactor.toFixed(2)}
          delta="+0.18"
          tone="mint"
        />
        <Metric
          label="Max drawdown"
          value={formatR(stats.maxDrawdown, 1)}
          delta="−1.2R"
          tone="coral"
        />
        <Metric
          label="Rule adherence"
          value={formatPercent(stats.adherence, 0)}
          delta="+6.0%"
          tone="mint"
          className="col-span-2 lg:col-span-1"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-5 sm:p-6 lg:col-span-2">
          <PanelHeader
            title="Cumulative performance"
            meta={`${stats.trades} trades · results in R multiples`}
            action={
              <Badge tone="mint">
                +{stats.expectancy.toFixed(2)}R expectancy
              </Badge>
            }
          />
          <div className="mt-5 h-[285px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={curve}
                margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="analyticsFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--mint)"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--mint)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="var(--line)"
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="tag"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "var(--text-3)",
                    fontSize: 9,
                    fontFamily: "JetBrains Mono Variable",
                  }}
                  minTickGap={35}
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
                  contentStyle={{
                    background: "var(--raised)",
                    border: "1px solid var(--line-strong)",
                    borderRadius: 10,
                    fontSize: 10,
                  }}
                  formatter={(value) => [formatR(Number(value)), "Cumulative"]}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="var(--mint)"
                  strokeWidth={2}
                  fill="url(#analyticsFill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <PanelHeader
            title="Setup performance"
            meta="Net outcome by playbook"
            action={<Crosshair size={16} className="text-faint" />}
          />
          <div className="mt-5 h-[285px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bySetup}
                layout="vertical"
                margin={{ top: 4, right: 10, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  horizontal={false}
                  stroke="var(--line)"
                  strokeDasharray="3 5"
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "var(--text-3)",
                    fontSize: 9,
                    fontFamily: "JetBrains Mono Variable",
                  }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={104}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--text-2)", fontSize: 9.5 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--raised)",
                    border: "1px solid var(--line-strong)",
                    borderRadius: 10,
                    fontSize: 10,
                  }}
                  formatter={(value) => [formatR(Number(value)), "Net result"]}
                />
                <Bar
                  dataKey="result"
                  radius={[0, 5, 5, 0]}
                  isAnimationActive={false}
                >
                  {bySetup.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.result >= 0 ? "var(--mint)" : "var(--coral)"}
                      fillOpacity={0.78}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="overflow-hidden p-5 sm:p-6 lg:col-span-2">
          <PanelHeader
            title="Time-of-day edge"
            meta="Average R by weekday and entry hour (UTC)"
            action={<Clock size={16} className="text-faint" />}
          />
          <div className="mt-5 overflow-x-auto pb-1">
            <div className="min-w-[620px]">
              <div className="grid grid-cols-[44px_repeat(9,1fr)] gap-1.5 text-center">
                <span />
                {heatmap.hours.map((hour) => (
                  <span
                    key={hour}
                    className="number pb-1 text-[9px] text-faint"
                  >
                    {String(hour).padStart(2, "0")}:00
                  </span>
                ))}
                {heatmap.days.map((day) => (
                  <HeatmapRow
                    key={day}
                    day={day}
                    cells={heatmap.cells.filter((cell) => cell.day === day)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-[9.5px] text-faint">
            <span>Weak edge</span>
            <div className="flex gap-1">
              {[-1, -0.5, 0, 0.5, 1].map((value) => (
                <i
                  key={value}
                  className="h-2.5 w-7 rounded-sm"
                  style={heatColor(value, true)}
                />
              ))}
            </div>
            <span>Strong edge</span>
          </div>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <PanelHeader
            title="Market contribution"
            meta="Quality and outcome by instrument"
          />
          <div className="mt-4 space-y-3">
            {bySymbol.map((market) => (
              <div
                key={market.name}
                className="bg-sunken rounded-xl border border-line px-4 py-3.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="number text-[11px] text-ink">
                    {market.name}
                  </span>
                  <span
                    className={cn(
                      "number text-[11px]",
                      market.totalR >= 0 ? "text-mint" : "text-coral",
                    )}
                  >
                    {formatR(market.totalR, 1)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[9.5px]">
                  <SmallStat label="Trades" value={String(market.trades)} />
                  <SmallStat
                    label="Win rate"
                    value={formatPercent(market.winRate, 0)}
                  />
                  <SmallStat
                    label="PF"
                    value={market.profitFactor.toFixed(2)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <InsightPanel
          title="What's working"
          subtitle="Behaviors to protect"
          tone="mint"
          icon={<CheckCircle size={18} weight="fill" />}
          rows={[
            {
              title: "London sweep + reclaim",
              note: "+0.92R expectancy across 8 trades",
              value: "+7.4R",
            },
            {
              title: "Seven-of-seven rule adherence",
              note: "Outperforms partial adherence by 0.68R",
              value: "+14.8R",
            },
          ]}
        />
        <InsightPanel
          title="Needs attention"
          subtitle="Behaviors reducing edge"
          tone="coral"
          icon={<WarningCircle size={18} weight="fill" />}
          rows={[
            {
              title: "Trades after 15:00 UTC",
              note: "Low focus and three management errors",
              value: "−2.0R",
            },
            {
              title: "Session open drive",
              note: "Negative expectancy in current sample",
              value: "−3.0R",
            },
          ]}
        />
      </section>
    </PageFrame>
  );
}

function Metric({
  label,
  value,
  delta,
  tone,
  className,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "mint" | "coral";
  className?: string;
}) {
  return (
    <Panel className={cn("p-4 sm:p-5", className)}>
      <p className="text-[10.5px] text-faint">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="number text-[19px] font-medium tracking-[-0.04em] text-ink">
          {value}
        </span>
        <span
          className={cn(
            "number inline-flex items-center gap-0.5 text-[9.5px]",
            tone === "mint" ? "text-mint" : "text-coral",
          )}
        >
          {tone === "mint" ? (
            <ArrowUpRight size={10} />
          ) : (
            <ArrowDownRight size={10} />
          )}
          {delta}
        </span>
      </div>
      <p className="mt-2 text-[9px] text-faint">vs previous period</p>
    </Panel>
  );
}

function HeatmapRow({
  day,
  cells,
}: {
  day: string;
  cells: Array<{ day: string; hour: number; average: number; count: number }>;
}) {
  return (
    <>
      <span className="flex items-center text-[9.5px] text-faint">{day}</span>
      {cells.map((cell) => (
        <div
          key={`${day}-${cell.hour}`}
          title={`${day} ${cell.hour}:00 · ${cell.count} trades · ${formatR(cell.average)}`}
          className="flex h-10 items-center justify-center rounded-[7px] border border-line text-[8.5px]"
          style={heatColor(cell.average, cell.count > 0)}
        >
          <span className="number opacity-80">
            {cell.count ? formatR(cell.average, 1) : "—"}
          </span>
        </div>
      ))}
    </>
  );
}

function heatColor(value: number, active: boolean) {
  if (!active)
    return { backgroundColor: "var(--sunken)", color: "var(--text-3)" };
  const intensity = Math.min(0.32, 0.08 + Math.abs(value) * 0.07);
  return {
    backgroundColor:
      value >= 0
        ? `rgba(var(--mint-rgb),${intensity})`
        : `rgba(var(--coral-rgb),${intensity})`,
    color: value >= 0 ? "var(--mint)" : "var(--coral)",
  };
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-faint">{label}</span>
      <span className="number mt-1 block text-muted">{value}</span>
    </div>
  );
}

function InsightPanel({
  title,
  subtitle,
  tone,
  icon,
  rows,
}: {
  title: string;
  subtitle: string;
  tone: "mint" | "coral";
  icon: React.ReactNode;
  rows: Array<{ title: string; note: string; value: string }>;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border",
            tone === "mint"
              ? "border-[rgba(var(--mint-rgb),.18)] bg-[var(--mint-soft)] text-mint"
              : "border-[rgba(var(--coral-rgb),.18)] bg-[var(--coral-soft)] text-coral",
          )}
        >
          {icon}
        </span>
        <div>
          <h3 className="text-[13px] font-medium text-ink">{title}</h3>
          <p className="mt-0.5 text-[10px] text-faint">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <div
            key={row.title}
            className="bg-sunken flex items-center gap-4 rounded-xl border border-line px-4 py-3.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] text-ink">{row.title}</p>
              <p className="mt-0.5 truncate text-[9.5px] text-faint">
                {row.note}
              </p>
            </div>
            <span
              className={cn(
                "number text-[11px]",
                tone === "mint" ? "text-mint" : "text-coral",
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
