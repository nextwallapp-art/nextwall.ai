export type SelectedAssets = {
  crypto?: string[];
  stocks?: string[];
  etfs?: string[];
  metals?: string[];
};

export const STOCK_BY_NAME: Record<string, { symbol: string; name: string }> = {
  Apple: { symbol: "AAPL", name: "Apple" },
  Nvidia: { symbol: "NVDA", name: "Nvidia" },
  Tesla: { symbol: "TSLA", name: "Tesla" },
  Amazon: { symbol: "AMZN", name: "Amazon" },
  Microsoft: { symbol: "MSFT", name: "Microsoft" },
  Google: { symbol: "GOOGL", name: "Google" },
  "S&P 500 (SPY)": { symbol: "SPY", name: "S&P 500" },
  "Nasdaq (QQQ)": { symbol: "QQQ", name: "Nasdaq" },
  "MSCI World": { symbol: "URTH", name: "MSCI World" },
  "S&P Europe 350": { symbol: "IEV", name: "S&P Europe 350" },
  Oro: { symbol: "GLD", name: "Oro" },
  Plata: { symbol: "SLV", name: "Plata" },
  Platino: { symbol: "PPLT", name: "Platino" },
};

export const CRYPTO_BY_NAME: Record<
  string,
  { symbol: string; name: string }
> = {
  Bitcoin: { symbol: "BTC", name: "Bitcoin" },
  Ethereum: { symbol: "ETH", name: "Ethereum" },
  Solana: { symbol: "SOL", name: "Solana" },
  BNB: { symbol: "BNB", name: "BNB" },
  XRP: { symbol: "XRP", name: "XRP" },
};

export const GENERAL_MARKET_SYMBOLS = ["SPY", "QQQ"];
export const GENERAL_ETF_SYMBOLS = ["SPY", "QQQ"];
export const GENERAL_INDEX_SYMBOLS = ["SPY", "QQQ", "URTH"];
export const INDEX_FUND_SYMBOLS = ["SPY", "QQQ", "URTH", "IEV"];
export const GENERAL_METAL_SYMBOLS = ["GLD", "SLV"];
export const GENERAL_CRYPTO_SYMBOLS = ["BTC"];
export const MACRO_IDS = [
  "FEDFUNDS",
  "CPIAUCSL",
  "UNRATE",
  "DGS10",
  "DCOILWTICO",
];

export function namesToSymbols(names: string[]): string[] {
  return names
    .map((n) => STOCK_BY_NAME[n]?.symbol ?? CRYPTO_BY_NAME[n]?.symbol)
    .filter((s): s is string => !!s);
}

export function cryptoNamesToSymbols(names: string[]): string[] {
  return names
    .map((n) => CRYPTO_BY_NAME[n]?.symbol)
    .filter((s): s is string => !!s);
}
