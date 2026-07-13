export const SITE_DOMAIN = "nextwall.ai";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_BASE_URL ??
  `https://${SITE_DOMAIN}`;

export function sitePath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function displayPath(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${SITE_DOMAIN}/${normalized}`;
}
