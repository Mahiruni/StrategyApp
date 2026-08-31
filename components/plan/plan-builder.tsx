"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  Crosshair,
  Flag,
  FloppyDisk,
  ShieldCheck,
  SignOut,
  SlidersHorizontal,
  TrendUp,
} from "@phosphor-icons/react";

import { useApp } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  Badge,
  Divider,
  FieldLabel,
  Panel,
  PanelHeader,
} from "@/components/ui/primitives";
import { PageFrame } from "@/components/ui/page-frame";
import { defaultPlan } from "@/lib/data";
import type { PlanState } from "@/lib/types";
import { clamp, cn } from "@/lib/utils";

type Step = { id: string; label: string; description: string; icon: Icon };

const steps: Step[] = [
  {
    id: "bias",
    label: "Market bias",
    description: "Define directional context",
    icon: TrendUp,
  },
  {
    id: "setup",
    label: "Setup criteria",
    description: "Qualify the pattern",
    icon: SlidersHorizontal,
  },
  {
    id: "entry",
    label: "Entry rules",
    description: "Lock the execution",
    icon: Crosshair,
  },
  {
    id: "risk",
    label: "Risk management",
    description: "Size the exposure",
    icon: ShieldCheck,
  },
  {
    id: "exit",
    label: "Exit rules",
    description: "Plan both outcomes",
    icon: SignOut,
  },
  {
    id: "psychology",
    label: "Psychology",
    description: "Protect decision quality",
    icon: Brain,
  },
  {
    id: "goals",
    label: "Goals",
    description: "Measure the process",
    icon: Flag,
  },
];

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      className="field resize-none leading-relaxed"
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function NumberField({
  value,
  onChange,
  step = "any",
  prefix,
  suffix,
}: {
  value: number;
  onChange: (value: number) => void;
  step?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="relative">
      {prefix ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-faint">
          {prefix}
        </span>
      ) : null}
      <input
        type="number"
        step={step}
        className={cn("field number", prefix && "pl-7", suffix && "pr-10")}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {suffix ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-faint">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

export function PlanBuilder() {
  const { notify } = useApp();
  const [plan, setPlan] = useState<PlanState>(defaultPlan);
  const [activeStep, setActiveStep] = useState(0);
  const [savedAt, setSavedAt] = useState("Not saved in this session");

  useEffect(() => {
    const stored = window.localStorage.getItem("meridian-plan");
    if (stored) {
      try {
        setPlan({
          ...defaultPlan,
          ...(JSON.parse(stored) as Partial<PlanState>),
        });
      } catch {
        window.localStorage.removeItem("meridian-plan");
      }
    }
  }, []);

  const update = <Key extends keyof PlanState>(
    key: Key,
    value: PlanState[Key],
  ) => {
    setPlan((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    window.localStorage.setItem("meridian-plan", JSON.stringify(plan));
    const time = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date());
    setSavedAt(`Saved ${time}`);
    notify("Trading plan saved as version 5");
  };

  const risk = useMemo(() => {
    const amount = (plan.accountSize * plan.riskPercent) / 100;
    const stopDistance = Math.abs(plan.entryPrice - plan.stopPrice);
    const units = stopDistance > 0 ? amount / stopDistance : 0;
    const lots =
      plan.market === "XAUUSD"
        ? units / 100
        : plan.market === "USDJPY"
          ? units / 100000
          : units;
    const direction = plan.entryPrice > plan.stopPrice ? 1 : -1;
    return {
      amount,
      stopDistance,
      units,
      lots,
      target: plan.entryPrice + direction * stopDistance * 3.83,
    };
  }, [
    plan.accountSize,
    plan.entryPrice,
    plan.market,
    plan.riskPercent,
    plan.stopPrice,
  ]);

  const completion = Math.round(((activeStep + 1) / steps.length) * 100);
  const step = steps[activeStep];

  return (
    <PageFrame className="space-y-5">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="eyebrow mb-2">Plan builder · v4</div>
          <h2 className="text-[22px] font-[570] tracking-[-0.035em] text-ink sm:text-[25px]">
            Turn conviction into a repeatable protocol.
          </h2>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-muted">
            Every field should remove a decision you would otherwise make under
            pressure.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="number text-[10px] text-faint">{savedAt}</span>
          <Button variant="primary" onClick={save}>
            <FloppyDisk size={15} /> Save plan
          </Button>
        </div>
      </section>

      <div className="surface overflow-hidden">
        <div className="flex items-center gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div
            className="bg-sunken h-1.5 flex-1 overflow-hidden rounded-full"
            role="progressbar"
            aria-label="Plan completion"
            aria-valuenow={completion}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-mint transition-[width] duration-500 ease-premium"
              style={{ width: `${completion}%` }}
            />
          </div>
          <span className="number text-[10px] text-faint">{completion}%</span>
        </div>

        <div className="grid lg:grid-cols-[245px_minmax(0,1fr)]">
          <nav
            aria-label="Plan sections"
            className="border-b border-line p-3 lg:border-b-0 lg:border-r"
          >
            <div className="flex gap-1.5 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
              {steps.map((item, index) => {
                const StepIcon = item.icon;
                const active = index === activeStep;
                const complete = index < activeStep;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveStep(index)}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "group flex min-w-[176px] items-center gap-3 rounded-[11px] border px-3 py-2.5 text-left transition-colors lg:w-full lg:min-w-0",
                      active
                        ? "border-line bg-raised"
                        : "hover:bg-raised/60 border-transparent",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        active
                          ? "border-[rgba(var(--mint-rgb),.18)] bg-[var(--mint-soft)] text-mint"
                          : complete
                            ? "border-transparent bg-mint text-[#06140f]"
                            : "bg-sunken border-line text-faint",
                      )}
                    >
                      {complete ? (
                        <Check size={14} weight="bold" />
                      ) : (
                        <StepIcon
                          size={15}
                          weight={active ? "fill" : "regular"}
                        />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block truncate text-[11.5px]",
                          active ? "text-ink" : "text-muted",
                        )}
                      >
                        {item.label}
                      </span>
                      <span className="block truncate text-[9.5px] text-faint">
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="min-w-0">
            <div className="grid min-h-[580px] xl:grid-cols-[minmax(0,1fr)_340px]">
              <section className="p-5 sm:p-7">
                <div className="mb-7">
                  <div className="eyebrow">
                    Step {activeStep + 1} of {steps.length}
                  </div>
                  <h3 className="mt-2 text-[18px] font-[560] tracking-[-0.025em] text-ink">
                    {step.label}
                  </h3>
                  <p className="mt-1.5 text-[11.5px] text-faint">
                    {step.description}. Keep the language precise enough to
                    score after the trade.
                  </p>
                </div>

                {step.id === "bias" ? (
                  <BiasFields plan={plan} update={update} />
                ) : null}
                {step.id === "setup" ? (
                  <SetupFields plan={plan} update={update} />
                ) : null}
                {step.id === "entry" ? (
                  <EntryFields plan={plan} update={update} />
                ) : null}
                {step.id === "risk" ? (
                  <RiskFields plan={plan} update={update} />
                ) : null}
                {step.id === "exit" ? (
                  <ExitFields plan={plan} update={update} />
                ) : null}
                {step.id === "psychology" ? (
                  <PsychologyFields plan={plan} update={update} />
                ) : null}
                {step.id === "goals" ? (
                  <GoalFields plan={plan} update={update} />
                ) : null}
              </section>

              <aside className="bg-sunken/60 border-t border-line p-5 xl:border-l xl:border-t-0">
                <PlanPreview plan={plan} risk={risk} activeStep={step.id} />
              </aside>
            </div>

            <div className="flex items-center justify-between border-t border-line px-5 py-4 sm:px-7">
              <Button
                variant="ghost"
                disabled={activeStep === 0}
                onClick={() =>
                  setActiveStep((current) =>
                    clamp(current - 1, 0, steps.length - 1),
                  )
                }
              >
                <ArrowLeft size={14} /> Previous
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button variant="primary" onClick={save}>
                  <Check size={15} weight="bold" /> Complete plan
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() =>
                    setActiveStep((current) =>
                      clamp(current + 1, 0, steps.length - 1),
                    )
                  }
                >
                  Next section <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

type FormProps = {
  plan: PlanState;
  update: <Key extends keyof PlanState>(
    key: Key,
    value: PlanState[Key],
  ) => void;
};

function BiasFields({ plan, update }: FormProps) {
  return (
    <div className="space-y-5">
      <FormGrid>
        <FieldLabel label="Plan name">
          <input
            className="field"
            value={plan.planName}
            onChange={(event) => update("planName", event.target.value)}
          />
        </FieldLabel>
        <FieldLabel label="Primary market">
          <select
            className="field"
            value={plan.market}
            onChange={(event) =>
              update("market", event.target.value as PlanState["market"])
            }
          >
            <option>XAUUSD</option>
            <option>USDJPY</option>
            <option>BTCUSDT</option>
          </select>
        </FieldLabel>
        <FieldLabel label="Context timeframe">
          <select
            className="field"
            value={plan.higherTimeframe}
            onChange={(event) => update("higherTimeframe", event.target.value)}
          >
            <option>H4 / H1</option>
            <option>H1 / M30</option>
            <option>D1 / H4</option>
          </select>
        </FieldLabel>
      </FormGrid>
      <FieldLabel label="Directional bias rule" hint="Required">
        <TextArea
          value={plan.bias}
          onChange={(value) => update("bias", value)}
        />
      </FieldLabel>
      <FieldLabel label="Bias invalidation">
        <TextArea
          value={plan.invalidation}
          onChange={(value) => update("invalidation", value)}
          rows={3}
        />
      </FieldLabel>
    </div>
  );
}

function SetupFields({ plan, update }: FormProps) {
  return (
    <div className="space-y-5">
      <FormGrid>
        <FieldLabel label="Primary setup">
          <select
            className="field"
            value={plan.setup}
            onChange={(event) => update("setup", event.target.value)}
          >
            <option>M15 structure shift</option>
            <option>Sweep + reclaim</option>
            <option>Session open drive</option>
          </select>
        </FieldLabel>
        <FieldLabel label="Confirmation candle">
          <select className="field">
            <option>Closed candle only</option>
            <option>M5 confirmation allowed</option>
          </select>
        </FieldLabel>
      </FormGrid>
      <FieldLabel label="Liquidity requirement">
        <TextArea
          value={plan.liquidityRule}
          onChange={(value) => update("liquidityRule", value)}
        />
      </FieldLabel>
      <div className="rounded-xl border border-[rgba(var(--mint-rgb),.18)] bg-[var(--mint-soft)] p-4">
        <div className="flex gap-3">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-mint" />
          <div>
            <p className="text-[11.5px] font-medium text-ink">
              A-grade qualifier
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
              The impulse must cause a genuine internal or external structure
              shift. A large candle alone is not enough.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EntryFields({ plan, update }: FormProps) {
  return (
    <div className="space-y-5">
      <FieldLabel label="Execution rule">
        <TextArea
          value={plan.entryRule}
          onChange={(value) => update("entryRule", value)}
        />
      </FieldLabel>
      <FormGrid>
        <FieldLabel label="Entry Fibonacci" hint="Retracement">
          <NumberField
            value={plan.entryFib}
            step="0.01"
            onChange={(value) => update("entryFib", value)}
          />
        </FieldLabel>
        <FieldLabel label="Stop Fibonacci" hint="Invalidation">
          <NumberField
            value={plan.stopFib}
            step="0.01"
            onChange={(value) => update("stopFib", value)}
          />
        </FieldLabel>
        <FieldLabel label="TP1 Fibonacci">
          <NumberField
            value={plan.tp1Fib}
            step="0.01"
            onChange={(value) => update("tp1Fib", value)}
          />
        </FieldLabel>
        <FieldLabel label="TP2 Fibonacci">
          <NumberField
            value={plan.tp2Fib}
            step="0.01"
            onChange={(value) => update("tp2Fib", value)}
          />
        </FieldLabel>
      </FormGrid>
      <div className="bg-sunken rounded-xl border border-line p-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          <Level value={plan.stopFib} label="Stop" tone="coral" />
          <Level value={plan.entryFib} label="Entry" tone="gold" />
          <Level value={plan.tp1Fib} label="TP1" tone="mint" />
          <Level value={plan.tp2Fib} label="TP2" tone="mint" />
        </div>
      </div>
    </div>
  );
}

function RiskFields({ plan, update }: FormProps) {
  return (
    <div className="space-y-5">
      <FormGrid>
        <FieldLabel label="Account equity">
          <NumberField
            prefix="$"
            value={plan.accountSize}
            step="100"
            onChange={(value) => update("accountSize", value)}
          />
        </FieldLabel>
        <FieldLabel label="Risk per trade">
          <NumberField
            suffix="%"
            value={plan.riskPercent}
            step="0.1"
            onChange={(value) => update("riskPercent", value)}
          />
        </FieldLabel>
        <FieldLabel label="Planned entry">
          <NumberField
            value={plan.entryPrice}
            step="0.01"
            onChange={(value) => update("entryPrice", value)}
          />
        </FieldLabel>
        <FieldLabel label="Protective stop">
          <NumberField
            value={plan.stopPrice}
            step="0.01"
            onChange={(value) => update("stopPrice", value)}
          />
        </FieldLabel>
        <FieldLabel label="Daily loss cap">
          <NumberField
            suffix="R"
            value={plan.maxDailyLoss}
            step="1"
            onChange={(value) => update("maxDailyLoss", value)}
          />
        </FieldLabel>
      </FormGrid>
      <div className="rounded-xl border border-[rgba(var(--coral-rgb),.18)] bg-[var(--coral-soft)] p-4">
        <p className="text-[11.5px] font-medium text-ink">Hard risk rule</p>
        <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
          Position size changes with the stop distance. The monetary risk never
          changes because a setup “looks better.”
        </p>
      </div>
    </div>
  );
}

function ExitFields({ plan, update }: FormProps) {
  return (
    <div className="space-y-5">
      <FieldLabel label="Exit and management rule">
        <TextArea
          value={plan.exitRule}
          onChange={(value) => update("exitRule", value)}
          rows={5}
        />
      </FieldLabel>
      <FormGrid>
        <FieldLabel label="TP1 action">
          <select className="field">
            <option>Take 50% at 0.00</option>
            <option>Take 33% at 0.00</option>
            <option>No partial</option>
          </select>
        </FieldLabel>
        <FieldLabel label="After TP1">
          <select className="field">
            <option>Leave original stop</option>
            <option>Move to breakeven</option>
          </select>
        </FieldLabel>
      </FormGrid>
      <div className="bg-sunken rounded-xl border border-line p-4">
        <p className="eyebrow">Planned outcome</p>
        <div className="mt-4 grid grid-cols-[1fr_3.83fr] gap-1.5">
          <div className="flex h-9 items-center justify-center rounded-lg bg-coral text-[10.5px] font-medium text-[#250808]">
            −1R
          </div>
          <div className="flex h-9 items-center justify-center rounded-lg bg-mint text-[10.5px] font-medium text-[#06140f]">
            +3.83R
          </div>
        </div>
      </div>
    </div>
  );
}

function PsychologyFields({ plan, update }: FormProps) {
  return (
    <div className="space-y-5">
      <FieldLabel label="Hands-off protocol">
        <TextArea
          value={plan.psychologyRule}
          onChange={(value) => update("psychologyRule", value)}
          rows={5}
        />
      </FieldLabel>
      <FormGrid>
        <FieldLabel label="Emotion check">
          <select className="field">
            <option>Calm and neutral</option>
            <option>Hesitant</option>
            <option>Impatient</option>
            <option>Reactive — no trade</option>
          </select>
        </FieldLabel>
        <FieldLabel label="Loss reset">
          <select className="field">
            <option>90-second screen break</option>
            <option>5-minute walk</option>
            <option>End session</option>
          </select>
        </FieldLabel>
      </FormGrid>
      <div className="rounded-xl border border-[rgba(var(--gold-rgb),.18)] bg-[var(--gold-soft)] p-4">
        <p className="text-[11.5px] font-medium text-ink">Identity cue</p>
        <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
          A professional trader is paid for following a repeatable process, not
          for predicting the next candle.
        </p>
      </div>
    </div>
  );
}

function GoalFields({ plan, update }: FormProps) {
  return (
    <div className="space-y-5">
      <FieldLabel label="Daily process goal">
        <TextArea
          value={plan.dailyGoal}
          onChange={(value) => update("dailyGoal", value)}
          rows={4}
        />
      </FieldLabel>
      <FieldLabel label="Weekly process goal">
        <TextArea
          value={plan.weeklyGoal}
          onChange={(value) => update("weeklyGoal", value)}
          rows={4}
        />
      </FieldLabel>
      <FormGrid>
        <FieldLabel label="Target adherence">
          <NumberField value={90} suffix="%" onChange={() => undefined} />
        </FieldLabel>
        <FieldLabel label="Minimum sample">
          <NumberField value={30} suffix="trades" onChange={() => undefined} />
        </FieldLabel>
      </FormGrid>
    </div>
  );
}

function Level({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "mint" | "coral" | "gold";
}) {
  return (
    <div>
      <span
        className={cn(
          "number block rounded-lg border px-2 py-2.5 text-[11px]",
          tone === "mint" &&
            "border-[rgba(var(--mint-rgb),.2)] bg-[var(--mint-soft)] text-mint",
          tone === "coral" &&
            "border-[rgba(var(--coral-rgb),.2)] bg-[var(--coral-soft)] text-coral",
          tone === "gold" &&
            "border-[rgba(var(--gold-rgb),.2)] bg-[var(--gold-soft)] text-gold",
        )}
      >
        {value.toFixed(2)}
      </span>
      <span className="mt-1.5 block text-[9.5px] text-faint">{label}</span>
    </div>
  );
}

function PlanPreview({
  plan,
  risk,
  activeStep,
}: {
  plan: PlanState;
  risk: {
    amount: number;
    stopDistance: number;
    units: number;
    lots: number;
    target: number;
  };
  activeStep: string;
}) {
  return (
    <div className="sticky top-[92px] space-y-4">
      <PanelHeader
        title="Live plan preview"
        meta="Updates as you type"
        action={
          <Badge tone="mint">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" /> Active
          </Badge>
        }
      />
      <Panel className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">{plan.market}</p>
            <p className="mt-1.5 text-[13px] font-medium text-ink">
              {plan.planName}
            </p>
            <p className="mt-1 text-[10.5px] text-faint">
              {plan.higherTimeframe} context · M15 execution
            </p>
          </div>
          <Badge tone="gold">3.83R</Badge>
        </div>
        <Divider className="my-4" />
        <dl className="space-y-3 text-[10.5px]">
          <PreviewRow label="Setup" value={plan.setup} />
          <PreviewRow
            label="Entry / stop"
            value={`${plan.entryFib.toFixed(2)} / ${plan.stopFib.toFixed(2)}`}
            mono
          />
          <PreviewRow
            label="TP1 / TP2"
            value={`${plan.tp1Fib.toFixed(2)} / ${plan.tp2Fib.toFixed(2)}`}
            mono
          />
          <PreviewRow label="Daily cap" value={`${plan.maxDailyLoss}R`} mono />
        </dl>
      </Panel>
      <Panel
        className={cn(
          "p-4 transition-colors",
          activeStep === "risk" && "border-[rgba(var(--gold-rgb),.28)]",
        )}
      >
        <p className="eyebrow">Position size</p>
        <dl className="mt-3 grid grid-cols-2 gap-3">
          <PreviewMetric
            label="Risk amount"
            value={`$${risk.amount.toFixed(2)}`}
          />
          <PreviewMetric
            label={
              plan.market === "XAUUSD" ? "Standard lots" : "Position units"
            }
            value={
              plan.market === "XAUUSD"
                ? risk.lots.toFixed(2)
                : risk.units.toFixed(2)
            }
          />
          <PreviewMetric
            label="Stop distance"
            value={risk.stopDistance.toFixed(2)}
          />
          <PreviewMetric label="3.83R target" value={risk.target.toFixed(2)} />
        </dl>
        <p className="mt-3 text-[9.5px] leading-relaxed text-faint">
          XAU sizing assumes 100 oz per standard lot. Confirm contract
          specifications with your broker.
        </p>
      </Panel>
      <Panel className="p-4">
        <div className="flex items-center justify-between">
          <span className="eyebrow">R visualizer</span>
          <span className="number text-[10px] text-mint">+3.83R</span>
        </div>
        <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-raised">
          <div className="w-[20.7%] bg-coral" />
          <div className="flex-1 bg-mint" />
        </div>
        <div className="mt-2 flex justify-between text-[9.5px] text-faint">
          <span>Risk −1R</span>
          <span>Reward +3.83R</span>
        </div>
      </Panel>
    </div>
  );
}

function PreviewRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-faint">{label}</dt>
      <dd
        className={cn(
          "max-w-[180px] truncate text-right text-muted",
          mono && "number",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-sunken rounded-lg border border-line px-3 py-2.5">
      <dt className="text-[9.5px] text-faint">{label}</dt>
      <dd className="number mt-1 text-[12px] text-ink">{value}</dd>
    </div>
  );
}
