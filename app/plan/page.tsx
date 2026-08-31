import type { Metadata } from "next";

import { PlanBuilder } from "@/components/plan/plan-builder";

export const metadata: Metadata = { title: "Trading Plan" };

export default function PlanPage() {
  return <PlanBuilder />;
}
