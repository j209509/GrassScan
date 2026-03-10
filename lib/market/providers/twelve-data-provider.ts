import { calculateActivityScore } from "@/lib/market/scoring";
import {
  LIVE_UNIVERSE_SCAN_COUNT,
  getDefaultLiveModeUniverse,
  getLiveFallbackSymbol,
} from "@/lib/market/live-universe";
import {
  enqueueMarketRequest,
  logLiveFetch,
  withServerCache,
} from "@/lib/market/server-cache";
import type { BaseSymbolData, ScanLog } from "@/lib/market/types";

const TWELVE_DATA_BASE_URL = "https://api.twelvedata.com";

const CACHE_TTL = {
  overviewSnapshotMs: 3 * 60 * 1000,
  detailSnapshotMs: 5 * 60 * 1000,
  quoteMs: 3 * 60 * 1000,
  seriesMs: 15 * 60 * 1000,
} as const;

const PARTIAL_DEMO_NOTICE = "一部データをデモ表示しています。";
export const RATE_LIMIT_NOTICE = "API制限のため、一部データをデモ表示しています。";
const RATE_LIMIT_COOLDOWN_MS = 5 * 60 * 1000;

let rateLimitCooldownUntil = 0;

type TwelveDataErrorResponse = {
  code?: number;
  message?: string;
  status?: string;
};

type TwelveDataQuoteResponse = TwelveDataErrorResponse & {
  symbol?: string;
  name?: string;
  exchange?: string;
  open?: string;
  high?: string;
  low?: string;
  close?: string;
  previous_close?: string;
  volume?: string;
  average_volume?: string;
  percent_change?: string;
  market_cap?: string;
};

type TwelveDataTimeSeriesResponse = TwelveDataErrorResponse & {
  values?: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }>;
};

type HistoricalBar = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type RequestErrorKind = "rate_limit" | "auth" | "request";

export type TwelveDataSnapshotResult = {
  symbols: BaseSymbolData[];
  scanLogs: ScanLog[];
  usingFallback: boolean;
  notice?: string;
  message: string;
  asOf: string;
};

class TwelveDataRequestError extends Error {
  constructor(
    message: string,
    readonly kind: RequestErrorKind = "request",
  ) {
    super(message);
    this.name = "TwelveDataRequestError";
  }
}

