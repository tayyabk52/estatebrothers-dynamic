import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import type { PageWithSections } from "@/lib/db/site";

export async function getAllPagesAdmin() {
  await assertAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("id, title, route_path, status, noindex, updated_at")
    .order("route_path", { ascending: true });
  return data ?? [];
}

export async function getPageByIdAdmin(id: string): Promise<PageWithSections | null> {
  await assertAdmin();
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
          media_assets:media_id(*),
          page_block_media(
            id,
            page_block_id,
            media_id,
            sort_order,
            is_primary,
            caption,
            created_at,
            media_assets:media_id(*)
          )
        )
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;
  const page = data as unknown as PageWithSections;
  page.page_sections = (page.page_sections ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((section) => ({
      ...section,
      page_blocks: (section.page_blocks ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((block) => ({
          ...block,
          page_block_media: (block.page_block_media ?? []).sort((a, b) => a.sort_order - b.sort_order),
        })),
    }));
  return page;
}
