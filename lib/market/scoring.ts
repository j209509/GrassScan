import type {
  ActivityScoreResult,
  ScoreBreakdown,
  ScoreComponentKey,
  ScoreInputs,
} from "@/lib/market/types";

const SCORE_WEIGHTS: Record<ScoreComponentKey, number> = {
  relativeVolumeSpike: 0.35,
  intradayPriceMoveMagnitude: 0.25,
  volatilityExpansion: 0.15,
  shortTermMomentumPersistence: 0.15,
  newsCountIncrease: 0.1,
};

const SCORE_LABELS: Record<ScoreComponentKey, string> = {
  relativeVolumeSpike: "相対出来高急増",
  intradayPriceMoveMagnitude: "日中値動き",
  volatilityExpansion: "ボラティリティ拡大",
  shortTermMomentumPersistence: "短期モメンタム持続",
  newsCountIncrease: "ニュース件数増加",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

export function normalizeRelativeVolume(relativeVolume: number) {
  return round(clamp(((relativeVolume - 1) / 5) * 100, 0, 100));
}

export function normalizePriceMoveMagnitude(intradayPriceMovePct: number) {
  return round(clamp((Math.abs(intradayPriceMovePct) / 18) * 100, 0, 100));
}

export function normalizeVolatilityExpansion(volatilityExpansionPct: number) {
  return round(clamp((volatilityExpansionPct / 70) * 100, 0, 100));
}

export function normalizeMomentumPersistence(momentumPersistencePct: number) {
  return round(clamp(momentumPersistencePct, 0, 100));
}

export function normalizeNewsCountIncrease(newsCountIncrease: number) {
  return round(clamp((newsCountIncrease / 5) * 100, 0, 100));
}

export function calculateActivityScore(inputs: ScoreInputs): ActivityScoreResult {
  const normalized = {
    relativeVolumeSpike: normalizeRelativeVolume(inputs.relativeVolume),
    intradayPriceMoveMagnitude: normalizePriceMoveMagnitude(
      inputs.intradayPriceMovePct,
    ),
    volatilityExpansion: normalizeVolatilityExpansion(
      inputs.volatilityExpansionPct,
    ),
    shortTermMomentumPersistence: normalizeMomentumPersistence(
      inputs.momentumPersistencePct,
    ),
    newsCountIncrease: normalizeNewsCountIncrease(inputs.newsCountIncrease),
  } as const;

  const breakdown = Object.entries(normalized).reduce((accumulator, entry) => {
    const [key, value] = entry as [ScoreComponentKey, number];
    const rawInputs: Record<ScoreComponentKey, number> = {
      relativeVolumeSpike: inputs.relativeVolume,
      intradayPriceMoveMagnitude: inputs.intradayPriceMovePct,
      volatilityExpansion: inputs.volatilityExpansionPct,
      shortTermMomentumPersistence: inputs.momentumPersistencePct,
      newsCountIncrease: inputs.newsCountIncrease,
    };

    accumulator[key] = {
      label: SCORE_LABELS[key],
      weight: SCORE_WEIGHTS[key],
      raw: round(rawInputs[key]),
      normalized: value,
      contribution: round(value * SCORE_WEIGHTS[key]),
    };

    return accumulator;
  }, {} as ScoreBreakdown);

  const activityScore = round(
    Object.values(breakdown).reduce(
      (sum, component) => sum + component.contribution,
      0,
    ),
  );

  return {
    activityScore,
    breakdown,
  };
}

export { SCORE_WEIGHTS };
