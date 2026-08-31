import type { Metadata } from "next";

import { TradeJournal } from "@/components/journal/trade-journal";

export const metadata: Metadata = { title: "Trade Journal" };

export default function JournalPage() {
  return <TradeJournal />;
}
