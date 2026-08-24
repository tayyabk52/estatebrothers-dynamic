"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export async function saveSiteSettings(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("site_settings")
    .select("social_links, price_range")
    .eq("singleton_key", true)
    .maybeSingle();
  const existingSocials =
    existing?.social_links && typeof existing.social_links === "object" && !Array.isArray(existing.social_links)
      ? (existing.social_links as Record<string, string>)
      : {};
  const socialValue = (key: string) => {
    if (!formData.has(key)) return existingSocials[key] ?? "";
    return String(formData.get(key) || "").trim();
  };
  const social_links = {
    ...existingSocials,
    facebook: socialValue("facebook"),
    instagram: socialValue("instagram"),
    linkedin: socialValue("linkedin"),
    youtube: socialValue("youtube"),
  };
  const payload = {
    singleton_key: true,
    business_name: String(formData.get("business_name") || "Estate Brothers"),
    legal_name: String(formData.get("legal_name") || "") || null,
    tagline: String(formData.get("tagline") || "") || null,
    business_description: String(formData.get("business_description") || "") || null,
    phone: String(formData.get("phone") || "") || null,
    whatsapp: String(formData.get("whatsapp") || "") || null,
    email: String(formData.get("email") || "") || null,
    address_line_1: String(formData.get("address_line_1") || "") || null,
    address_line_2: String(formData.get("address_line_2") || "") || null,
    city: String(formData.get("city") || "") || null,
    region: String(formData.get("region") || "") || null,
    postal_code: String(formData.get("postal_code") || "") || null,
    country_code: String(formData.get("country_code") || "PK").slice(0, 2).toUpperCase(),
    latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
    longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
    map_url: String(formData.get("map_url") || "") || null,
    price_range: String(formData.get("price_range") || existing?.price_range || "PKR"),
    service_areas: String(formData.get("service_areas") || "").split(",").map((x) => x.trim()).filter(Boolean),
    knows_about: String(formData.get("knows_about") || "").split(",").map((x) => x.trim()).filter(Boolean),
    social_links,
    logo_url: String(formData.get("logo_url") || "") || null,
    default_og_image: String(formData.get("default_og_image") || "") || null,
    default_meta_title: String(formData.get("default_meta_title") || "") || null,
    default_meta_description: String(formData.get("default_meta_description") || "") || null,
    google_site_verification: String(formData.get("google_site_verification") || "") || null,
    bing_site_verification: String(formData.get("bing_site_verification") || "") || null,
  };
  const { error } = await supabase.from("site_settings").upsert(payload, { onConflict: "singleton_key" });
  if (error) throw new Error(error.message);
  revalidateTag("site-settings", "max");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/site");
}

