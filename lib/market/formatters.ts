export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 10 ? 2 : 3,
  }).format(value);
}

export function formatPercent(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatMarketCap(marketCapMillions: number) {
  if (marketCapMillions >= 1000) {
    return `$${(marketCapMillions / 1000).toFixed(2)}B`;
  }

  return `$${marketCapMillions.toFixed(0)}M`;
}
