"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin/auth";
import { createExternalMediaAsset, createUploadedMediaAsset } from "@/lib/admin/media";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ContentStatus = Database["public"]["Enums"]["content_status"];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

function officePayload(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Office name is required.");

  return {
    name,
    slug: slugify(String(formData.get("slug") || name)),
    status_label: String(formData.get("status_label") || "") || null,
    detail: String(formData.get("detail") || "") || null,
    phone: String(formData.get("phone") || "") || null,
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
    sort_order: Number(formData.get("sort_order") || 0),
    status: String(formData.get("status") || "draft") as ContentStatus,
  };
}

async function resolveOfficeImage(id: string, name: string, formData: FormData) {
  const uploaded = formData.get("office_image");
  if (uploaded instanceof File && uploaded.size > 0) {
    const media = await createUploadedMediaAsset({
      bucket: "site-assets",
      ownerId: `offices/${id}`,
      file: uploaded,
      title: `${name} office image`,
      altText: `${name} office`,
    });
    return media?.id ? { image_media_id: media.id } : {};
  }

  const imageUrl = String(formData.get("image_url") || "").trim();
  const existingImageUrl = String(formData.get("existing_image_url") || "").trim();
  const existingMediaId = String(formData.get("existing_image_media_id") || "").trim();
  if (imageUrl && imageUrl === existingImageUrl && existingMediaId) return {};

  if (imageUrl) {
    const media = await createExternalMediaAsset({
      sourceType: "external",
      mediaType: "image",
      url: imageUrl,
      title: `${name} office image`,
      altText: `${name} office`,
      thumbnailUrl: imageUrl,
    });
    return { image_media_id: media?.id ?? (existingMediaId || null) };
  }

  return {};
}

export async function createOffice(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const next = officePayload(formData);
  const { data, error } = await supabase.from("office_locations").insert(next).select("id").single();
  if (error) throw new Error(error.message);

  const imagePatch = await resolveOfficeImage(data.id, next.name, formData);
  if (Object.keys(imagePatch).length > 0) {
    const { error: imageError } = await supabase.from("office_locations").update(imagePatch).eq("id", data.id);
    if (imageError) throw new Error(imageError.message);
  }

  revalidateOfficePaths();
  redirect(`/admin/offices/${data.id}/edit`);
}

export async function updateOffice(id: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const next = officePayload(formData);
  const imagePatch = await resolveOfficeImage(id, next.name, formData);
  const { error } = await supabase.from("office_locations").update({ ...next, ...imagePatch }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidateOfficePaths();
  redirect("/admin/offices");
}

export async function deleteOffice(id: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("office_locations").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateOfficePaths();
  redirect("/admin/offices");
}

function revalidateOfficePaths() {
  revalidateTag("offices", "max");
  revalidatePath("/admin/offices");
  revalidatePath("/about");
  revalidatePath("/contact");
}
