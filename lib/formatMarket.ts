export function formatLargeUsd(
  value: number | null,
  locale: string,
): string | null {
  if (value === null || !Number.isFinite(value)) return null;

  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toLocaleString(locale, {
      maximumFractionDigits: 2,
    })}T`;
  }
  if (abs >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toLocaleString(locale, {
      maximumFractionDigits: 2,
    })}B`;
  }
  if (abs >= 1_000_000) {
    return `$${(value / 1_000_000).toLocaleString(locale, {
      maximumFractionDigits: 2,
    })}M`;
  }
  return `$${value.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
}

export function formatPrice(
  value: number | null,
  locale: string,
  decimals = 2,
): string | null {
  if (value === null || !Number.isFinite(value)) return null;
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(
  value: number | null,
  locale: string,
): string | null {
  if (value === null || !Number.isFinite(value)) return null;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}
