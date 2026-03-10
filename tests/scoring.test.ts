import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateActivityScore,
  normalizeNewsCountIncrease,
  normalizePriceMoveMagnitude,
  normalizeRelativeVolume,
  normalizeVolatilityExpansion,
} from "@/lib/market/scoring";

test("calculateActivityScore applies the weighted scoring formula", () => {
  const result = calculateActivityScore({
    relativeVolume: 4,
    intradayPriceMovePct: 9,
    volatilityExpansionPct: 35,
    momentumPersistencePct: 60,
    newsCountIncrease: 2,
  });

  assert.equal(result.activityScore, 54);
  assert.equal(result.breakdown.relativeVolumeSpike.contribution, 21);
  assert.equal(result.breakdown.intradayPriceMoveMagnitude.contribution, 12.5);
  assert.equal(result.breakdown.newsCountIncrease.contribution, 4);
});

test("score normalization clamps oversized demo inputs to 100", () => {
  const result = calculateActivityScore({
    relativeVolume: 12,
    intradayPriceMovePct: 40,
    volatilityExpansionPct: 120,
    momentumPersistencePct: 140,
    newsCountIncrease: 12,
  });

  assert.equal(result.activityScore, 100);
});

test("news placeholders stay in the breakdown even when there is no news delta", () => {
  assert.equal(normalizeRelativeVolume(1), 0);
  assert.equal(normalizePriceMoveMagnitude(0), 0);
  assert.equal(normalizeVolatilityExpansion(0), 0);
  assert.equal(normalizeNewsCountIncrease(0), 0);

  const result = calculateActivityScore({
    relativeVolume: 2.5,
    intradayPriceMovePct: 4.2,
    volatilityExpansionPct: 21,
    momentumPersistencePct: 48,
    newsCountIncrease: 0,
  });

  assert.equal(result.breakdown.newsCountIncrease.raw, 0);
  assert.equal(result.breakdown.newsCountIncrease.contribution, 0);
  assert.ok("newsCountIncrease" in result.breakdown);
});
