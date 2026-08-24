import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { mediaUrl, type MediaAssetRow } from "@/lib/db/site";
import type { Database } from "@/lib/supabase/types";
import type { NormalizedListing } from "@/lib/types";

export type SeoLandingPageRow = Database["public"]["Tables"]["seo_landing_pages"]["Row"];
export type SeoPageRow = Database["public"]["Tables"]["seo_pages"]["Row"];
export type SeoUrlRuleRow = Database["public"]["Tables"]["seo_url_rules"]["Row"];

export interface SeoLandingPage extends SeoLandingPageRow {
  hero_media?: MediaAssetRow | null;
  og_media?: MediaAssetRow | null;
}

export interface SitemapPageEntry {
  path: string;
  updatedAt: string;
}

export type SeoLandingPlacement = "footer" | "home" | "buy-sell";

export interface SeoLandingLink {
  id: string;
  title: string;
  path: string;
  label: string;
  description: string | null;
}

const SEO_LANDING_SELECT = `
  *,
  hero_media:media_assets!seo_landing_pages_hero_media_id_fkey(*),
  og_media:media_assets!seo_landing_pages_og_media_id_fkey(*)
`;

function normalizePath(path: string) {
  const withoutTrailingSlash = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return withoutTrailingSlash.startsWith("/") ? withoutTrailingSlash : `/${withoutTrailingSlash}`;
}

function sameText(a?: string | null, b?: string | null) {
  if (!a || !b) return true;
  return a.toLowerCase() === b.toLowerCase();
}

function filterValueMatches(value: unknown, listing: NormalizedListing): boolean {
  if (value == null || value === "") return true;
  if (Array.isArray(value)) {
    return value.some((item) => filterValueMatches(item, listing));
  }
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") return true;
  const normalized = String(value).toLowerCase();
  const searchable = [
    listing.type,
    listing.phase,
    listing.city,
    listing.size,
    listing.status,
    listing.availability,
    listing.type === "house" ? listing.location.neighborhood : null,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchable.includes(normalized);
}

export function landingPageImage(page: SeoLandingPage) {
  return mediaUrl(page.og_media) ?? mediaUrl(page.hero_media) ?? page.og_image ?? "/og-default.jpg";
}

export function listingMatchesSeoLandingPage(listing: NormalizedListing, page: SeoLandingPage) {
  const filters = page.filters && typeof page.filters === "object" && !Array.isArray(page.filters)
    ? page.filters as Record<string, unknown>
    : {};

  return (
    sameText(page.listing_type_slug, listing.type) &&
    sameText(page.city, listing.city) &&
    sameText(page.phase, listing.phase) &&
    sameText(page.listing_status, listing.status ?? listing.availability) &&
    sameText(page.neighborhood, listing.type === "house" ? listing.location.neighborhood : null) &&
    Object.values(filters).every((value) => filterValueMatches(value, listing))
  );
}

export async function getSeoLandingPageByPath(path: string): Promise<SeoLandingPage | null> {
  "use cache";
  cacheLife("hours");
  const normalizedPath = normalizePath(path);
  cacheTag("seo-landing-pages", `seo-landing-${normalizedPath}`);

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("seo_landing_pages")
    .select(SEO_LANDING_SELECT)
    .eq("canonical_path", normalizedPath)
    .eq("status", "published")
    .maybeSingle();

  return data as unknown as SeoLandingPage | null;
}

export async function getIndexableSeoLandingPages(): Promise<SeoLandingPage[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("seo-landing-pages");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("seo_landing_pages")
    .select(SEO_LANDING_SELECT)
    .eq("status", "published")
    .eq("noindex", false)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  return (data ?? []) as unknown as SeoLandingPage[];
}

export async function getPromotedSeoLandingLinks(placement: SeoLandingPlacement, limit = 8): Promise<SeoLandingLink[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("seo-landing-pages", `seo-landing-links-${placement}`);

  const placementColumn = placement === "footer"
    ? "show_in_footer"
    : placement === "home"
      ? "show_on_home"
      : "show_on_buy_sell";

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("seo_landing_pages")
    .select("id, title, canonical_path, public_link_label, public_link_description")
    .eq("status", "published")
    .eq("noindex", false)
    .eq(placementColumn, true)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false })
    .limit(limit);

  return (data ?? [])
    .filter((page) => page.canonical_path)
    .map((page) => ({
      id: page.id,
      title: page.title,
      path: page.canonical_path,
      label: page.public_link_label || page.title,
      description: page.public_link_description,
    }));
}

export async function getIndexableCmsPagesForSitemap(): Promise<SitemapPageEntry[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("all-pages");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("pages")
    .select("route_path, updated_at")
    .eq("status", "published")
    .eq("noindex", false)
    .order("sort_order", { ascending: true });

  return (data ?? []).map((row) => ({
    path: row.route_path,
    updatedAt: row.updated_at.slice(0, 10),
  }));
}

export async function getIndexableSeoPagesForSitemap(): Promise<SitemapPageEntry[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("seo-pages");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("seo_pages")
    .select("route_path, updated_at")
    .eq("noindex", false)
    .order("updated_at", { ascending: false });

  return (data ?? []).map((row) => ({
    path: row.route_path,
    updatedAt: row.updated_at.slice(0, 10),
  }));
}

export async function getSeoPageByPath(path: string): Promise<SeoPageRow | null> {
  "use cache";
  cacheLife("hours");
  const normalizedPath = normalizePath(path);
  cacheTag("seo-pages", `seo-page-${normalizedPath}`);

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("seo_pages")
    .select("*")
    .eq("route_path", normalizedPath)
    .maybeSingle();

  return data as SeoPageRow | null;
}

export async function getSeoUrlRuleByPath(path: string): Promise<SeoUrlRuleRow | null> {
  "use cache";
  cacheLife("hours");
  const normalizedPath = normalizePath(path);
  cacheTag("seo-url-rules", `seo-url-rule-${normalizedPath}`);

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("seo_url_rules")
    .select("*")
    .eq("source_pattern", normalizedPath)
    .eq("active", true)
    .maybeSingle();

  return data as SeoUrlRuleRow | null;
}
