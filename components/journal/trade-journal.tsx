"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  Camera,
  Check,
  DownloadSimple,
  FadersHorizontal,
  MagnifyingGlass,
  NotePencil,
  SlidersHorizontal,
  X,
} from "@phosphor-icons/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
  EmptyState,
  Panel,
  PanelHeader,
} from "@/components/ui/primitives";
import { PageFrame } from "@/components/ui/page-frame";
import { chartPreview, getStats, trades } from "@/lib/data";
import type { SymbolName, Trade, TradeSide } from "@/lib/types";
import { cn, downloadText, formatDate, formatR } from "@/lib/utils";

type JournalTrade = Trade & {
  status?: "draft" | "logged";
  userCreated?: boolean;
};
type SortKey = "date" | "symbol" | "setup" | "adherence" | "result";

function loadStoredTrades(): JournalTrade[] {
  try {
    const records = JSON.parse(
      window.localStorage.getItem("meridian-user-trades") ?? "[]",
    ) as Array<{
      id: number;
      symbol: SymbolName;
      side: TradeSide;
      entry: number;
      stop: number;
      target: number;
      notes: string;
      status: "draft" | "logged";
      createdAt: string;
    }>;
    return records.map((record, index) => ({
      id: record.id,
      tag: `N-${String(records.length - index).padStart(3, "0")}`,
      symbol: record.symbol,
      side: record.side,
      entry: record.entry,
      stop: record.stop,
      target: record.target,
      notes: record.notes || "No review notes yet.",
      status: record.status,
      userCreated: true,
      setup: "New journal entry",
      result: 0,
      adherence: 7,
      hour: new Date(record.createdAt).getUTCHours(),
      date: record.createdAt.slice(0, 10),
      session: "London",
      emotion: "Focused",
    }));
  } catch {
    return [];
  }
}