function round(value: number, digits = 2) {
  const precision = 10 ** digits;
  return Math.round(value * precision) / precision;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toNumber(value: string | number | undefined, fallback: number) {
  const parsed =
    typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function cloneSymbol(symbol: BaseSymbolData): BaseSymbolData {
  return {
    ...symbol,
    priceHistory: [...symbol.priceHistory],
    scoreHistory: [...symbol.scoreHistory],
    priceSummaryOverride: symbol.priceSummaryOverride
      ? { ...symbol.priceSummaryOverride }
      : undefined,
  };
}

function getErrorMessage(payload: TwelveDataErrorResponse, fallback: string) {
  if (payload.status === "error" || payload.code || payload.message) {
    return payload.message ?? fallback;
  }

  return "";
}

function classifyErrorKind(status: number, message: string): RequestErrorKind {
  const normalized = message.toLowerCase();

  if (
    status === 429 ||
    normalized.includes("rate limit") ||
    normalized.includes("minute") ||
    normalized.includes("credits") ||
    normalized.includes("frequency")
  ) {
    return "rate_limit";
  }

  if (
    status === 401 ||
    status === 403 ||
    normalized.includes("api key") ||
    normalized.includes("unauthorized") ||
    normalized.includes("forbidden")
  ) {
    return "auth";
  }

  return "request";
}

function activateRateLimitCooldown() {
  rateLimitCooldownUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
}

function getRateLimitCooldownRemainingMs() {
  return Math.max(0, rateLimitCooldownUntil - Date.now());
}

function createRateLimitError() {
  return new TwelveDataRequestError(
    "Twelve Data の API 制限に達しました。",
    "rate_limit",
  );
}

export function isTwelveDataRateLimitError(error: unknown) {
  if (error instanceof TwelveDataRequestError) {
    return error.kind === "rate_limit";
  }

  if (error instanceof Error) {
    const normalized = error.message.toLowerCase();

    return (
      normalized.includes("rate limit") ||
      normalized.includes("minute") ||
      normalized.includes("credits") ||
      normalized.includes("api制限")
    );
  }

  return false;
}

function isAuthError(error: unknown) {
  return error instanceof TwelveDataRequestError && error.kind === "auth";
}

async function fetchTwelveDataJson<T extends TwelveDataErrorResponse>(
  apiKey: string,
  endpoint: string,
  params: Record<string, string>,
) {
  const cooldownRemainingMs = getRateLimitCooldownRemainingMs();

  if (cooldownRemainingMs > 0) {
    throw createRateLimitError();
  }

  const url = new URL(endpoint, TWELVE_DATA_BASE_URL);

  Object.entries({
    ...params,
    apikey: apiKey,
  }).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const label = `${endpoint}?${url.searchParams.toString()}`;

  return enqueueMarketRequest(label, async () => {
    logLiveFetch(label);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const payload = (await response.json()) as T;
    const payloadError = getErrorMessage(
      payload,
      "Twelve Data の応答を解釈できませんでした。",
    );

    if (!response.ok || payloadError) {
      const message =
        payloadError || `Twelve Data の取得に失敗しました (${response.status})。`;
      const kind = classifyErrorKind(response.status, message);

      if (kind === "rate_limit") {
        activateRateLimitCooldown();
      }

      throw new TwelveDataRequestError(message, kind);
    }

    return payload;
  });
}

function normalizeExchange(
  exchange: string | undefined,
  fallback: BaseSymbolData["exchange"],
): BaseSymbolData["exchange"] {
  const normalized = exchange?.toUpperCase() ?? "";

  if (normalized.includes("NASDAQ")) {
    return "NASDAQ";
  }

  if (normalized.includes("NYSE")) {
    return normalized.includes("AMERICAN") ? "AMEX" : "NYSE";
  }

  if (normalized.includes("AMEX") || normalized.includes("AMERICAN")) {
    return "AMEX";
  }

  return fallback;
}

function buildMomentumPersistence(priceHistory: number[]) {
  const upDays = priceHistory
    .slice(1)
    .filter((close, index) => close >= priceHistory[index]).length;

  return clamp(
    35 +
      (upDays / Math.max(priceHistory.length - 1, 1)) * 35 +
      clamp(
        (((priceHistory.at(-1) ?? 0) - (priceHistory[0] ?? 0)) /
          Math.max(priceHistory[0] ?? 0.01, 0.01)) *
          160,
        -10,
        30,
      ),
    0,
    100,
  );
}

function buildScoreHistory(
  bars: HistoricalBar[],
  fallback: BaseSymbolData,
  newsCountIncrease: number,
) {
  if (bars.length < 2) {
    return [...fallback.scoreHistory];
  }

  return bars.map((bar, index) => {
    const previousBar = bars[Math.max(index - 1, 0)];
    const baseClose = index === 0 ? previousBar.close : bars[index - 1].close;
    const dailyChangePct =
      baseClose > 0 ? round(((bar.close - baseClose) / baseClose) * 100, 1) : 0;
    const currentRangePct =
      bar.close > 0 ? ((bar.high - bar.low) / bar.close) * 100 : 0;
    const priorRanges = bars
      .slice(Math.max(index - 3, 0), index)
      .map((item) =>
        item.close > 0 ? ((item.high - item.low) / item.close) * 100 : 0,
      );
    const priorVolumes = bars
      .slice(Math.max(index - 3, 0), index)
      .map((item) => item.volume)
      .filter((value) => value > 0);
    const averageRange = average(priorRanges) || currentRangePct || 1;
    const averageVolume =
      average(priorVolumes) ||
      fallback.volume / Math.max(fallback.relativeVolume, 1);
    const relativeVolume =
      averageVolume > 0 ? bar.volume / averageVolume : fallback.relativeVolume;
    const positiveDays = bars.slice(0, index + 1).reduce((count, item, itemIndex) => {
      if (itemIndex === 0) {
        return count;
      }

      return item.close >= bars[itemIndex - 1].close ? count + 1 : count;
    }, 0);
    const momentumPersistencePct = clamp(
      35 +
        (positiveDays / Math.max(index, 1)) * 35 +
        clamp(
          ((bar.close - bars[0].close) / Math.max(bars[0].close, 0.01)) * 180,
          -10,
          30,
        ),
      0,
      100,
    );
    const volatilityExpansionPct = clamp(
      (currentRangePct / averageRange) * 28 + Math.abs(dailyChangePct) * 1.4,
      0,
      100,
    );

    return calculateActivityScore({
      relativeVolume,
      intradayPriceMovePct: dailyChangePct,
      volatilityExpansionPct,
      momentumPersistencePct,
      newsCountIncrease:
        index === bars.length - 1
          ? newsCountIncrease
          : Math.max(0, newsCountIncrease - 1),
    }).activityScore;
  });
}

function buildFallbackBars(
  fallback: BaseSymbolData,
  quote?: TwelveDataQuoteResponse,
) {
  const priceHistory = [...fallback.priceHistory];
  const fallbackPreviousClose = priceHistory.at(-2) ?? fallback.price;
  const previousClose = toNumber(
    quote?.previous_close,
    round(fallbackPreviousClose),
  );
  const price = toNumber(quote?.close, fallback.price);
  const open = toNumber(quote?.open, previousClose);
  const high = toNumber(quote?.high, Math.max(price, open));
  const low = toNumber(quote?.low, Math.min(price, open));
  const latestVolume = Math.max(
    0,
    Math.round(toNumber(quote?.volume, fallback.volume)),
  );
  const baselineVolume = Math.max(
    200000,
    Math.round(fallback.volume / Math.max(fallback.relativeVolume, 1.1)),
  );

  return priceHistory.map((close, index) => {
    const normalizedClose =
      index === priceHistory.length - 1
        ? price
        : index === priceHistory.length - 2
          ? previousClose
          : close;
    const previous =
      index === 0
        ? normalizedClose
        : index === priceHistory.length - 1
          ? previousClose
          : priceHistory[index - 1];

    if (index === priceHistory.length - 1) {
      return {
        open,
        high,
        low,
        close: price,
        volume: latestVolume,
      };
    }

    return {
      open: round(previous),
      high: round(Math.max(previous, normalizedClose) * 1.03),
      low: round(Math.min(previous, normalizedClose) * 0.97),
      close: round(normalizedClose),
      volume: Math.round(baselineVolume * (0.78 + index * 0.05)),
    };
  });
}

function buildHistoricalBars(
  values: TwelveDataTimeSeriesResponse["values"],
  quote: TwelveDataQuoteResponse,
  fallback: BaseSymbolData,
) {
  if (!values || values.length === 0) {
    return buildFallbackBars(fallback, quote);
  }

  const chronologicalBars = [...values]
    .reverse()
    .slice(-7)
    .map((value) => ({
      open: toNumber(value.open, fallback.price),
      high: toNumber(value.high, fallback.price),
      low: toNumber(value.low, fallback.price),
      close: toNumber(value.close, fallback.price),
      volume: Math.max(0, Math.round(toNumber(value.volume, fallback.volume))),
    }));

  const lastIndex = chronologicalBars.length - 1;

  if (lastIndex >= 0) {
    chronologicalBars[lastIndex] = {
      open: toNumber(quote.open, chronologicalBars[lastIndex].open),
      high: toNumber(quote.high, chronologicalBars[lastIndex].high),
      low: toNumber(quote.low, chronologicalBars[lastIndex].low),
      close: toNumber(quote.close, chronologicalBars[lastIndex].close),
      volume: Math.max(
        0,
        Math.round(toNumber(quote.volume, chronologicalBars[lastIndex].volume)),
      ),
    };
  }

  return chronologicalBars;
}

function buildOverviewBars(
  fallback: BaseSymbolData,
  quote: TwelveDataQuoteResponse,
) {
  return buildFallbackBars(fallback, quote);
}

function buildSymbolFromBars(
  fallback: BaseSymbolData,
  quote: TwelveDataQuoteResponse,
  bars: HistoricalBar[],
) {
  const latestBar = bars.at(-1) ?? {
    open: fallback.price,
    high: fallback.price,
    low: fallback.price,
    close: fallback.price,
    volume: fallback.volume,
  };
  const previousBar = bars.at(-2) ?? latestBar;
  const price = toNumber(quote.close, latestBar.close);
  const previousClose = toNumber(
    quote.previous_close,
    previousBar.close || fallback.price,
  );
  const open = toNumber(quote.open, latestBar.open);
  const high = toNumber(quote.high, latestBar.high);
  const low = toNumber(quote.low, latestBar.low);
  const volume = Math.max(0, Math.round(toNumber(quote.volume, latestBar.volume)));
  const averageVolume = toNumber(
    quote.average_volume,
    average(
      bars.slice(0, -1).map((bar) => bar.volume).filter((value) => value > 0),
    ) || fallback.volume / Math.max(fallback.relativeVolume, 1),
  );
  const relativeVolume =
    averageVolume > 0
      ? round(Math.max(0.4, volume / averageVolume), 2)
      : fallback.relativeVolume;
  const dailyChangePct =
    previousClose > 0
      ? round(((price - previousClose) / previousClose) * 100, 1)
      : fallback.dailyChangePct;
  const gapMovePct =
    previousClose > 0
      ? round(((open - previousClose) / previousClose) * 100, 1)
      : fallback.gapMovePct;
  const rangePct = price > 0 ? ((high - low) / price) * 100 : 0;
  const recentRanges = bars
    .slice(0, -1)
    .map((bar) => (bar.close > 0 ? ((bar.high - bar.low) / bar.close) * 100 : 0));
  const volatilityExpansionPct = clamp(
    (rangePct / (average(recentRanges) || rangePct || 1)) * 28 +
      Math.abs(dailyChangePct) * 1.3,
    0,
    100,
  );
  const priceHistory = bars.map((bar) => round(bar.close));
  const momentumPersistencePct = buildMomentumPersistence(priceHistory);
  const scoreHistory = buildScoreHistory(bars, fallback, fallback.newsCountIncrease);
  const marketCap = toNumber(
    quote.market_cap,
    fallback.marketCapMillions * 1_000_000,
  );
  const marketCapMillions =
    marketCap > 10_000 ? round(marketCap / 1_000_000, 0) : fallback.marketCapMillions;

  return {
    ...fallback,
    companyName: quote.name?.trim() || fallback.companyName,
    exchange: normalizeExchange(quote.exchange, fallback.exchange),
    price,
    dailyChangePct,
    volume,
    relativeVolume,
    marketCapMillions,
    volatilityExpansionPct: round(volatilityExpansionPct, 1),
    momentumPersistencePct: round(momentumPersistencePct, 1),
    gapMovePct,
    priceHistory,
    scoreHistory,
    summarySeed:
      fallback.summarySeed ||
      `${fallback.symbol} は ${Math.abs(dailyChangePct).toFixed(1)}% の値動きと ${relativeVolume.toFixed(1)}x の出来高を示しています`,
    priceSummaryOverride: {
      open,
      high,
      low,
      previousClose,
    },
  } satisfies BaseSymbolData;
}

async function fetchCachedQuote(apiKey: string, symbol: string) {
  return withServerCache(`twelve:quote:${symbol}`, CACHE_TTL.quoteMs, () =>
    fetchTwelveDataJson<TwelveDataQuoteResponse>(apiKey, "/quote", { symbol }),
  );
}

async function fetchCachedTimeSeries(apiKey: string, symbol: string) {
  return withServerCache(
    `twelve:series:${symbol}`,
    CACHE_TTL.seriesMs,
    () =>
      fetchTwelveDataJson<TwelveDataTimeSeriesResponse>(apiKey, "/time_series", {
        symbol,
        interval: "1day",
        outputsize: "7",
      }),
  );
}

function buildLiveScanLogs(
  processedSymbols: number,
  failedFetches: number,
  note: string,
  asOf: string,
): ScanLog[] {
  const completedAt = asOf;
  const startedAt = new Date(new Date(asOf).getTime() - 1800).toISOString();

  return [
    {
      id: `live-scan-${completedAt}`,
      source: "Twelve Data",
      status: failedFetches === 0 ? "success" : "warning",
      startedAt,
      completedAt,
      processedSymbols,
      failedFetches,
      note,
    },
  ];
}

async function buildOverviewSnapshot(apiKey: string): Promise<TwelveDataSnapshotResult> {
  const liveUniverse = getDefaultLiveModeUniverse();
  const symbols: BaseSymbolData[] = [];
  let failedFetches = 0;
  let rateLimited = false;
  let liveSuccessCount = 0;
  let skippedAfterRateLimit = 0;

  for (const fallback of liveUniverse) {
    if (rateLimited) {
      skippedAfterRateLimit += 1;
      symbols.push(cloneSymbol(fallback));
      continue;
    }

    try {
      const quote = await fetchCachedQuote(apiKey, fallback.symbol);
      symbols.push(
        buildSymbolFromBars(fallback, quote, buildOverviewBars(fallback, quote)),
      );
      liveSuccessCount += 1;
    } catch (error) {
      if (isAuthError(error)) {
        throw error;
      }

      failedFetches += 1;
      symbols.push(cloneSymbol(fallback));

      if (isTwelveDataRateLimitError(error)) {
        rateLimited = true;
      }
    }
  }

  if (liveSuccessCount === 0) {
    if (rateLimited) {
      throw createRateLimitError();
    }

    throw new Error("ライブデータを取得できませんでした。");
  }

  const asOf = new Date().toISOString();
  const usingFallback = failedFetches > 0 || skippedAfterRateLimit > 0;
  const notice = rateLimited
    ? RATE_LIMIT_NOTICE
    : usingFallback
      ? PARTIAL_DEMO_NOTICE
      : undefined;
  const message = rateLimited
    ? "厳選した小型株の走査を継続しつつ、表示を安定させています。"
    : usingFallback
      ? "一部の取得に失敗したため、表示を継続できるようデモ補完しています。"
      : `厳選した小型株 ${LIVE_UNIVERSE_SCAN_COUNT} 銘柄の上位シグナルを反映しています。`;
  const note = rateLimited
    ? `レート制限後は残り ${skippedAfterRateLimit} 銘柄をデモ補完し、無料プラン向けに再試行を抑制しました。`
    : usingFallback
      ? "一部銘柄をデモ補完して表示を継続しました。"
      : `厳選小型株 ${LIVE_UNIVERSE_SCAN_COUNT} 銘柄の quote をキャッシュ付きで更新しました。`;

  return {
    symbols,
    scanLogs: buildLiveScanLogs(liveUniverse.length, failedFetches, note, asOf),
    usingFallback,
    notice,
    message,
    asOf,
  };
}

async function buildSymbolSnapshot(
  apiKey: string,
  symbol: string,
): Promise<TwelveDataSnapshotResult> {
  const fallback = getLiveFallbackSymbol(symbol);

  if (!fallback) {
    throw new Error(`銘柄 ${symbol} のベースデータが見つかりません。`);
  }

  const quote = await fetchCachedQuote(apiKey, fallback.symbol);
  let failedFetches = 0;
  let notice: string | undefined;
  let message = "銘柄詳細のライブデータを反映しています。";
  let bars = buildHistoricalBars(undefined, quote, fallback);

  try {
    const timeSeries = await fetchCachedTimeSeries(apiKey, fallback.symbol);
    bars = buildHistoricalBars(timeSeries.values, quote, fallback);
  } catch (error) {
    failedFetches = 1;
    notice = isTwelveDataRateLimitError(error)
      ? RATE_LIMIT_NOTICE
      : PARTIAL_DEMO_NOTICE;
    message = isTwelveDataRateLimitError(error)
      ? "詳細履歴はデモ補完で表示しています。"
      : "詳細履歴の一部をデモ補完で表示しています。";
  }

  const asOf = new Date().toISOString();
  const note =
    failedFetches === 0
      ? "選択中銘柄の quote と日足履歴をキャッシュ付きで取得しました。"
      : "選択中銘柄の履歴はデモ補完で表示しています。";

  return {
    symbols: [buildSymbolFromBars(fallback, quote, bars)],
    scanLogs: buildLiveScanLogs(1, failedFetches, note, asOf),
    usingFallback: failedFetches > 0,
    notice,
    message,
    asOf,
  };
}

export async function getTwelveDataOverviewSnapshot(apiKey: string) {
  if (!apiKey) {
    throw new Error("MARKET_DATA_API_KEY が設定されていません。");
  }

  return withServerCache("twelve:overview", CACHE_TTL.overviewSnapshotMs, () =>
    buildOverviewSnapshot(apiKey),
  );
}

export async function getTwelveDataSymbolSnapshot(
  apiKey: string,
  symbol: string,
) {
  if (!apiKey) {
    throw new Error("MARKET_DATA_API_KEY が設定されていません。");
  }

  return withServerCache(
    `twelve:detail:${symbol.toUpperCase()}`,
    CACHE_TTL.detailSnapshotMs,
    () => buildSymbolSnapshot(apiKey, symbol.toUpperCase()),
  );
}
