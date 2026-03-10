"use client";

import { Star } from "lucide-react";
import { useDemoState } from "@/components/providers/demo-state-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WatchlistToggleProps = {
  symbol: string;
  compact?: boolean;
};

export function WatchlistToggle({
  symbol,
  compact = false,
}: WatchlistToggleProps) {
  const { hydrated, isWatchlisted, toggleWatchlist } = useDemoState();
  const active = hydrated && isWatchlisted(symbol);

  return (
    <Button
      type="button"
      variant={active ? "secondary" : "outline"}
      size={compact ? "sm" : "default"}
      onClick={() => toggleWatchlist(symbol)}
      className={cn(active && "border-primary/20 bg-primary/10 text-primary")}
    >
      <Star className={cn("size-4", active && "fill-current")} />
      {active ? "監視中" : "ウォッチ追加"}
    </Button>
  );
}
