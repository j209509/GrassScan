import { baseSymbolUniverse, scanLogs } from "@/lib/market/demo-data";
import type { BaseSymbolData, ScanLog } from "@/lib/market/types";

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

export async function getDemoProviderSnapshot() {
  return {
    symbols: baseSymbolUniverse.map(cloneSymbol),
    scanLogs: scanLogs.map((log): ScanLog => ({ ...log })),
  };
}
