import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { Database, SiteSettingsRow } from "@/lib/supabase/types";

export type MediaAssetRow = Database["public"]["Tables"]["media_assets"]["Row"];
export type PageRow = Database["public"]["Tables"]["pages"]["Row"];
export type PageSectionRow = Database["public"]["Tables"]["page_sections"]["Row"];
export type PageBlockRow = Database["public"]["Tables"]["page_blocks"]["Row"];
export type FAQRow = Database["public"]["Tables"]["faqs"]["Row"];
export type OfficeLocationRow = Database["public"]["Tables"]["office_locations"]["Row"];

export interface PageBlockWithMedia extends PageBlockRow {
  media_assets?: MediaAssetRow | null;
}

export interface PageSectionWithBlocks extends PageSectionRow {
  media_assets?: MediaAssetRow | null;
  page_blocks?: PageBlockWithMedia[];
}

export interface PageWithSections extends PageRow {
  hero_media?: MediaAssetRow | null;
  page_sections?: PageSectionWithBlocks[];
}

export interface OfficeLocationWithMedia extends OfficeLocationRow {
  image_media?: MediaAssetRow | null;
  imageUrl?: string | null;
}

export function mediaUrl(media?: Pick<MediaAssetRow, "public_url" | "external_url" | "thumbnail_url" | "media_type"> | null) {
  if (!media) return null;
  if (media.media_type === "image") return media.public_url ?? media.external_url ?? media.thumbnail_url ?? null;
  return media.thumbnail_url ?? null;
}

export async function getSiteSettings(): Promise<SiteSettingsRow | null> {
  "use cache";
  cacheLife("days");
  cacheTag("site-settings");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("singleton_key", true)
    .maybeSingle();
  return data;
}

export async function getPublishedPage(routePath: string): Promise<PageWithSections | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("all-pages", `page-${routePath}`);

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("pages")
    .select(
      `
      *,
      hero_media:media_assets!pages_hero_media_id_fkey(*),
      page_sections(
        *,
        media_assets:media_id(*),
        page_blocks(
          *,
          media_assets:media_id(*)
        )
      )
    `
    )
    .eq("route_path", routePath)
    .eq("status", "published")
    .maybeSingle();

  if (!data) return null;
  const page = data as unknown as PageWithSections;
  page.page_sections = (page.page_sections ?? [])
    .filter((section) => section.status === "published")
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((section) => ({
      ...section,
      page_blocks: (section.page_blocks ?? [])
        .filter((block) => block.status === "published")
        .sort((a, b) => a.sort_order - b.sort_order),
    }));
  return page;
}

export async function getPublishedFAQs(routePath?: string): Promise<FAQRow[]> {
  "use cache";
  cacheLife("days");
  cacheTag("faqs");

  const supabase = createPublicClient();
  let query = supabase
    .from("faqs")
    .select("*, pages!left(route_path)")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (routePath) {
    query = query.or(`page_id.is.null,pages.route_path.eq.${routePath}`);
  }

  const { data } = await query;
  return (data ?? []) as unknown as FAQRow[];
}

export async function getPublishedOfficeLocations(): Promise<OfficeLocationWithMedia[]> {
  "use cache";
  cacheLife("days");
  cacheTag("offices");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("office_locations")
    .select(
      `
      *,
      image_media:media_assets!office_locations_image_media_id_fkey(*)
    `
    )
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  return ((data ?? []) as unknown as OfficeLocationWithMedia[]).map((office) => ({
    ...office,
    imageUrl: mediaUrl(office.image_media),
  }));
}

// Admin-only queries (not cached — always fresh for the admin dashboard)
export async function getPublishedPageAdmin(routePath: string): Promise<PageWithSections | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select(
      `
      *,
      hero_media:media_assets!pages_hero_media_id_fkey(*),
      page_sections(
        *,
        media_assets:media_id(*),
        page_blocks(
          *,
          media_assets:media_id(*)
        )
      )
    `
    )
    .eq("route_path", routePath)
    .maybeSingle();

  if (!data) return null;
  const page = data as unknown as PageWithSections;
  page.page_sections = (page.page_sections ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((section) => ({
      ...section,
      page_blocks: (section.page_blocks ?? []).sort((a, b) => a.sort_order - b.sort_order),
    }));
  return page;
}
