"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  BellSimple,
  Brain,
  CaretDown,
  Check,
  ClockCounterClockwise,
  LockKey,
  Moon,
  Plus,
  ShieldCheck,
  SpeakerHigh,
  Sun,
  X,
} from "@phosphor-icons/react";

import { useApp } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  Badge,
  FieldLabel,
  Panel,
  PanelHeader,
} from "@/components/ui/primitives";
import { PageFrame } from "@/components/ui/page-frame";
import { rules as seedRules } from "@/lib/data";
import type { RuleItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const categories = [
  "All",
  "Pre-trade",
  "Risk",
  "Execution",
  "Psychology",
] as const;
const dailyChecks = [
  "H4 and H1 direction are defined",
  "Red-folder news window is clear",
  "Maximum daily risk is available",
  "Mind is calm; no urgency to trade",
  "Entry, stop, TP1, and TP2 are written",
];

export function RulesVault() {
  const { notify, theme, toggleTheme } = useApp();
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [customRules, setCustomRules] = useState<RuleItem[]>([]);
  const [disabled, setDisabled] = useState<string[]>([]);
  const [checked, setChecked] = useState<number[]>([0, 1]);
  const [addOpen, setAddOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    try {
      setCustomRules(
        JSON.parse(
          window.localStorage.getItem("meridian-custom-rules") ?? "[]",
        ) as RuleItem[],
      );
      setDisabled(
        JSON.parse(
          window.localStorage.getItem("meridian-disabled-rules") ?? "[]",
        ) as string[],
      );
      setSound(window.localStorage.getItem("meridian-sound") === "on");
      setReducedMotion(
        window.localStorage.getItem("meridian-reduced-motion") === "on",
      );
    } catch {
      window.localStorage.removeItem("meridian-custom-rules");
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion
      ? "reduced"
      : "full";
  }, [reducedMotion]);

  const allRules = useMemo(() => [...seedRules, ...customRules], [customRules]);
  const visibleRules =
    category === "All"
      ? allRules
      : allRules.filter((rule) => rule.category === category);
  const enabled = allRules.length - disabled.length;

  const toggleRule = (rule: RuleItem) => {
    if (rule.locked) {
      notify("Core strategy rules are locked", "info");
      return;
    }
    const next = disabled.includes(rule.id)
      ? disabled.filter((id) => id !== rule.id)
      : [...disabled, rule.id];
    setDisabled(next);
    window.localStorage.setItem(
      "meridian-disabled-rules",
      JSON.stringify(next),
    );
    notify(next.includes(rule.id) ? "Rule paused" : "Rule restored");
  };

  const setSoundPreference = (value: boolean) => {
    setSound(value);
    window.localStorage.setItem("meridian-sound", value ? "on" : "off");
    if (value) playCue();
    notify(value ? "Subtle sound cues enabled" : "Sound cues disabled");
  };

  const setMotionPreference = (value: boolean) => {
    setReducedMotion(value);
    window.localStorage.setItem(
      "meridian-reduced-motion",
      value ? "on" : "off",
    );
    notify(value ? "Reduced motion enabled" : "Full motion restored");
  };

  return (
    <PageFrame className="space-y-5">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="eyebrow mb-2">Rules vault</div>
          <h2 className="text-[22px] font-[570] tracking-[-0.035em] text-ink sm:text-[25px]">
            Make discipline easier than improvisation.
          </h2>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-muted">
            Your strategy rules, pre-commit checklist, recovery protocols, and
            workspace preferences.
          </p>
        </div>
        <Button variant="primary" onClick={() => setAddOpen(true)}>
          <Plus size={15} weight="bold" /> Add rule
        </Button>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <VaultMetric
          label="Active rules"
          value={String(enabled)}
          note={`${disabled.length} paused`}
        />
        <VaultMetric
          label="Core rules"
          value={String(allRules.filter((rule) => rule.locked).length)}
          note="Protected from edits"
        />
        <VaultMetric
          label="Checklist"
          value={`${checked.length}/${dailyChecks.length}`}
          note="Today's pre-commit"
          tone="gold"
        />
        <VaultMetric label="Plan version" value="v4" note="Edited 28 Aug" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,.75fr)]">
        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <div className="border-b border-line p-4 sm:p-5">
              <PanelHeader
                title="Personal rulebook"
                meta="Rules are scored against every journal entry"
                action={<Badge tone="mint">{enabled} active</Badge>}
              />
              <div
                className="bg-sunken mt-4 flex gap-1.5 overflow-x-auto rounded-[10px] border border-line p-1"
                role="tablist"
                aria-label="Rule category"
              >
                {categories.map((item) => (
                  <button
                    key={item}
                    role="tab"
                    aria-selected={category === item}
                    onClick={() => setCategory(item)}
                    className={cn(
                      "whitespace-nowrap rounded-lg px-3 py-2 text-[10px] transition-colors",
                      category === item
                        ? "bg-raised text-ink shadow-sm"
                        : "text-faint hover:text-muted",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-line">
              {visibleRules.map((rule) => {
                const active = !disabled.includes(rule.id);
                return (
                  <div
                    key={rule.id}
                    className={cn(
                      "flex items-start gap-4 px-4 py-4 transition-colors sm:px-5",
                      active ? "hover:bg-raised/45" : "opacity-55",
                    )}
                  >
                    <button
                      onClick={() => toggleRule(rule)}
                      aria-label={`${active ? "Pause" : "Activate"} ${rule.title}`}
                      aria-pressed={active}
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors",
                        active
                          ? "border-[rgba(var(--mint-rgb),.2)] bg-[var(--mint-soft)] text-mint"
                          : "bg-sunken border-line text-faint",
                      )}
                    >
                      {rule.locked ? (
                        <LockKey size={12} weight="fill" />
                      ) : active ? (
                        <Check size={12} weight="bold" />
                      ) : null}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={cn(
                            "text-[12px] font-medium",
                            active ? "text-ink" : "text-muted",
                          )}
                        >
                          {rule.title}
                        </h3>
                        <Badge tone={categoryTone(rule.category)}>
                          {rule.category}
                        </Badge>
                        {rule.locked ? (
                          <span className="text-[9.5px] text-faint">Core</span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-[10.5px] leading-relaxed text-faint">
                        {rule.detail}
                      </p>
                    </div>
                    <Toggle
                      checked={active}
                      onChange={() => toggleRule(rule)}
                      label={`${active ? "Disable" : "Enable"} ${rule.title}`}
                      disabled={rule.locked}
                    />
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <PanelHeader
              title="Psychology protocols"
              meta="Short recovery scripts for high-pressure moments"
              action={<Brain size={17} className="text-gold" />}
            />
            <div className="mt-4 space-y-2">
              <Protocol
                title="The 90-second reset"
                cue="After any full loss"
                steps={[
                  "Stand up and move away from the chart.",
                  "Name the emotion without judging it.",
                  "Return only when breathing and urgency are neutral.",
                ]}
              />
              <Protocol
                title="Revenge-trade lockout"
                cue="After two consecutive losses"
                steps={[
                  "Close the execution platform for 20 minutes.",
                  "Screenshot both trades and score every rule.",
                  "Resume only if the next setup is independently A-grade.",
                ]}
              />
              <Protocol
                title="Premature-exit interruption"
                cue="When tempted to interfere"
                steps={[
                  "Read the written invalidation aloud.",
                  "Ask whether price has actually invalidated it.",
                  "If not, remove your hand from the mouse.",
                ]}
              />
            </div>
          </Panel>
        </div>

        <aside className="space-y-4">
          <Panel className="p-5">
            <PanelHeader
              title="Pre-commit checklist"
              meta="Complete before the first order"
              action={<ShieldCheck size={17} className="text-mint" />}
            />
            <ul className="mt-4 space-y-1.5">
              {dailyChecks.map((item, index) => {
                const done = checked.includes(index);
                return (
                  <li key={item}>
                    <button
                      onClick={() =>
                        setChecked((current) =>
                          done
                            ? current.filter((value) => value !== index)
                            : [...current, index],
                        )
                      }
                      aria-pressed={done}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-colors",
                        done
                          ? "bg-sunken"
                          : "hover:border-line hover:bg-raised",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border",
                          done
                            ? "border-mint bg-mint text-[#06140f]"
                            : "border-[var(--line-strong)]",
                        )}
                      >
                        {done ? <Check size={11} weight="bold" /> : null}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] leading-relaxed",
                          done ? "text-faint line-through" : "text-muted",
                        )}
                      >
                        {item}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="bg-sunken mt-4 h-1.5 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-mint transition-[width] duration-500"
                style={{
                  width: `${(checked.length / dailyChecks.length) * 100}%`,
                }}
              />
            </div>
          </Panel>

          <Panel className="p-5">
            <PanelHeader
              title="Workspace preferences"
              meta="Visual, motion, and feedback controls"
            />
            <div className="mt-4 divide-y divide-line">
              <Preference
                icon={theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                title="Theme"
                note={theme === "dark" ? "Premium dark" : "Calm light"}
                control={
                  <button
                    onClick={toggleTheme}
                    className="text-[10.5px] text-gold hover:underline"
                  >
                    Switch
                  </button>
                }
              />
              <Preference
                icon={<SpeakerHigh size={16} />}
                title="Sound cues"
                note="Only confirmations"
                control={
                  <Toggle
                    checked={sound}
                    onChange={() => setSoundPreference(!sound)}
                    label="Toggle sound cues"
                  />
                }
              />
              <Preference
                icon={<BellSimple size={16} />}
                title="Reduced motion"
                note="Minimize transitions"
                control={
                  <Toggle
                    checked={reducedMotion}
                    onChange={() => setMotionPreference(!reducedMotion)}
                    label="Toggle reduced motion"
                  />
                }
              />
            </div>
          </Panel>

          <Panel className="p-5">
            <PanelHeader
              title="Version history"
              meta="Rule changes stay traceable"
              action={
                <ClockCounterClockwise size={16} className="text-faint" />
              }
            />
            <ol className="mt-5 space-y-4 border-l border-line pl-4">
              <Version
                version="v4"
                date="28 Aug"
                note="Locked 0.95 stop and daily cap"
                active
              />
              <Version
                version="v3"
                date="17 Aug"
                note="Added closed-candle confirmation"
              />
              <Version
                version="v2"
                date="02 Aug"
                note="Separated TP1 and TP2 rules"
              />
            </ol>
          </Panel>
        </aside>
      </div>

      <AddRuleDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={(rule) => {
          const next = [...customRules, rule];
          setCustomRules(next);
          window.localStorage.setItem(
            "meridian-custom-rules",
            JSON.stringify(next),
          );
          notify("New rule added to the vault");
        }}
      />
    </PageFrame>
  );
}

function VaultMetric({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "gold";
}) {
  return (
    <Panel className="p-4 sm:p-5">
      <p className="text-[10.5px] text-faint">{label}</p>
      <p
        className={cn(
          "number mt-2 text-[20px] font-medium",
          tone === "gold" ? "text-gold" : "text-ink",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[9.5px] text-faint">{note}</p>
    </Panel>
  );
}

function categoryTone(
  category: RuleItem["category"],
): "neutral" | "mint" | "coral" | "gold" | "blue" {
  return {
    "Pre-trade": "blue",
    Risk: "coral",
    Execution: "mint",
    Psychology: "gold",
  }[category] as "neutral" | "mint" | "coral" | "gold" | "blue";
}

function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        checked
          ? "border-[rgba(var(--mint-rgb),.3)] bg-[var(--mint-soft)]"
          : "bg-sunken border-line",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] h-3 w-3 rounded-full transition-transform",
          checked ? "translate-x-[18px] bg-mint" : "translate-x-[3px] bg-faint",
        )}
      />
    </button>
  );
}

function Protocol({
  title,
  cue,
  steps,
}: {
  title: string;
  cue: string;
  steps: string[];
}) {
  return (
    <details className="bg-sunken group rounded-xl border border-line open:bg-raised">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-gold">
          <Brain size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11.5px] text-ink">{title}</span>
          <span className="mt-0.5 block text-[9.5px] text-faint">{cue}</span>
        </span>
        <CaretDown
          size={13}
          className="text-faint transition-transform group-open:rotate-180"
        />
      </summary>
      <ol className="space-y-2 border-t border-line px-4 py-4 pl-[64px]">
        {steps.map((step, index) => (
          <li
            key={step}
            className="flex gap-2 text-[10.5px] leading-relaxed text-muted"
          >
            <span className="number text-faint">{index + 1}.</span>
            {step}
          </li>
        ))}
      </ol>
    </details>
  );
}

function Preference({
  icon,
  title,
  note,
  control,
}: {
  icon: React.ReactNode;
  title: string;
  note: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <span className="bg-sunken flex h-8 w-8 items-center justify-center rounded-lg border border-line text-faint">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-ink">{title}</p>
        <p className="mt-0.5 text-[9.5px] text-faint">{note}</p>
      </div>
      {control}
    </div>
  );
}

function Version({
  version,
  date,
  note,
  active = false,
}: {
  version: string;
  date: string;
  note: string;
  active?: boolean;
}) {
  return (
    <li className="relative">
      <span
        className={cn(
          "absolute -left-[20px] top-1 h-2 w-2 rounded-full ring-4 ring-[var(--surface)]",
          active ? "bg-mint" : "bg-faint",
        )}
      />
      <div className="flex items-baseline justify-between">
        <span
          className={cn(
            "number text-[10.5px]",
            active ? "text-mint" : "text-muted",
          )}
        >
          {version}
        </span>
        <span className="number text-[9px] text-faint">{date}</span>
      </div>
      <p className="mt-1 text-[9.5px] leading-relaxed text-faint">{note}</p>
    </li>
  );
}

function AddRuleDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (rule: RuleItem) => void;
}) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [category, setCategory] = useState<RuleItem["category"]>("Execution");
  const submit = () => {
    if (!title.trim() || !detail.trim()) return;
    onAdd({
      id: `custom-${Date.now()}`,
      title: title.trim(),
      detail: detail.trim(),
      category,
    });
    setTitle("");
    setDetail("");
    onOpenChange(false);
  };
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-[#030407]/65 backdrop-blur-sm" />
        <Dialog.Content className="glass fixed left-1/2 top-1/2 z-[80] w-[calc(100%-1.5rem)] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] shadow-float focus:outline-none">
          <div className="flex items-start justify-between border-b border-line px-5 py-4">
            <div>
              <Dialog.Title className="text-[16px] font-[560] text-ink">
                Add a personal rule
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[10.5px] text-faint">
                Write it so a reviewer can score it yes or no.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close">
                <X size={15} />
              </Button>
            </Dialog.Close>
          </div>
          <div className="space-y-5 p-5">
            <FieldLabel label="Rule title">
              <input
                className="field"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. No entries after 15:00 UTC"
              />
            </FieldLabel>
            <FieldLabel label="Category">
              <select
                className="field"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as RuleItem["category"])
                }
              >
                <option>Pre-trade</option>
                <option>Risk</option>
                <option>Execution</option>
                <option>Psychology</option>
              </select>
            </FieldLabel>
            <FieldLabel label="Scorable detail">
              <textarea
                className="field min-h-24 resize-none"
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                placeholder="Describe exactly what counts as keeping or breaking this rule."
              />
            </FieldLabel>
          </div>
          <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
            <Dialog.Close asChild>
              <Button variant="ghost">Cancel</Button>
            </Dialog.Close>
            <Button
              variant="primary"
              disabled={!title.trim() || !detail.trim()}
              onClick={submit}
            >
              <Plus size={14} /> Add rule
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function playCue() {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = 640;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.16);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.17);
}
