"use client";

import { Badge } from "@/components/ui/badge";
import { useMarketData } from "@/components/providers/market-data-provider";
import { cn } from "@/lib/utils";

type DataSourceIndicatorProps = {
  className?: string;
};

export function DataSourceIndicator({ className }: DataSourceIndicatorProps) {
  const { loading, status } = useMarketData();

  if (loading) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full border px-3 py-1.5",
        status.source === "live"
          ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
          : "border-primary/20 bg-primary/10 text-primary",
        className,
      )}
    >
      {status.label}
    </Badge>
  );
}
