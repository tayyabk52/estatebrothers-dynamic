import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import type { OfficeLocationWithMedia } from "@/lib/db/site";

const OFFICE_SELECT = `
  *,
  image_media:media_assets!office_locations_image_media_id_fkey(*)
`;

export async function getAllOfficesAdmin() {
  await assertAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("office_locations")
    .select("id, name, city, status_label, status, sort_order")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getOfficeByIdAdmin(id: string): Promise<OfficeLocationWithMedia | null> {
  await assertAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("office_locations")
    .select(OFFICE_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data as unknown as OfficeLocationWithMedia | null;
}
