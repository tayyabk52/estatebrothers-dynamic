import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { assertAdmin } from "@/lib/admin/auth";
import type { NormalizedAgent } from "@/lib/types";
import type { Database, TeamMemberRow } from "@/lib/supabase/types";

type MediaAssetRow = Database["public"]["Tables"]["media_assets"]["Row"];
type TeamMemberWithMedia = TeamMemberRow & {
  image_media?: Pick<MediaAssetRow, "public_url" | "external_url" | "thumbnail_url" | "alt_text" | "media_type" | "status"> | null;
  og_media?: Pick<MediaAssetRow, "public_url" | "external_url" | "thumbnail_url" | "media_type" | "status"> | null;
};

const TEAM_SELECT = `
  *,
  image_media:media_assets!team_members_image_media_id_fkey(
    public_url,
    external_url,
    thumbnail_url,
    alt_text,
    media_type,
    status
  ),
  og_media:media_assets!team_members_og_media_id_fkey(
    public_url,
    external_url,
    thumbnail_url,
    media_type,
    status
  )
`;

function assetImageUrl(media?: Pick<MediaAssetRow, "public_url" | "external_url" | "thumbnail_url" | "media_type" | "status"> | null) {
  if (media?.status === "published" && media.media_type === "image") {
    return media.public_url ?? media.external_url ?? media.thumbnail_url ?? null;
  }
  return null;
}

function teamImageUrl(row: TeamMemberWithMedia) {
  return assetImageUrl(row.image_media) ?? row.image_url;
}

function teamOgImage(row: TeamMemberWithMedia) {
  return assetImageUrl(row.og_media) ?? row.og_image ?? teamImageUrl(row);
}

export function teamProfilePath(row: Pick<TeamMemberRow, "canonical_path" | "slug">) {
  return row.canonical_path || `/team/${row.slug}`;
}

export function isIndexableTeamProfile(row: TeamMemberWithMedia | TeamMemberRow) {
  const imageUrl = "image_media" in row ? teamImageUrl(row as TeamMemberWithMedia) : row.image_url;
  const imageAlt = "image_media" in row
    ? (row as TeamMemberWithMedia).image_media?.alt_text
    : null;
  return Boolean(
    row.status === "published" &&
      row.has_profile_page &&
      row.slug &&
      row.canonical_path &&
      row.name &&
      row.job_title &&
      imageUrl &&
      (imageAlt || row.name) &&
      row.profile_summary &&
      row.profile_body &&
      row.meta_description &&
      row.keywords?.length
  );
}

function rowToAgent(row: TeamMemberWithMedia): NormalizedAgent {
  const hasProfile = isIndexableTeamProfile(row);
  return {
    id: row.id,
    name: row.name,
    role: row.job_title,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    imageUrl: teamImageUrl(row),
    imageAlt: row.image_media?.alt_text ?? `${row.name}${row.job_title ? `, ${row.job_title}` : ""}`,
    slug: row.slug,
    profilePath: hasProfile ? teamProfilePath(row) : null,
    profileSummary: row.profile_summary,
    profileBody: row.profile_body,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    ogImage: teamOgImage(row),
    keywords: row.keywords ?? [],
    updatedAt: row.updated_at?.slice(0, 10),
  };
}

export async function getPublishedTeamMembers(): Promise<NormalizedAgent[]> {
  "use cache";
  cacheLife("days");
  cacheTag("team");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("team_members")
    .select(TEAM_SELECT)
    .eq("status", "published")
    .eq("public_profile", true)
    .order("sort_order", { ascending: true });
  return ((data ?? []) as unknown as TeamMemberWithMedia[]).map(rowToAgent);
}

export async function getTeamMemberById(id: string): Promise<NormalizedAgent | null> {
  "use cache";
  cacheLife("days");
  cacheTag("team", `team-member-${id}`);

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("team_members")
    .select(TEAM_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return rowToAgent(data as unknown as TeamMemberWithMedia);
}

export async function getPublishedTeamProfileBySlug(slug: string): Promise<NormalizedAgent | null> {
  "use cache";
  cacheLife("days");
  cacheTag("team", `team-profile-${slug}`);

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("team_members")
    .select(TEAM_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("has_profile_page", true)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as TeamMemberWithMedia;
  if (!isIndexableTeamProfile(row)) return null;
  return rowToAgent(row);
}

export async function getIndexableTeamProfiles(): Promise<NormalizedAgent[]> {
  "use cache";
  cacheLife("days");
  cacheTag("team");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("team_members")
    .select(TEAM_SELECT)
    .eq("status", "published")
    .eq("has_profile_page", true)
    .order("sort_order", { ascending: true });
  return ((data ?? []) as unknown as TeamMemberWithMedia[])
    .filter(isIndexableTeamProfile)
    .map(rowToAgent);
}

export function buildAgentMap(agents: NormalizedAgent[]): Record<string, NormalizedAgent> {
  return Object.fromEntries(agents.map((a) => [a.id, a]));
}

// Admin: all team members (not cached — always fresh)
export async function getAllTeamMembersAdmin(): Promise<Pick<TeamMemberRow, "id" | "name" | "job_title" | "phone" | "status" | "sort_order" | "has_profile_page" | "canonical_path">[]> {
  await assertAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_members")
    .select("id, name, job_title, phone, status, sort_order, has_profile_page, canonical_path")
    .order("sort_order", { ascending: true });
  return (data ?? []) as Pick<TeamMemberRow, "id" | "name" | "job_title" | "phone" | "status" | "sort_order" | "has_profile_page" | "canonical_path">[];
}

export async function getTeamMemberByIdAdmin(id: string): Promise<TeamMemberRow | null> {
  await assertAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("team_members").select(TEAM_SELECT).eq("id", id).maybeSingle();
  return data as TeamMemberRow | null;
}
