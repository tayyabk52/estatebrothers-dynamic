const OPTIMIZED_HOSTS = new Set([
  "zucpsqjiaexxxobzwodd.supabase.co",
  "estatebrothers.pk",
  "www.estatebrothers.pk",
]);

export function canUseNextImage(src: string) {
  if (!src) return false;
  if (src.startsWith("/")) return true;

  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}
