import Link from "next/link";
import { Compass } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="surface flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-raised text-faint">
        <Compass size={22} />
      </span>
      <h2 className="mt-5 text-lg font-medium text-ink">
        That workspace view does not exist
      </h2>
      <p className="mt-2 text-[12.5px] text-muted">
        Return to the dashboard and continue from your active plan.
      </p>
      <Button asChild variant="secondary" className="mt-6">
        <Link href="/">Return to dashboard</Link>
      </Button>
    </div>
  );
}
