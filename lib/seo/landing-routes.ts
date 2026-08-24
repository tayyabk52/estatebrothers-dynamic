const RESERVED_SEGMENTS = new Set([
  "admin",
  "api",
  "about",
  "buy-sell",
  "contact",
  "favicon.ico",
  "manifest.webmanifest",
  "robots.txt",
  "seo",
  "sitemap.xml",
  "updates",
]);

export function normalizeSeoLandingPath(path: string) {
  const trimmed = path.trim().toLowerCase().replace(/\/+$/, "");
  return trimmed.startsWith("/") ? trimmed || "/" : `/${trimmed}`;
}

export function isCleanSeoLandingPath(path: string) {
  const normalized = normalizeSeoLandingPath(path);
  if (!/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) return false;
  const segment = normalized.slice(1);
  return !RESERVED_SEGMENTS.has(segment);
}

export function seoLandingSlugFromPath(path: string) {
  const normalized = normalizeSeoLandingPath(path);
  return isCleanSeoLandingPath(normalized) ? normalized.slice(1) : null;
}

export function cleanSeoCanonicalPath(slugOrPath: string) {
  const source = slugOrPath.trim().toLowerCase();
  const withoutSlash = source.replace(/^\/+/, "").replace(/\/+$/, "");
  const slug = withoutSlash
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  return `/${slug}`;
}
