import { getConfiguredMarketDataProvider, getMarketDataApiKey } from "@/lib/market/config";
import { getDemoProviderSnapshot } from "@/lib/market/providers/demo-provider";
import {
  RATE_LIMIT_NOTICE,
  getTwelveDataOverviewSnapshot,
  getTwelveDataSymbolSnapshot,
  isTwelveDataRateLimitError,
  type TwelveDataSnapshotResult,
} from "@/lib/market/providers/twelve-data-provider";
import { createDemoMarketSnapshot } from "@/lib/market/snapshot";
import type { MarketDataSnapshot, RequestedMarketMode } from "@/lib/market/types";

type ResolveSnapshotOptions = {
  requestedMode: RequestedMarketMode;
  symbol?: string;
};

function createLiveSnapshot(
  liveSnapshot: TwelveDataSnapshotResult,
  requestedMode: RequestedMarketMode,
): MarketDataSnapshot {
  return {
    symbols: liveSnapshot.symbols,
    scanLogs: liveSnapshot.scanLogs,
    status: {
      source: "live",
      provider: "twelve-data",
      configuredProvider: "twelve-data",
      requestedMode,
      label: "ライブデータ",
      usingFallback: liveSnapshot.usingFallback,
      notice: liveSnapshot.notice,
      message: liveSnapshot.message,
      asOf: liveSnapshot.asOf,
    },
  };
}

function getFallbackUiCopy(error: unknown) {
  if (isTwelveDataRateLimitError(error)) {
    return {
      notice: RATE_LIMIT_NOTICE,
      message: "現在はデモデータを表示しています。",
    };
  }

  return {
    message: "ライブデータを利用できないため、デモデータを表示しています。",
  };
}

async function createScopedDemoSnapshot(options: {
  requestedMode: RequestedMarketMode;
  configuredProvider: "demo" | "twelve-data";
  usingFallback?: boolean;
  notice?: string;
  message?: string;
  symbol?: string;
}) {
  const demoSnapshot = await getDemoProviderSnapshot();
  const scopedSymbols = options.symbol
    ? demoSnapshot.symbols.filter(
        (entry) => entry.symbol.toLowerCase() === options.symbol?.toLowerCase(),
      )
    : demoSnapshot.symbols;

  return createDemoMarketSnapshot({
    requestedMode: options.requestedMode,
    configuredProvider: options.configuredProvider,
    usingFallback: options.usingFallback,
    notice: options.notice,
    message: options.message,
    symbols: scopedSymbols.length > 0 ? scopedSymbols : demoSnapshot.symbols,
    scanLogs: demoSnapshot.scanLogs,
  });
}

async function resolveMarketSnapshot({
  requestedMode,
  symbol,
}: ResolveSnapshotOptions): Promise<MarketDataSnapshot> {
  const configuredProvider = getConfiguredMarketDataProvider();

  if (requestedMode === "demo") {
    return createScopedDemoSnapshot({
      requestedMode,
      configuredProvider,
      symbol,
    });
  }

  if (configuredProvider !== "twelve-data") {
    return createScopedDemoSnapshot({
      requestedMode,
      configuredProvider,
      usingFallback: true,
      symbol,
      message: "ライブプロバイダーが未設定のため、デモデータを表示しています。",
    });
  }

  const apiKey = getMarketDataApiKey();

  if (!apiKey) {
    return createScopedDemoSnapshot({
      requestedMode,
      configuredProvider,
      usingFallback: true,
      symbol,
      message: "MARKET_DATA_API_KEY が未設定のため、デモデータを表示しています。",
    });
  }

  try {
    const liveSnapshot = symbol
      ? await getTwelveDataSymbolSnapshot(apiKey, symbol)
      : await getTwelveDataOverviewSnapshot(apiKey);

    return createLiveSnapshot(liveSnapshot, requestedMode);
  } catch (error) {
    const fallbackCopy = getFallbackUiCopy(error);

    return createScopedDemoSnapshot({
      requestedMode,
      configuredProvider,
      usingFallback: true,
      symbol,
      notice: fallbackCopy.notice,
      message: fallbackCopy.message,
    });
  }
}

export async function resolveMarketOverviewSnapshot(
  requestedMode: RequestedMarketMode,
) {
  return resolveMarketSnapshot({ requestedMode });
}

export async function resolveMarketSymbolSnapshot(
  requestedMode: RequestedMarketMode,
  symbol: string,
) {
  return resolveMarketSnapshot({ requestedMode, symbol });
}

export async function resolveMarketDataSnapshot(
  requestedMode: RequestedMarketMode,
) {
  return resolveMarketOverviewSnapshot(requestedMode);
}
