export const FLAG_TYPES = [
  "HIGH_RELATIVE_VOLUME",
  "LARGE_PRICE_MOVE",
  "VOLATILITY_EXPANSION",
  "GAP_MOVE",
  "WATCHLIST_SYMBOL",
  "NEWS_SURGE",
] as const;

export type ActivityFlag = (typeof FLAG_TYPES)[number];

export const SECTORS = [
  "AIインフラ",
  "バイオテック",
  "クリーンテック",
  "コンシューマーテック",
  "防衛",
  "EVインフラ",
  "産業ソフトウェア",
  "量子",
  "宇宙テック",
] as const;

export type Sector = (typeof SECTORS)[number];

export const MARKET_CAP_RANGES = [
  { value: "all", label: "時価総額すべて" },
  { value: "nano", label: "ナノ（<$50M）" },
  { value: "micro", label: "マイクロ（$50M-$300M）" },
  { value: "small", label: "スモール（$300M-$2B）" },
  { value: "emerging", label: "新興（$2B-$10B）" },
] as const;

export type MarketCapRangeKey = (typeof MARKET_CAP_RANGES)[number]["value"];

export type ScoreComponentKey =
  | "relativeVolumeSpike"
  | "intradayPriceMoveMagnitude"
  | "volatilityExpansion"
  | "shortTermMomentumPersistence"
  | "newsCountIncrease";

export type ScoreInputs = {
  relativeVolume: number;
  intradayPriceMovePct: number;
  volatilityExpansionPct: number;
  momentumPersistencePct: number;
  newsCountIncrease: number;
};

export type ScoreComponentDetails = {
  label: string;
  weight: number;
  raw: number;
  normalized: number;
  contribution: number;
};

export type ScoreBreakdown = Record<ScoreComponentKey, ScoreComponentDetails>;

export type ActivityScoreResult = {
  activityScore: number;
  breakdown: ScoreBreakdown;
};

export type PriceSummary = {
  open: number;
  high: number;
  low: number;
  previousClose: number;
};

export type PreviousDaySnapshot = {
  close: number;
  volume: number;
  relativeVolume: number;
  activityScore: number;
  flagsCount: number;
};

export type ScanHistoryEntry = {
  scannedAt: string;
  activityScore: number;
  dailyChangePct: number;
  volume: number;
  relativeVolume: number;
  note: string;
};

export type BaseSymbolData = {
  symbol: string;
  companyName: string;
  sector: Sector;
  exchange: "NASDAQ" | "NYSE" | "AMEX";
  price: number;
  dailyChangePct: number;
  volume: number;
  relativeVolume: number;
  marketCapMillions: number;
  volatilityExpansionPct: number;
  momentumPersistencePct: number;
  newsCountIncrease: number;
  gapMovePct: number;
  watchlistCount: number;
  priceHistory: number[];
  scoreHistory: number[];
  summarySeed: string;
  scanCadence: string;
  priceSummaryOverride?: PriceSummary;
};

export type EnrichedSymbol = BaseSymbolData & {
  activityScore: number;
  scoreBreakdown: ScoreBreakdown;
  flags: ActivityFlag[];
  flagsCount: number;
  aiSummary: string;
  priceSummary: PriceSummary;
  previousDay: PreviousDaySnapshot;
  recentScans: ScanHistoryEntry[];
};

export type DashboardFilters = {
  query: string;
  priceUnder: string;
  minVolume: string;
  sector: Sector | "すべて";
  marketCapRange: MarketCapRangeKey;
  activityScoreThreshold: string;
};

export type SortableField =
  | "symbol"
  | "companyName"
  | "price"
  | "dailyChangePct"
  | "volume"
  | "relativeVolume"
  | "marketCapMillions"
  | "activityScore"
  | "flagsCount";

export type SortDirection = "asc" | "desc";

export type SavedFilterPreset = {
  id: "under_5" | "under_1" | "biotech" | "high_volume_only";
  label: string;
  description: string;
  values: Partial<DashboardFilters>;
};

export type DemoSession = {
  name: string;
  email: string;
  tier: "無料" | "デスク";
  createdAt: string;
};

export type ScanLog = {
  id: string;
  source: string;
  status: "success" | "warning" | "failed";
  startedAt: string;
  completedAt: string;
  processedSymbols: number;
  failedFetches: number;
  note: string;
};

export type MarketDataSource = "live" | "demo";

export type MarketDataProviderId = "demo" | "twelve-data";

export type RequestedMarketMode = "demo" | "auto";

export type MarketDataStatus = {
  source: MarketDataSource;
  provider: MarketDataProviderId;
  configuredProvider: MarketDataProviderId;
  requestedMode: RequestedMarketMode;
  label: "ライブデータ" | "デモモード";
  usingFallback: boolean;
  notice?: string;
  message: string;
  asOf: string;
};

export type MarketDataSnapshot = {
  symbols: BaseSymbolData[];
  scanLogs: ScanLog[];
  status: MarketDataStatus;
};

export type PricingTier = {
  name: string;
  price: string;
  description: string;
  cta: string;
  features: string[];
  highlighted?: boolean;
};

export type MarketingStep = {
  title: string;
  description: string;
};

export type MarketingFeature = {
  title: string;
  description: string;
};
