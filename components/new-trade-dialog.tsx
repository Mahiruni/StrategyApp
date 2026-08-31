"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowRight,
  Camera,
  Check,
  FloppyDisk,
  X,
} from "@phosphor-icons/react";

import { useApp } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Badge, FieldLabel } from "@/components/ui/primitives";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

const instrumentDefaults = {
  XAUUSD: { entry: 3341.8, stop: 3335.8, target: 3364.78 },
  USDJPY: { entry: 149.462, stop: 149.122, target: 150.764 },
  BTCUSDT: { entry: 118400, stop: 117480, target: 121923.6 },
} as const;

type Instrument = keyof typeof instrumentDefaults;

export function NewTradeDialog({ open, onOpenChange }: Props) {
  const { notify } = useApp();
  const [side, setSide] = useState<"Long" | "Short">("Long");
  const [symbol, setSymbol] = useState("XAUUSD");
  const [entry, setEntry] = useState(3341.8);
  const [stop, setStop] = useState(3335.8);
  const [target, setTarget] = useState(3364.78);
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const ratio = useMemo(() => {
    const risk = Math.abs(entry - stop);
    return risk ? Math.abs(target - entry) / risk : 0;
  }, [entry, stop, target]);

  const changeInstrument = (instrument: Instrument) => {
    const defaults = instrumentDefaults[instrument];
    setSymbol(instrument);
    setEntry(defaults.entry);
    setStop(defaults.stop);
    setTarget(defaults.target);
  };

  const saveTrade = (status: "draft" | "logged") => {
    const record = {
      id: Date.now(),
      symbol,
      side,
      entry,
      stop,
      target,
      notes,
      screenshot: imageFile?.name ?? null,
      status,
      createdAt: new Date().toISOString(),
    };
    const current = JSON.parse(
      window.localStorage.getItem("meridian-user-trades") ?? "[]",
    ) as unknown[];
    window.localStorage.setItem(
      "meridian-user-trades",
      JSON.stringify([record, ...current]),
    );
    window.dispatchEvent(new CustomEvent("meridian:trade-saved"));
    notify(
      status === "draft" ? "Trade draft saved" : "Trade added to your journal",
    );
    onOpenChange(false);
    setNotes("");
    setImageFile(null);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-[#030407]/70 backdrop-blur-sm data-[state=open]:animate-[fade_.2s_ease]" />
        <Dialog.Content className="glass fixed left-1/2 top-1/2 z-[80] max-h-[92vh] w-[calc(100%-1.5rem)] max-w-[680px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[20px] shadow-float focus:outline-none">
          <div className="sticky top-0 z-10 flex items-start justify-between border-b border-line bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-5 py-4 backdrop-blur-xl sm:px-6">
            <div>
              <div className="eyebrow">Journal entry</div>
              <Dialog.Title className="mt-1.5 text-[17px] font-[560] tracking-[-0.025em] text-ink">
                Log a new trade
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[11.5px] text-faint">
                Capture the plan before the outcome changes your memory.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close trade dialog"
              >
                <X size={16} />
              </Button>
            </Dialog.Close>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <FieldLabel label="Instrument">
              <select
                className="field"
                value={symbol}
                onChange={(event) =>
                  changeInstrument(event.target.value as Instrument)
                }
              >
                <option>XAUUSD</option>
                <option>USDJPY</option>
                <option>BTCUSDT</option>
              </select>
            </FieldLabel>
            <FieldLabel label="Direction">
              <div className="bg-sunken grid grid-cols-2 rounded-[11px] border border-line p-1">
                {(["Long", "Short"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSide(value)}
                    className={`h-8 rounded-lg text-[12px] transition-colors ${
                      side === value
                        ? value === "Long"
                          ? "bg-[var(--mint-soft)] text-mint"
                          : "bg-[var(--coral-soft)] text-coral"
                        : "text-faint hover:text-muted"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </FieldLabel>
            <FieldLabel label="Entry">
              <input
                className="field number"
                type="number"
                step="0.01"
                value={entry}
                onChange={(event) => setEntry(Number(event.target.value))}
              />
            </FieldLabel>
            <FieldLabel label="Stop loss">
              <input
                className="field number"
                type="number"
                step="0.01"
                value={stop}
                onChange={(event) => setStop(Number(event.target.value))}
              />
            </FieldLabel>
            <FieldLabel label="Final target">
              <input
                className="field number"
                type="number"
                step="0.01"
                value={target}
                onChange={(event) => setTarget(Number(event.target.value))}
              />
            </FieldLabel>
            <div className="bg-sunken rounded-xl border border-line px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-faint">Planned reward</span>
                <Badge tone={ratio >= 3 ? "mint" : "gold"}>
                  <ArrowRight size={11} weight="bold" />
                  {ratio.toFixed(2)}R
                </Badge>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-raised">
                <div
                  className="h-full rounded-full bg-mint transition-[width] duration-500 ease-premium"
                  style={{ width: `${Math.min(100, (ratio / 4) * 100)}%` }}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <FieldLabel label="Pre-trade notes" hint={`${notes.length}/280`}>
                <textarea
                  className="field min-h-24 resize-none"
                  maxLength={280}
                  placeholder="Bias, liquidity event, confirmation, and anything you feel right now…"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </FieldLabel>
            </div>

            <div className="sm:col-span-2">
              <span className="field-label">Chart screenshot</span>
              <label className="bg-sunken group relative flex min-h-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-[var(--line-strong)] transition-colors hover:border-[rgba(var(--mint-rgb),.34)]">
                {preview ? (
                  <Image
                    src={preview}
                    alt="Selected chart screenshot"
                    fill
                    unoptimized
                    className="object-cover opacity-65"
                  />
                ) : null}
                <span className="relative z-[1] flex flex-col items-center gap-2 px-5 text-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-raised text-faint group-hover:text-mint">
                    <Camera size={17} />
                  </span>
                  <span className="text-[11.5px] text-muted">
                    {imageFile ? imageFile.name : "Attach PNG, JPG, or WebP"}
                  </span>
                </span>
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) =>
                    setImageFile(event.target.files?.[0] ?? null)
                  }
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <Button variant="ghost" onClick={() => saveTrade("draft")}>
              <FloppyDisk size={15} /> Save draft
            </Button>
            <Button variant="primary" onClick={() => saveTrade("logged")}>
              <Check size={15} weight="bold" /> Log trade
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
