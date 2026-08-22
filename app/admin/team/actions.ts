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

function teamPayload(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required.");
  return {
    name,
    slug: slugify(String(formData.get("slug") || name)),
    job_title: String(formData.get("job_title") || "") || null,
    phone: String(formData.get("phone") || "") || null,
    whatsapp: String(formData.get("whatsapp") || "") || null,
    email: String(formData.get("email") || "") || null,
    bio: String(formData.get("bio") || "") || null,
    status: String(formData.get("status") || "draft") as ContentStatus,
    public_profile: formData.get("public_profile") === "true",
    sort_order: Number(formData.get("sort_order") || 0),
    meta_title: String(formData.get("meta_title") || "") || null,
    meta_description: String(formData.get("meta_description") || "") || null,
  };
}

async function resolveTeamImage(id: string, name: string, formData: FormData) {
  const uploaded = formData.get("team_image");
  if (uploaded instanceof File && uploaded.size > 0) {
    const media = await createUploadedMediaAsset({
      bucket: "site-assets",
      ownerId: `team/${id}`,
      file: uploaded,
      altText: name,
      title: `${name} profile image`,
    });

    if (media?.id) {
      return {
        image_media_id: media.id,
        image_url: media.public_url ?? null,
      };
    }
  }

  const imageUrl = String(formData.get("image_url") || "").trim();
  const existingMediaId = String(formData.get("existing_image_media_id") || "").trim();
  const existingImageUrl = String(formData.get("existing_image_url") || "").trim();
  if (imageUrl && imageUrl === existingImageUrl && existingMediaId) {
    return {};
  }

  if (imageUrl) {
    const media = await createExternalMediaAsset({
      sourceType: "external",
      mediaType: "image",
      url: imageUrl,
      title: `${name} profile image`,
      altText: name,
      thumbnailUrl: imageUrl,
    });

    return {
      image_media_id: media?.id ?? (existingMediaId || null),
      image_url: imageUrl,
    };
  }

  return {};
}

export async function createTeamMember(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const next = teamPayload(formData);
  const { data, error } = await supabase.from("team_members").insert(next).select("id").single();
  if (error) throw new Error(error.message);
  const imagePatch = await resolveTeamImage(data.id, next.name, formData);
  if (Object.keys(imagePatch).length > 0) {
    const { error: imageError } = await supabase.from("team_members").update(imagePatch).eq("id", data.id);
    if (imageError) throw new Error(imageError.message);
  }
  revalidateTag("team", "max");
  revalidatePath("/admin/team");
  revalidatePath("/");
  revalidatePath("/about");
  redirect(`/admin/team/${data.id}/edit`);
}

export async function updateTeamMember(id: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const next = teamPayload(formData);
  const imagePatch = await resolveTeamImage(id, next.name, formData);
  const { error } = await supabase.from("team_members").update({ ...next, ...imagePatch }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag("team", "max");
  revalidatePath("/admin/team");
  revalidatePath("/");
  revalidatePath("/about");
  redirect("/admin/team");
}

export async function deleteTeamMember(id: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag("team", "max");
  revalidatePath("/admin/team");
  revalidatePath("/");
  revalidatePath("/about");
  redirect("/admin/team");
}