export function TradeJournal() {
  const { notify, openNewTrade } = useApp();
  const [query, setQuery] = useState("");
  const [symbol, setSymbol] = useState("All");
  const [setup, setSetup] = useState("All setups");
  const [outcome, setOutcome] = useState("All outcomes");
  const [sort, setSort] = useState<{ key: SortKey; direction: 1 | -1 }>({
    key: "date",
    direction: -1,
  });
  const [selected, setSelected] = useState<JournalTrade | null>(null);
  const [stored, setStored] = useState<JournalTrade[]>([]);

  useEffect(() => {
    const refresh = () => setStored(loadStoredTrades());
    refresh();
    window.addEventListener("meridian:trade-saved", refresh);
    return () => window.removeEventListener("meridian:trade-saved", refresh);
  }, []);

  const allTrades = useMemo<JournalTrade[]>(
    () => [...stored, ...trades],
    [stored],
  );
  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return allTrades
      .filter(
        (trade) =>
          !lower ||
          `${trade.tag} ${trade.symbol} ${trade.setup} ${trade.notes}`
            .toLowerCase()
            .includes(lower),
      )
      .filter((trade) => symbol === "All" || trade.symbol === symbol)
      .filter((trade) => setup === "All setups" || trade.setup === setup)
      .filter(
        (trade) =>
          outcome === "All outcomes" ||
          (outcome === "Wins"
            ? trade.result > 0
            : outcome === "Losses"
              ? trade.result < 0
              : trade.result === 0),
      )
      .sort((a, b) => {
        const left = a[sort.key];
        const right = b[sort.key];
        return left > right
          ? sort.direction
          : left < right
            ? -sort.direction
            : 0;
      });
  }, [allTrades, outcome, query, setup, sort, symbol]);

  const journalStats = getStats(
    allTrades.filter((trade) => !trade.userCreated),
  );
  const activeFilters = [
    symbol !== "All",
    setup !== "All setups",
    outcome !== "All outcomes",
  ].filter(Boolean).length;

  const changeSort = (key: SortKey) => {
    setSort((current) => ({
      key,
      direction: current.key === key ? (current.direction === 1 ? -1 : 1) : -1,
    }));
  };

  const exportCsv = () => {
    const header = [
      "Trade",
      "Date",
      "Symbol",
      "Side",
      "Setup",
      "Rules",
      "Result",
    ];
    const rows = filtered.map((trade) => [
      trade.tag,
      trade.date,
      trade.symbol,
      trade.side,
      trade.setup,
      trade.adherence,
      trade.result,
    ]);
    downloadText(
      "meridian-trade-journal.csv",
      [header, ...rows]
        .map((row) =>
          row
            .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
            .join(","),
        )
        .join("\n"),
      "text/csv",
    );
    notify("Journal exported as CSV");
  };

  return (
    <PageFrame className="space-y-5">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="eyebrow mb-2">Trade journal</div>
          <h2 className="text-[22px] font-[570] tracking-[-0.035em] text-ink sm:text-[25px]">
            Review the decision, not only the result.
          </h2>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-muted">
            A clean record of context, execution, emotion, and rule adherence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={exportCsv}>
            <DownloadSimple size={15} /> Export
          </Button>
          <Button variant="primary" onClick={openNewTrade}>
            <NotePencil size={15} /> Add trade
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <JournalMetric
          label="Logged trades"
          value={String(allTrades.length)}
          note={`${stored.length} local entries`}
        />
        <JournalMetric
          label="Net outcome"
          value={formatR(journalStats.totalR, 1)}
          note="Closed trades"
          tone="mint"
        />
        <JournalMetric
          label="Rule quality"
          value={`${(journalStats.adherence * 100).toFixed(0)}%`}
          note="Average adherence"
        />
        <JournalMetric
          label="Best session"
          value="London"
          note="09:00–11:00 UTC"
        />
      </section>

      <Panel className="overflow-hidden">
        <div className="border-b border-line p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative min-w-0 flex-1 xl:max-w-sm">
              <MagnifyingGlass
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
              />
              <input
                className="field pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a trade, market, setup, or note"
                aria-label="Search journal"
              />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <FilterSelect
                label="Market"
                value={symbol}
                onChange={setSymbol}
                options={["All", "XAUUSD", "USDJPY", "BTCUSDT"]}
              />
              <FilterSelect
                label="Setup"
                value={setup}
                onChange={setSetup}
                options={[
                  "All setups",
                  "M15 structure shift",
                  "Sweep + reclaim",
                  "Session open drive",
                  "New journal entry",
                ]}
              />
              <FilterSelect
                label="Outcome"
                value={outcome}
                onChange={setOutcome}
                options={["All outcomes", "Wins", "Losses", "Open / draft"]}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="number text-[10px] text-faint">
              {filtered.length} of {allTrades.length} trades
            </p>
            {activeFilters ? (
              <button
                className="text-[10.5px] text-gold hover:underline"
                onClick={() => {
                  setSymbol("All");
                  setSetup("All setups");
                  setOutcome("All outcomes");
                }}
              >
                Clear {activeFilters} filters
              </button>
            ) : null}
          </div>
        </div>

        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-[11.5px]">
              <thead>
                <tr className="border-b border-line text-[10px] text-faint">
                  <SortableHead
                    label="Trade"
                    sortKey="date"
                    current={sort}
                    onSort={changeSort}
                  />
                  <SortableHead
                    label="Symbol"
                    sortKey="symbol"
                    current={sort}
                    onSort={changeSort}
                  />
                  <th className="px-5 py-3 font-normal">Direction</th>
                  <SortableHead
                    label="Setup"
                    sortKey="setup"
                    current={sort}
                    onSort={changeSort}
                  />
                  <th className="px-5 py-3 font-normal">Session</th>
                  <SortableHead
                    label="Rules"
                    sortKey="adherence"
                    current={sort}
                    onSort={changeSort}
                    align="right"
                  />
                  <SortableHead
                    label="Result"
                    sortKey="result"
                    current={sort}
                    onSort={changeSort}
                    align="right"
                  />
                </tr>
              </thead>
              <tbody>
                {filtered.map((trade) => (
                  <tr
                    key={trade.id}
                    className="hover:bg-raised/60 group border-b border-line transition-colors last:border-0"
                  >
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelected(trade)}
                        className="text-left"
                      >
                        <span className="number block text-[11px] text-ink group-hover:text-mint">
                          {trade.tag}
                        </span>
                        <span className="mt-0.5 block text-[9.5px] text-faint">
                          {formatDate(trade.date, true)}
                        </span>
                      </button>
                    </td>
                    <td className="number px-5 py-3.5 text-muted">
                      {trade.symbol}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={trade.side === "Long" ? "mint" : "coral"}>
                        {trade.side === "Long" ? (
                          <ArrowUpRight size={11} />
                        ) : (
                          <ArrowDownRight size={11} />
                        )}
                        {trade.side}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{trade.setup}</td>
                    <td className="px-5 py-3.5 text-faint">{trade.session}</td>
                    <td className="px-5 py-3.5 text-right">
                      <RuleBars score={trade.adherence} />
                    </td>
                    <td
                      className={cn(
                        "number px-5 py-3.5 text-right",
                        trade.result > 0
                          ? "text-mint"
                          : trade.result < 0
                            ? "text-coral"
                            : "text-gold",
                      )}
                    >
                      {trade.result === 0
                        ? (trade.status ?? "Open")
                        : formatR(trade.result)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<FadersHorizontal size={19} />}
            title="No trades match these filters"
            description="Clear a filter or search a different symbol, setup, or review note."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setSymbol("All");
                  setSetup("All setups");
                  setOutcome("All outcomes");
                }}
              >
                Reset filters
              </Button>
            }
          />
        )}
      </Panel>

      <TradeReview
        trade={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </PageFrame>
  );
}

