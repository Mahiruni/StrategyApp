export type SymbolName = "XAUUSD" | "USDJPY" | "BTCUSDT";
export type TradeSide = "Long" | "Short";
export type Emotion =
  "Calm" | "Focused" | "Hesitant" | "Impatient" | "Reactive";

export type Trade = {
  id: number;
  tag: string;
  symbol: SymbolName;
  setup: string;
  side: TradeSide;
  result: number;
  adherence: number;
  hour: number;
  date: string;
  session: "London" | "New York" | "Asia";
  emotion: Emotion;
  entry: number;
  stop: number;
  target: number;
  notes: string;
};

export type PlanState = {
  planName: string;
  market: SymbolName;
  higherTimeframe: string;
  bias: string;
  invalidation: string;
  setup: string;
  liquidityRule: string;
  entryRule: string;
  entryFib: number;
  stopFib: number;
  tp1Fib: number;
  tp2Fib: number;
  accountSize: number;
  riskPercent: number;
  entryPrice: number;
  stopPrice: number;
  maxDailyLoss: number;
  exitRule: string;
  psychologyRule: string;
  dailyGoal: string;
  weeklyGoal: string;
};

export type RuleItem = {
  id: string;
  title: string;
  detail: string;
  category: "Pre-trade" | "Risk" | "Execution" | "Psychology";
  locked?: boolean;
};
