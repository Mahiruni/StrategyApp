import type { Metadata } from "next";

import { RulesVault } from "@/components/vault/rules-vault";

export const metadata: Metadata = { title: "Rules Vault" };

export default function VaultPage() {
  return <RulesVault />;
}
