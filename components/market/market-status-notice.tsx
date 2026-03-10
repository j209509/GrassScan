"use client";

import { AlertTriangle } from "lucide-react";
import { useMarketData } from "@/components/providers/market-data-provider";

export function MarketStatusNotice() {
  const { loading, status } = useMarketData();

  if (loading || !status.notice) {
    return null;
  }

  return (
    <div className="rounded-[1.4rem] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 shrink-0 text-amber-200" />
        <span>{status.notice}</span>
      </div>
    </div>
  );
}
