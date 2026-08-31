import type { PlanState, RuleItem, Trade } from "@/lib/types";

const setups = ["M15 structure shift", "Sweep + reclaim", "Session open drive"];
const symbols = ["XAUUSD", "USDJPY", "BTCUSDT"] as const;
const emotions = [
  "Calm",
  "Focused",
  "Hesitant",
  "Impatient",
  "Reactive",
] as const;

function randomGenerator() {
  let state = 8312026;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

const random = randomGenerator();

export const trades: Trade[] = Array.from({ length: 48 }, (_, index) => {
  const win = random() < 0.385;
  const partial = !win && random() < 0.14;
  const result = win ? 3.83 : partial ? 1.2 : -1;
  const day = 4 + Math.floor(index * 1.17);
  const date = new Date(Date.UTC(2026, 6, day));
  const symbol = symbols[Math.floor(random() * symbols.length)];
  const side = random() > 0.47 ? "Long" : "Short";
  const base = symbol === "XAUUSD" ? 3300 : symbol === "USDJPY" ? 149 : 118000;
  const unit = symbol === "XAUUSD" ? 4.8 : symbol === "USDJPY" ? 0.34 : 920;
  const entry = base + random() * unit * 5;
  const stop = side === "Long" ? entry - unit : entry + unit;
  const target = side === "Long" ? entry + unit * 3.83 : entry - unit * 3.83;
  const hour = 7 + Math.floor(random() * 10);

  return {
    id: index + 1,
    tag: `T-${String(index + 1).padStart(3, "0")}`,
    symbol,
    setup: setups[Math.floor(random() * setups.length)],
    side,
    result,
    adherence: Math.max(3, Math.min(7, 5 + Math.floor(random() * 3))),
    hour,
    date: date.toISOString().slice(0, 10),
    session: hour < 9 ? "Asia" : hour < 13 ? "London" : "New York",
    emotion: emotions[Math.floor(random() * emotions.length)],
    entry: Number(entry.toFixed(symbol === "USDJPY" ? 3 : 2)),
    stop: Number(stop.toFixed(symbol === "USDJPY" ? 3 : 2)),
    target: Number(target.toFixed(symbol === "USDJPY" ? 3 : 2)),
    notes:
      result > 0
        ? "Waited for the sweep, closed-candle shift, and the planned retracement. No management changes before TP1."
        : "Entry was valid, but attention drifted after execution. Review session timing and the hands-off rule.",
  };
});

export const equityData = (() => {
  let equity = 0;
  let peak = 0;
  return trades.map((trade, index) => {
    equity += trade.result;
    peak = Math.max(peak, equity);
    return {
      index: index + 1,
      label: trade.tag,
      date: trade.date,
      equity: Number(equity.toFixed(2)),
      drawdown: Number((equity - peak).toFixed(2)),
    };
  });
})();

export function getStats(input = trades) {
  const wins = input.filter((trade) => trade.result > 0);
  const losses = input.filter((trade) => trade.result <= 0);
  const grossProfit = wins.reduce((sum, trade) => sum + trade.result, 0);
  const grossLoss = Math.abs(
    losses.reduce((sum, trade) => sum + trade.result, 0),
  );
  let running = 0;
  let peak = 0;
  let maxDrawdown = 0;

  input.forEach((trade) => {
    running += trade.result;
    peak = Math.max(peak, running);
    maxDrawdown = Math.min(maxDrawdown, running - peak);
  });

  const totalR = input.reduce((sum, trade) => sum + trade.result, 0);

  return {
    totalR,
    winRate: input.length ? wins.length / input.length : 0,
    averageR: input.length ? totalR / input.length : 0,
    expectancy: input.length ? totalR / input.length : 0,
    profitFactor: grossLoss ? grossProfit / grossLoss : grossProfit,
    maxDrawdown,
    adherence: input.length
      ? input.reduce((sum, trade) => sum + trade.adherence, 0) /
        (input.length * 7)
      : 0,
    trades: input.length,
  };
}

export const defaultPlan: PlanState = {
  planName: "Structure-shift 3.83R",
  market: "XAUUSD",
  higherTimeframe: "H4 / H1",
  bias: "Trade only in the direction of the last confirmed H1 displacement.",
  invalidation:
    "No trade when H1 is ranging or the impulse leg is not structurally clear.",
  setup: "M15 structure shift",
  liquidityRule:
    "A visible liquidity sweep must occur inside the premium/discount point of interest.",
  entryRule:
    "Enter only after a closed-candle shift, on the retracement of the impulse leg.",
  entryFib: 0.71,
  stopFib: 0.95,
  tp1Fib: 0,
  tp2Fib: -0.21,
  accountSize: 10000,
  riskPercent: 1,
  entryPrice: 3341.8,
  stopPrice: 3335.8,
  maxDailyLoss: 3,
  exitRule:
    "Take partial profit at 0.00 and leave the final position for the −0.21 extension.",
  psychologyRule:
    "No chart intervention after execution unless the written invalidation condition occurs.",
  dailyGoal: "Execute one A-grade setup with complete rule adherence.",
  weeklyGoal:
    "Protect process quality above P&L. Stop after three risk units are consumed.",
};

export const rules: RuleItem[] = [
  {
    id: "r1",
    title: "Directional bias first",
    detail: "H4 and H1 must agree before any M15 execution work begins.",
    category: "Pre-trade",
    locked: true,
  },
  {
    id: "r2",
    title: "Use the displacement leg",
    detail:
      "Anchor Fibonacci from the origin to the extreme of the impulse that caused the shift.",
    category: "Execution",
    locked: true,
  },
  {
    id: "r3",
    title: "Fixed 0.71 / 0.95 execution",
    detail: "Entry at 0.71, protective stop at 0.95; never widen the stop.",
    category: "Risk",
    locked: true,
  },
  {
    id: "r4",
    title: "Three-unit daily cap",
    detail: "End the session after three full risk units are consumed.",
    category: "Risk",
  },
  {
    id: "r5",
    title: "Hands off after execution",
    detail:
      "Do not micromanage a valid trade between entry and the planned exit levels.",
    category: "Psychology",
  },
  {
    id: "r6",
    title: "Reset after a loss",
    detail:
      "Leave the screen for 90 seconds and name the emotion before scanning again.",
    category: "Psychology",
  },
];

export const chartPreview = [
  { x: 1, before: 45, after: 45 },
  { x: 2, before: 48, after: 49 },
  { x: 3, before: 43, after: 42 },
  { x: 4, before: 51, after: 55 },
  { x: 5, before: 50, after: 61 },
  { x: 6, before: 58, after: 69 },
  { x: 7, before: 55, after: 77 },
  { x: 8, before: 63, after: 84 },
];
