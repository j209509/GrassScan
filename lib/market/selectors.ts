import { baseSymbolUniverse } from "@/lib/market/demo-data";
import { deriveFlags } from "@/lib/market/flags";
import { calculateActivityScore } from "@/lib/market/scoring";
import type {
  ActivityFlag,
  BaseSymbolData,
  DashboardFilters,
  EnrichedSymbol,
  MarketCapRangeKey,
  PreviousDaySnapshot,
  ScanHistoryEntry,
  ScoreInputs,
  SortDirection,
  SortableField,
} from "@/lib/market/types";

function round(value: number, digits = 2) {
  const precision = 10 ** digits;
  return Math.round(value * precision) / precision;
}

function buildScoreInputs(symbol: BaseSymbolData): ScoreInputs {
  return {
    relativeVolume: symbol.relativeVolume,
    intradayPriceMovePct: symbol.dailyChangePct,
    volatilityExpansionPct: symbol.volatilityExpansionPct,
    momentumPersistencePct: symbol.momentumPersistencePct,
    newsCountIncrease: symbol.newsCountIncrease,
  };
}

function buildPriceSummary(symbol: BaseSymbolData) {
  const fallbackPreviousClose = symbol.priceHistory.at(-2) ?? symbol.price;
  const previousClose = symbol.priceSummaryOverride?.previousClose ?? round(fallbackPreviousClose);
  const open =
    symbol.priceSummaryOverride?.open ??
    round(previousClose * (1 + symbol.gapMovePct / 100));
  const high =
    symbol.priceSummaryOverride?.high ??
    round(
      Math.max(symbol.price, open) *
        (1 + Math.min(0.11, Math.abs(symbol.dailyChangePct) / 120)),
    );
  const low =
    symbol.priceSummaryOverride?.low ??
    round(
      Math.min(symbol.price, open) *
        (1 - Math.min(0.09, symbol.volatilityExpansionPct / 420)),
    );

  return {
    open,
    high,
    low,
    previousClose,
  };
}

function buildPreviousDay(symbol: BaseSymbolData): PreviousDaySnapshot {
  const previousClose = symbol.priceHistory.at(-2) ?? symbol.price;
  const priorClose = symbol.priceHistory.at(-3) ?? previousClose;
  const previousChangePct = round(((previousClose - priorClose) / priorClose) * 100);
  const previousVolume = Math.max(
    250000,
    Math.round(symbol.volume / Math.max(1.15, symbol.relativeVolume * 0.68)),
  );
  const previousRelativeVolume = round(Math.max(1, symbol.relativeVolume - 0.9));
  const previousInputs: ScoreInputs = {
    relativeVolume: previousRelativeVolume,
    intradayPriceMovePct: previousChangePct,
    volatilityExpansionPct: Math.max(18, symbol.volatilityExpansionPct - 9),
    momentumPersistencePct: Math.max(25, symbol.momentumPersistencePct - 6),
    newsCountIncrease: Math.max(0, symbol.newsCountIncrease - 1),
  };
  const previousScore = calculateActivityScore(previousInputs);
  const previousFlags = deriveFlags(
    {
      relativeVolume: previousRelativeVolume,
      dailyChangePct: previousChangePct,
      volatilityExpansionPct: previousInputs.volatilityExpansionPct,
      gapMovePct: round(symbol.gapMovePct * 0.7, 1),
      newsCountIncrease: previousInputs.newsCountIncrease,
    },
    false,
  );

  return {
    close: round(previousClose),
    volume: previousVolume,
    relativeVolume: previousRelativeVolume,
    activityScore: previousScore.activityScore,
    flagsCount: previousFlags.length,
  };
}

function buildScanNote(flags: ActivityFlag[], summarySeed: string) {
  if (flags.includes("NEWS_SURGE")) {
    return `ニュース感応型の検知: ${summarySeed}。`;
  }

  if (flags.includes("GAP_MOVE")) {
    return `ギャップ主導の検知: ${summarySeed}。`;
  }

  if (flags.includes("HIGH_RELATIVE_VOLUME")) {
    return `流動性拡大を検知: ${summarySeed}。`;
  }

  return `定例スキャン更新: ${summarySeed}。`;
}

