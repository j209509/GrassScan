import { Badge } from "@/components/ui/badge";
import { FLAG_LABELS } from "@/lib/market/flags";
import type { ActivityFlag } from "@/lib/market/types";
import { cn } from "@/lib/utils";

const flagStyles: Record<ActivityFlag, string> = {
  HIGH_RELATIVE_VOLUME: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  LARGE_PRICE_MOVE: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  VOLATILITY_EXPANSION: "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200",
  GAP_MOVE: "border-violet-400/20 bg-violet-400/10 text-violet-200",
  WATCHLIST_SYMBOL: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  NEWS_SURGE: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
};

type FlagPillProps = {
  flag: ActivityFlag;
  className?: string;
};

export function FlagPill({ flag, className }: FlagPillProps) {
  return (
    <Badge
      className={cn(
        "rounded-full border px-3 py-1 text-[11px] tracking-[0.18em] uppercase",
        flagStyles[flag],
        className,
      )}
    >
      {FLAG_LABELS[flag]}
    </Badge>
  );
}
