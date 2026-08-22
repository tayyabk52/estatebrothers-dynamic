import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { assertAdmin } from "@/lib/admin/auth";
import type { NormalizedAgent } from "@/lib/types";
import type { Database, TeamMemberRow } from "@/lib/supabase/types";

type MediaAssetRow = Database["public"]["Tables"]["media_assets"]["Row"];
type TeamMemberWithMedia = TeamMemberRow & {
  image_media?: Pick<MediaAssetRow, "public_url" | "external_url" | "thumbnail_url" | "media_type" | "status"> | null;
};

const TEAM_SELECT = `
  *,
  image_media:media_assets!team_members_image_media_id_fkey(
    public_url,
    external_url,
    thumbnail_url,
    media_type,
    status
  )
`;

function teamImageUrl(row: TeamMemberWithMedia) {
  const media = row.image_media;
  if (media?.status === "published" && media.media_type === "image") {
    return media.public_url ?? media.external_url ?? media.thumbnail_url ?? row.image_url;
  }
  return row.image_url;
}

function rowToAgent(row: TeamMemberWithMedia): NormalizedAgent {
  return {
    id: row.id,
    name: row.name,
    role: row.job_title,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    imageUrl: teamImageUrl(row),
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

export function buildAgentMap(agents: NormalizedAgent[]): Record<string, NormalizedAgent> {
  return Object.fromEntries(agents.map((a) => [a.id, a]));
}

// Admin: all team members (not cached — always fresh)
export async function getAllTeamMembersAdmin(): Promise<Pick<TeamMemberRow, "id" | "name" | "job_title" | "phone" | "status" | "sort_order">[]> {
  await assertAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_members")
    .select("id, name, job_title, phone, status, sort_order")
    .order("sort_order", { ascending: true });
  return (data ?? []) as Pick<TeamMemberRow, "id" | "name" | "job_title" | "phone" | "status" | "sort_order">[];
}

export async function getTeamMemberByIdAdmin(id: string): Promise<TeamMemberRow | null> {
  await assertAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("team_members").select("*").eq("id", id).maybeSingle();
  return data as TeamMemberRow | null;
}
