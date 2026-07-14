export type AssetType = "stock" | "crypto" | "macro";

export type AssetDetailMetric = {
  label: string;
  value: string;
};

export type AssetDetail = {
  symbol: string;
  name: string;
  type: AssetType;
  price: number | null;
  changePercent: number | null;
  marketCap: number | null;
  revenue: number | null;
  netIncome: number | null;
  peRatio: number | null;
  industry: string | null;
  exchange: string | null;
  topProduct: string | null;
  revenueDrivers: string[];
  description: string | null;
  metrics: AssetDetailMetric[];
  microInsight: string | null;
};

export type SelectedAssetRef = {
  type: AssetType;
  symbol: string;
  name: string;
  coingeckoId?: string;
  macroId?: string;
};
