type RelativeLocale = "es" | "en";

export function formatRelativeUpdated(
  isoDate: string,
  locale: RelativeLocale,
): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60_000));

  if (minutes < 1) {
    return locale === "es" ? "hace un momento" : "just now";
  }
  if (minutes < 60) {
    return locale === "es"
      ? `hace ${minutes} minuto${minutes === 1 ? "" : "s"}`
      : `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return locale === "es"
      ? `hace ${hours} hora${hours === 1 ? "" : "s"}`
      : `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  return locale === "es"
    ? `hace ${days} día${days === 1 ? "" : "s"}`
    : `${days} day${days === 1 ? "" : "s"} ago`;
}