function buildRecentScans(
  symbol: BaseSymbolData,
  activityScore: number,
  flags: ActivityFlag[],
): ScanHistoryEntry[] {
  const historyDates = [
    "2026-03-10 09:25",
    "2026-03-10 09:20",
    "2026-03-10 09:15",
    "2026-03-10 09:10",
    "2026-03-10 09:05",
    "2026-03-10 09:00",
  ];
  const scoreHistory = symbol.scoreHistory.slice(-6).reverse();
  const reversedPrices = symbol.priceHistory.slice(-6).reverse();

  return historyDates.map((date, index) => {
    const score = scoreHistory[index] ?? activityScore;
    const currentPrice = reversedPrices[index] ?? symbol.price;
    const previousPrice =
      reversedPrices[index + 1] ?? symbol.priceHistory.at(-2) ?? symbol.price;
    const changePct = round(((currentPrice - previousPrice) / previousPrice) * 100);
    const volume = Math.max(
      200000,
      Math.round(symbol.volume * (0.64 + (score / 100) * 0.46 - index * 0.03)),
    );
    const relativeVolume = round(
      Math.max(1, symbol.relativeVolume * (0.74 + score / 180 - index * 0.04)),
    );

    return {
      scannedAt: date,
      activityScore: score,
      dailyChangePct: changePct,
      volume,
      relativeVolume,
      note: buildScanNote(flags, symbol.summarySeed),
    };
  });
}

function buildAiSummary(
  symbol: BaseSymbolData,
  activityScore: number,
  flags: ActivityFlag[],
) {
  const fragments = [
    `${symbol.symbol} は通常比 ${symbol.relativeVolume.toFixed(1)}x の出来高が入り、`,
    `本日は ${Math.abs(symbol.dailyChangePct).toFixed(1)}% ${symbol.dailyChangePct >= 0 ? "上昇" : "下落"} しています。`,
    `短期モメンタムは ${Math.round(symbol.momentumPersistencePct)} / 100 を維持しています。`,
    `スキャン上では ${symbol.summarySeed}。`,
  ];

  if (flags.includes("NEWS_SURGE")) {
    fragments.push(
      "ニュース連動の実装は今後の実データ接続に備えており、このデモではニュース加速をプレースホルダー値で扱っています。",
    );
  }

  fragments.push(
    `これらを合成した結果、アクティビティスコアは ${activityScore.toFixed(1)} です。`,
  );

  return fragments.join(" ");
}

export function enrichSymbol(symbol: BaseSymbolData, watchlistSymbols: string[] = []) {
  const scoreResult = calculateActivityScore(buildScoreInputs(symbol));
  const isWatchlisted = watchlistSymbols.includes(symbol.symbol);
  const flags = deriveFlags(symbol, isWatchlisted);

  return {
    ...symbol,
    activityScore: scoreResult.activityScore,
    scoreBreakdown: scoreResult.breakdown,
    flags,
    flagsCount: flags.length,
    aiSummary: buildAiSummary(symbol, scoreResult.activityScore, flags),
    priceSummary: buildPriceSummary(symbol),
    previousDay: buildPreviousDay(symbol),
    recentScans: buildRecentScans(symbol, scoreResult.activityScore, flags),
  } satisfies EnrichedSymbol;
}

export function getEnrichedSymbolsFromUniverse(
  universe: BaseSymbolData[],
  watchlistSymbols: string[] = [],
) {
  return universe
    .map((symbol) => enrichSymbol(symbol, watchlistSymbols))
    .sort((left, right) => right.activityScore - left.activityScore);
}

export function getEnrichedSymbols(watchlistSymbols: string[] = []) {
  return getEnrichedSymbolsFromUniverse(baseSymbolUniverse, watchlistSymbols);
}

