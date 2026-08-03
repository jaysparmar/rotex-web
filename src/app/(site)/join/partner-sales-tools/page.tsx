"use client";
import { useState } from "react";
import { PartnerToolsLogin } from "@/components/sections/partner-tools-login";
import { PartnerToolsGrid } from "@/components/sections/partner-tools-grid";

export default function PartnerSalesToolsPage() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) return <PartnerToolsLogin onUnlock={() => setUnlocked(true)} />;
  return <PartnerToolsGrid />;
}
