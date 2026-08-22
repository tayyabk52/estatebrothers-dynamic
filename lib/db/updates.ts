import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { assertAdmin } from "@/lib/admin/auth";
import type { NormalizedUpdate } from "@/lib/types";
import type { UpdateRow } from "@/lib/supabase/types";

type UpdateMediaJoin = {
  sort_order: number;
  is_featured: boolean;
  is_og_candidate: boolean;
  media_assets?: {
    public_url: string | null;
    external_url: string | null;
    embed_url: string | null;
    thumbnail_url: string | null;
    alt_text: string | null;
    media_type: string;
    status: string;
  } | null;
};

type UpdateLinkJoin = { label: string; url: string; kind: string; sort_order: number };
type UpdateWithRelations = UpdateRow & {
  content_authors?: { name: string } | null;
  update_links?: UpdateLinkJoin[] | null;
  update_media?: UpdateMediaJoin[] | null;
};

function mediaImageUrl(media?: UpdateMediaJoin["media_assets"]) {
  if (!media || media.status !== "published") return null;
  if (media.media_type === "image") return media.public_url ?? media.external_url ?? media.thumbnail_url ?? null;
  return media.thumbnail_url ?? null;
}

function rowToUpdate(row: UpdateWithRelations): NormalizedUpdate {
  const media = [...(row.update_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const featuredMedia = media.find((item) => item.is_featured) ?? media[0];
  const ogMedia = media.find((item) => item.is_og_candidate);
  const imageUrl = mediaImageUrl(featuredMedia?.media_assets) ?? row.thumbnail_url ?? row.og_image ?? "/og-default.jpg";
  const ogImage = mediaImageUrl(ogMedia?.media_assets) ?? row.og_image ?? imageUrl;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    type: row.update_type,
    source: row.source,
    author: row.content_authors?.name ?? null,
    publishedAt: (row.published_at ?? row.created_at).slice(0, 10),
    updatedAt: (row.modified_at ?? row.updated_at).slice(0, 10),
    featured: row.featured,
    tags: row.tags ?? [],
    media: {
      url: imageUrl,
      alt: featuredMedia?.media_assets?.alt_text ?? row.thumbnail_alt ?? row.title,
    },
    externalLinks: [...(row.update_links ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((link) => ({ label: link.label, url: link.url, kind: link.kind })),
    body: row.body,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    canonicalPath: row.canonical_path,
    ogImage,
    articleSchemaType: row.article_schema_type,
    articleSection: row.article_section,
    visibility: "public",
    status: row.status,
    noindex: row.noindex ?? false,
  };
}

const UPDATE_SELECT = "*, content_authors(name), update_links(*), update_media(*, media_assets(*))";

export async function getPublishedUpdates(): Promise<NormalizedUpdate[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("updates");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("updates")
    .select(UPDATE_SELECT)
    .eq("status", "published")
    .eq("noindex", false)
    .eq("has_detail_page", true)
    .order("published_at", { ascending: false });
  return ((data ?? []) as UpdateWithRelations[]).map(rowToUpdate);
}

export async function getPublishedUpdateBySlug(slug: string): Promise<NormalizedUpdate | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("updates", `update-${slug}`);

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("updates")
    .select(UPDATE_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  return data ? rowToUpdate(data as UpdateWithRelations) : null;
}

export async function getAllPublishedUpdateSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("updates");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("updates")
    .select("slug")
    .eq("status", "published")
    .eq("noindex", false)
    .eq("has_detail_page", true);
  return (data ?? []).map((row) => row.slug);
}

// Admin: all updates regardless of status (not cached — always fresh)
export async function getAllUpdatesAdmin() {
  await assertAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("updates")
    .select("id, slug, title, status, update_type, published_at, updated_at")
    .order("updated_at", { ascending: false });
  return data ?? [];
}

export async function getUpdateByIdAdmin(id: string): Promise<UpdateRow | null> {
  await assertAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("updates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data as UpdateRow | null;
}

export async function getUpdateLinksAdmin(id: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("update_links")
    .select("id, label, url, kind, sort_order")
    .eq("update_id", id)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export { updateTypeLabels, formatUpdateDate } from "./updates-utils";
