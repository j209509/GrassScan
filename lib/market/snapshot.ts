import { baseSymbolUniverse, scanLogs as demoScanLogs } from "@/lib/market/demo-data";
import type {
  BaseSymbolData,
  MarketDataProviderId,
  MarketDataSnapshot,
  RequestedMarketMode,
  ScanLog,
} from "@/lib/market/types";

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

function cloneScanLog(log: ScanLog): ScanLog {
  return { ...log };
}

type DemoSnapshotOptions = {
  requestedMode?: RequestedMarketMode;
  configuredProvider?: MarketDataProviderId;
  usingFallback?: boolean;
  notice?: string;
  message?: string;
  symbols?: BaseSymbolData[];
  scanLogs?: ScanLog[];
  asOf?: string;
};

export function createDemoMarketSnapshot(
  options: DemoSnapshotOptions = {},
): MarketDataSnapshot {
  const now = options.asOf ?? new Date().toISOString();

  return {
    symbols: (options.symbols ?? baseSymbolUniverse).map(cloneSymbol),
    scanLogs: (options.scanLogs ?? demoScanLogs).map(cloneScanLog),
    status: {
      source: "demo",
      provider: "demo",
      configuredProvider: options.configuredProvider ?? "demo",
      requestedMode: options.requestedMode ?? "demo",
      label: "デモモード",
      usingFallback: options.usingFallback ?? false,
      notice: options.notice,
      message: options.message ?? "ローカルのモックデータを表示しています。",
      asOf: now,
    },
  };
}
