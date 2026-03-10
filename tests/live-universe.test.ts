import assert from "node:assert/strict";
import test from "node:test";
import {
  LIVE_DASHBOARD_RESULT_LIMIT,
  LIVE_UNIVERSE_SCAN_COUNT,
  curatedLiveUniverse,
  getCuratedLiveUniverseSymbols,
} from "@/lib/market/live-universe";

test("live universe scans more symbols than the dashboard shows by default", () => {
  assert.ok(LIVE_UNIVERSE_SCAN_COUNT > LIVE_DASHBOARD_RESULT_LIMIT);
});

test("live universe symbol list stays unique and matches the exported count", () => {
  const symbols = getCuratedLiveUniverseSymbols();
  const uniqueSymbols = new Set(symbols);

  assert.equal(symbols.length, curatedLiveUniverse.length);
  assert.equal(symbols.length, LIVE_UNIVERSE_SCAN_COUNT);
  assert.equal(uniqueSymbols.size, symbols.length);
});