function JournalMetric({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "mint";
}) {
  return (
    <Panel className="p-4 sm:p-5">
      <p className="text-[10.5px] text-faint">{label}</p>
      <p
        className={cn(
          "number mt-2 text-[20px] font-medium tracking-[-0.04em]",
          tone === "mint" ? "text-mint" : "text-ink",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[9.5px] text-faint">{note}</p>
    </Panel>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field min-w-40 pr-8"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function SortableHead({
  label,
  sortKey,
  current,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  current: { key: SortKey; direction: 1 | -1 };
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = current.key === sortKey;
  return (
    <th
      className={cn("px-5 py-3 font-normal", align === "right" && "text-right")}
    >
      <button
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 text-faint hover:text-muted",
          align === "right" && "ml-auto",
        )}
      >
        {label}
        {active ? (
          current.direction === 1 ? (
            <ArrowUp size={10} />
          ) : (
            <ArrowDown size={10} />
          )
        ) : (
          <SlidersHorizontal
            size={9}
            className="opacity-0 group-hover:opacity-100"
          />
        )}
      </button>
    </th>
  );
}

function RuleBars({ score }: { score: number }) {
  return (
    <span
      className="inline-flex items-end gap-[3px]"
      aria-label={`${score} of 7 rules kept`}
    >
      {Array.from({ length: 7 }, (_, index) => (
        <i
          key={index}
          className={cn(
            "block h-3 w-[3px] rounded-sm",
            index < score
              ? "bg-mint opacity-80"
              : "border border-coral opacity-70",
          )}
        />
      ))}
    </span>
  );
}

function TradeReview({
  trade,
  onOpenChange,
}: {
  trade: JournalTrade | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [chartMode, setChartMode] = useState<"before" | "after">("after");
  useEffect(() => setChartMode("after"), [trade?.id]);
  if (!trade) return null;
  return (
    <Dialog.Root open={Boolean(trade)} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-[#030407]/65 backdrop-blur-sm" />
        <Dialog.Content className="glass fixed inset-y-0 right-0 z-[80] w-full max-w-[570px] overflow-y-auto border-y-0 border-r-0 shadow-float focus:outline-none">
          <Dialog.Title className="sr-only">
            Trade review {trade.tag}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Detailed execution review and chart replay.
          </Dialog.Description>
          <div className="sticky top-0 z-10 flex items-start justify-between border-b border-line bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-5 py-4 backdrop-blur-xl sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="number text-[11px] text-faint">
                  {trade.tag}
                </span>
                <Badge tone={trade.side === "Long" ? "mint" : "coral"}>
                  {trade.side}
                </Badge>
                {trade.status ? (
                  <Badge tone="gold">{trade.status}</Badge>
                ) : null}
              </div>
              <p className="mt-2 text-[17px] font-[560] tracking-[-0.025em] text-ink">
                {trade.symbol} · {trade.setup}
              </p>
              <p className="mt-1 text-[10.5px] text-faint">
                {formatDate(trade.date)} · {trade.session} session
              </p>
            </div>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close trade review"
              >
                <X size={16} />
              </Button>
            </Dialog.Close>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <Panel className="overflow-hidden p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Chart replay</p>
                  <p className="mt-1 text-[10.5px] text-faint">
                    Compare the planned context with the outcome.
                  </p>
                </div>
                <div className="bg-sunken inline-flex rounded-lg border border-line p-0.5">
                  {(["before", "after"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setChartMode(mode)}
                      className={cn(
                        "rounded-md px-2.5 py-1.5 text-[9.5px] capitalize",
                        chartMode === mode
                          ? "bg-raised text-ink"
                          : "text-faint",
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartPreview}
                    margin={{ top: 8, right: 4, left: -28, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="reviewFill"
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
                    <XAxis dataKey="x" hide />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--text-3)", fontSize: 9 }}
                    />
                    <ReferenceLine
                      y={55}
                      stroke="var(--gold)"
                      strokeDasharray="4 4"
                    />
                    <Area
                      type="monotone"
                      dataKey={chartMode}
                      stroke="var(--mint)"
                      strokeWidth={2}
                      fill="url(#reviewFill)"
                      isAnimationActive
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--raised)",
                        border: "1px solid var(--line-strong)",
                        borderRadius: 9,
                        fontSize: 10,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex items-center gap-4 text-[9.5px] text-faint">
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-0.5 w-3 bg-mint" /> Price path
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-0.5 w-3 bg-gold" /> 0.71 entry zone
                </span>
              </div>
            </Panel>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ReviewMetric
                label="Entry"
                value={trade.entry.toFixed(trade.symbol === "USDJPY" ? 3 : 2)}
              />
              <ReviewMetric
                label="Stop"
                value={trade.stop.toFixed(trade.symbol === "USDJPY" ? 3 : 2)}
              />
              <ReviewMetric
                label="Target"
                value={trade.target.toFixed(trade.symbol === "USDJPY" ? 3 : 2)}
              />
              <ReviewMetric
                label="Result"
                value={trade.result ? formatR(trade.result) : "Open"}
                tone={
                  trade.result > 0
                    ? "mint"
                    : trade.result < 0
                      ? "coral"
                      : undefined
                }
              />
            </div>

            <Panel className="p-4">
              <PanelHeader
                title="Rule adherence"
                meta={`${trade.adherence} of 7 rules kept`}
                action={
                  <span className="number text-[13px] text-mint">
                    {Math.round((trade.adherence / 7) * 100)}%
                  </span>
                }
              />
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {Array.from({ length: 7 }, (_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex h-8 items-center justify-center rounded-lg border",
                      index < trade.adherence
                        ? "border-[rgba(var(--mint-rgb),.18)] bg-[var(--mint-soft)] text-mint"
                        : "border-[rgba(var(--coral-rgb),.18)] bg-[var(--coral-soft)] text-coral",
                    )}
                  >
                    {index < trade.adherence ? (
                      <Check size={13} weight="bold" />
                    ) : (
                      <X size={12} />
                    )}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="p-4">
              <PanelHeader
                title="Review notes"
                meta={`Emotion · ${trade.emotion}`}
              />
              <p className="mt-4 text-[11.5px] leading-[1.7] text-muted">
                {trade.notes}
              </p>
            </Panel>

            <Panel className="p-4">
              <div className="flex items-center gap-3">
                <span className="bg-sunken flex h-9 w-9 items-center justify-center rounded-lg border border-line text-faint">
                  <Camera size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] text-ink">
                    Before / after screenshots
                  </p>
                  <p className="mt-0.5 text-[9.5px] text-faint">
                    Chart attachments stay local to this browser.
                  </p>
                </div>
                <Badge tone={trade.userCreated ? "gold" : "mint"}>
                  {trade.userCreated ? "1 attached" : "2 attached"}
                </Badge>
              </div>
            </Panel>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ReviewMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "mint" | "coral";
}) {
  return (
    <div className="bg-sunken rounded-xl border border-line px-3 py-3">
      <p className="text-[9.5px] text-faint">{label}</p>
      <p
        className={cn(
          "number mt-1.5 truncate text-[11px] text-ink",
          tone === "mint" && "text-mint",
          tone === "coral" && "text-coral",
        )}
      >
        {value}
      </p>
    </div>
  );
}