export function getBaseSymbolFromUniverse(
  universe: BaseSymbolData[],
  symbol: string,
) {
  return universe.find(
    (entry) => entry.symbol.toLowerCase() === symbol.toLowerCase(),
  );
}

export function getBaseSymbol(symbol: string) {
  return getBaseSymbolFromUniverse(baseSymbolUniverse, symbol);
}

export function getEnrichedSymbolFromUniverse(
  universe: BaseSymbolData[],
  symbol: string,
  watchlistSymbols: string[] = [],
) {
  const match = getBaseSymbolFromUniverse(universe, symbol);

  return match ? enrichSymbol(match, watchlistSymbols) : null;
}

export function getEnrichedSymbol(symbol: string, watchlistSymbols: string[] = []) {
  return getEnrichedSymbolFromUniverse(baseSymbolUniverse, symbol, watchlistSymbols);
}

export function matchesMarketCapRange(
  marketCapMillions: number,
  range: MarketCapRangeKey,
) {
  switch (range) {
    case "nano":
      return marketCapMillions < 50;
    case "micro":
      return marketCapMillions >= 50 && marketCapMillions < 300;
    case "small":
      return marketCapMillions >= 300 && marketCapMillions < 2000;
    case "emerging":
      return marketCapMillions >= 2000 && marketCapMillions < 10000;
    case "all":
    default:
      return true;
  }
}

export function applyDashboardFilters(
  symbols: EnrichedSymbol[],
  filters: DashboardFilters,
) {
  const query = filters.query.trim().toLowerCase();
  const maxPrice = filters.priceUnder ? Number(filters.priceUnder) : null;
  const minVolume = filters.minVolume ? Number(filters.minVolume) : null;
  const minScore = filters.activityScoreThreshold
    ? Number(filters.activityScoreThreshold)
    : null;

  return symbols.filter((symbol) => {
    if (
      query &&
      !`${symbol.symbol} ${symbol.companyName}`.toLowerCase().includes(query)
    ) {
      return false;
    }

    if (maxPrice !== null && symbol.price > maxPrice) {
      return false;
    }

    if (minVolume !== null && symbol.volume < minVolume) {
      return false;
    }

    if (filters.sector !== "すべて" && symbol.sector !== filters.sector) {
      return false;
    }

    if (!matchesMarketCapRange(symbol.marketCapMillions, filters.marketCapRange)) {
      return false;
    }

    if (minScore !== null && symbol.activityScore < minScore) {
      return false;
    }

    return true;
  });
}

export function sortSymbols(
  symbols: EnrichedSymbol[],
  field: SortableField,
  direction: SortDirection,
) {
  const sorted = [...symbols].sort((left, right) => {
    const leftValue = left[field];
    const rightValue = right[field];

    if (typeof leftValue === "string" && typeof rightValue === "string") {
      return leftValue.localeCompare(rightValue);
    }

    return Number(leftValue) - Number(rightValue);
  });

  return direction === "asc" ? sorted : sorted.reverse();
}

export function getTopMoverHighlightsFromUniverse(
  universe: BaseSymbolData[],
  watchlistSymbols: string[] = [],
) {
  const symbols = getEnrichedSymbolsFromUniverse(universe, watchlistSymbols);

  return {
    highestActivity: symbols[0],
    highestRelativeVolume: [...symbols].sort(
      (left, right) => right.relativeVolume - left.relativeVolume,
    )[0],
    biggestDailyMove: [...symbols].sort(
      (left, right) =>
        Math.abs(right.dailyChangePct) - Math.abs(left.dailyChangePct),
    )[0],
    mostWatchlisted: [...symbols].sort(
      (left, right) => right.watchlistCount - left.watchlistCount,
    )[0],
  };
}

export function getTopMoverHighlights(watchlistSymbols: string[] = []) {
  return getTopMoverHighlightsFromUniverse(baseSymbolUniverse, watchlistSymbols);
}
