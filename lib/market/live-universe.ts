import { baseSymbolUniverse } from "@/lib/market/demo-data";
import type { BaseSymbolData } from "@/lib/market/types";

type CuratedLiveUniverseEntry = {
  symbol: string;
  segment: string;
  thesis: string;
};

export const curatedLiveUniverse: CuratedLiveUniverseEntry[] = [
  {
    symbol: "BBAI",
    segment: "AIインフラ",
    thesis: "テーマ性と出来高の立ち上がりを追いやすい低価格帯",
  },
  {
    symbol: "QBTS",
    segment: "量子",
    thesis: "投機資金が集中しやすく相対出来高が伸びやすい",
  },
  {
    symbol: "TNYA",
    segment: "バイオテック",
    thesis: "イベント感応度が高く急なスコア上昇を検知しやすい",
  },
  {
    symbol: "SABS",
    segment: "バイオテック",
    thesis: "超低位帯で値幅と出来高の異常値が出やすい",
  },
  {
    symbol: "EVGO",
    segment: "EVインフラ",
    thesis: "個人投資家の資金が再流入しやすいテーマ枠",
  },
  {
    symbol: "KULR",
    segment: "クリーンテック",
    thesis: "小型で資金流入時の変化量が大きい",
  },
  {
    symbol: "BKSY",
    segment: "宇宙テック",
    thesis: "防衛・宇宙テーマの連想でスコア差が付きやすい",
  },
] as const;

export const LIVE_UNIVERSE_SCAN_COUNT = curatedLiveUniverse.length;
export const LIVE_DASHBOARD_RESULT_LIMIT = 5;

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

function findBaseSymbol(symbol: string) {
  return baseSymbolUniverse.find((entry) => entry.symbol === symbol);
}

export function getCuratedLiveUniverseSymbols() {
  return curatedLiveUniverse.map((entry) => entry.symbol);
}

export function getDefaultLiveModeUniverse() {
  const universe = getCuratedLiveUniverseSymbols().flatMap((symbol) => {
    const match = findBaseSymbol(symbol);

    if (!match) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[GrassScan live] live universe symbol "${symbol}" was not found in demo-data.ts`,
        );
      }

      return [];
    }

    return [cloneSymbol(match)];
  });

  if (universe.length > 0) {
    return universe;
  }

  return baseSymbolUniverse.slice(0, LIVE_UNIVERSE_SCAN_COUNT).map(cloneSymbol);
}

export function getLiveFallbackSymbol(symbol: string) {
  const match = findBaseSymbol(symbol);

  return match ? cloneSymbol(match) : null;
}
