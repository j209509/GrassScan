import type { MarketDataProviderId, RequestedMarketMode } from "@/lib/market/types";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);

export function parseBooleanEnv(value: string | undefined, fallback: boolean) {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (TRUE_VALUES.has(normalized)) {
    return true;
  }

  if (FALSE_VALUES.has(normalized)) {
    return false;
  }

  return fallback;
}

export function getDefaultDemoMode() {
  return parseBooleanEnv(process.env.DEMO_MODE, true);
}

export function getConfiguredMarketDataProvider(): MarketDataProviderId {
  const normalized = process.env.MARKET_DATA_PROVIDER?.trim().toLowerCase();

  if (normalized === "twelve-data" || normalized === "twelvedata") {
    return "twelve-data";
  }

  return "demo";
}

export function getMarketDataApiKey() {
  return process.env.MARKET_DATA_API_KEY?.trim() ?? "";
}

export function resolveRequestedMarketMode(
  rawMode: string | null | undefined,
): RequestedMarketMode {
  if (rawMode === "demo" || rawMode === "auto") {
    return rawMode;
  }

  return getDefaultDemoMode() ? "demo" : "auto";
}
