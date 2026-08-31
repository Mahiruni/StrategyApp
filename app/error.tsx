"use client";

import { WarningCircle } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/primitives";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Panel className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(var(--coral-rgb),.2)] bg-[var(--coral-soft)] text-coral">
        <WarningCircle size={22} />
      </span>
      <h2 className="mt-5 text-lg font-medium text-ink">
        This view could not be loaded
      </h2>
      <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-muted">
        Your saved plan and journal entries are safe in this browser. Try
        loading the view again.
      </p>
      <Button variant="secondary" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </Panel>
  );
}
