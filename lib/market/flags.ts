import type { ActivityFlag, BaseSymbolData } from "@/lib/market/types";

export const FLAG_LABELS: Record<ActivityFlag, string> = {
  HIGH_RELATIVE_VOLUME: "相対出来高急増",
  LARGE_PRICE_MOVE: "大幅値動き",
  VOLATILITY_EXPANSION: "ボラティリティ拡大",
  GAP_MOVE: "ギャップ",
  WATCHLIST_SYMBOL: "ウォッチ銘柄",
  NEWS_SURGE: "ニュース急増",
};

export function deriveFlags(
  symbol: Pick<
    BaseSymbolData,
    | "relativeVolume"
    | "dailyChangePct"
    | "volatilityExpansionPct"
    | "gapMovePct"
    | "newsCountIncrease"
  >,
  isWatchlisted: boolean,
) {
  const flags: ActivityFlag[] = [];

  if (symbol.relativeVolume >= 3) {
    flags.push("HIGH_RELATIVE_VOLUME");
  }

  if (Math.abs(symbol.dailyChangePct) >= 8) {
    flags.push("LARGE_PRICE_MOVE");
  }

  if (symbol.volatilityExpansionPct >= 35) {
    flags.push("VOLATILITY_EXPANSION");
  }

  if (Math.abs(symbol.gapMovePct) >= 4) {
    flags.push("GAP_MOVE");
  }

  if (isWatchlisted) {
    flags.push("WATCHLIST_SYMBOL");
  }

  if (symbol.newsCountIncrease >= 3) {
    flags.push("NEWS_SURGE");
  }

  return flags;
}
