import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import type { SeoLandingPage } from "@/lib/db/seo";

const SEO_LANDING_ADMIN_SELECT = `
  *,
  hero_media:media_assets!seo_landing_pages_hero_media_id_fkey(*),
  og_media:media_assets!seo_landing_pages_og_media_id_fkey(*)
`;

export async function getAllSeoLandingPagesAdmin(): Promise<SeoLandingPage[]> {
  await assertAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seo_landing_pages")
    .select(SEO_LANDING_ADMIN_SELECT)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as SeoLandingPage[];
}

export async function getSeoLandingPageByIdAdmin(id: string): Promise<SeoLandingPage | null> {
  await assertAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seo_landing_pages")
    .select(SEO_LANDING_ADMIN_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as unknown as SeoLandingPage | null;
}
