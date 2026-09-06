"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin/auth";
import { createExternalMediaAsset, createUploadedMediaAsset } from "@/lib/admin/media";
import { recordRedirect } from "@/lib/db/redirects";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ContentStatus = Database["public"]["Enums"]["content_status"];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

function nullableString(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
}

function stringList(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function teamPayload(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required.");
  const slug = slugify(String(formData.get("slug") || name));
  const hasProfilePage = formData.get("has_profile_page") === "true";
  const canonicalPath = hasProfilePage ? `/team/${slug}` : null;
  return {
    name,
    slug,
    canonical_path: canonicalPath,
    has_profile_page: hasProfilePage,
    job_title: nullableString(formData.get("job_title")),
    phone: nullableString(formData.get("phone")),
    whatsapp: nullableString(formData.get("whatsapp")),
    email: nullableString(formData.get("email")),
    bio: nullableString(formData.get("bio")),
    profile_summary: nullableString(formData.get("profile_summary")),
    profile_body: nullableString(formData.get("profile_body")),
    keywords: stringList(formData.get("keywords")),
    status: String(formData.get("status") || "draft") as ContentStatus,
    public_profile: formData.get("public_profile") === "true",
    sort_order: Number(formData.get("sort_order") || 0),
    meta_title: nullableString(formData.get("meta_title")) || `${name} | Estate Brothers`,
    meta_description: nullableString(formData.get("meta_description")),
    og_image: nullableString(formData.get("og_image")),
  };
}

async function resolveTeamImage(id: string, name: string, formData: FormData) {
  const altText = nullableString(formData.get("image_alt_text")) || `${name} profile photo`;
  const uploaded = formData.get("team_image");
  if (uploaded instanceof File && uploaded.size > 0) {
    const media = await createUploadedMediaAsset({
      bucket: "site-assets",
      ownerId: `team/${id}`,
      file: uploaded,
      altText,
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
    const supabase = await createClient();
    const { error } = await supabase.from("media_assets").update({ alt_text: altText }).eq("id", existingMediaId);
    if (error) throw new Error(error.message);
    return {};
  }

  if (imageUrl) {
    const media = await createExternalMediaAsset({
      sourceType: "external",
      mediaType: "image",
      url: imageUrl,
      title: `${name} profile image`,
      altText,
      thumbnailUrl: imageUrl,
    });

    return {
      image_media_id: media?.id ?? (existingMediaId || null),
      image_url: imageUrl,
    };
  }

  return {};
}

async function resolveTeamOgImage(id: string, name: string, formData: FormData) {
  const uploaded = formData.get("team_og_image");
  if (uploaded instanceof File && uploaded.size > 0) {
    const media = await createUploadedMediaAsset({
      bucket: "site-assets",
      ownerId: `team/${id}/og`,
      file: uploaded,
      altText: `${name} profile social preview`,
      title: `${name} profile OG image`,
    });
    return {
      og_media_id: media?.id ?? null,
      og_image: media?.public_url ?? null,
    };
  }

  const ogImage = String(formData.get("og_image") || "").trim();
  const existingOgMediaId = String(formData.get("existing_og_media_id") || "").trim();
  const existingOgImage = String(formData.get("existing_og_image") || "").trim();
  if (ogImage && ogImage === existingOgImage && existingOgMediaId) {
    return {};
  }
  if (ogImage) {
    const media = await createExternalMediaAsset({
      sourceType: "external",
      mediaType: "image",
      url: ogImage,
      title: `${name} profile OG image`,
      altText: `${name} profile social preview`,
      thumbnailUrl: ogImage,
    });
    return {
      og_media_id: media?.id ?? (existingOgMediaId || null),
      og_image: ogImage,
    };
  }
  return {};
}

function validateIndexableProfile(input: ReturnType<typeof teamPayload>, formData: FormData) {
  if (!(input.status === "published" && input.has_profile_page)) return;
  const uploaded = formData.get("team_image");
  const hasUpload = uploaded instanceof File && uploaded.size > 0;
  const hasImage = Boolean(hasUpload || formData.get("existing_image_media_id") || formData.get("image_url"));
  const hasAlt = Boolean(nullableString(formData.get("image_alt_text")) || input.name);
  const missing = [
    !input.job_title && "job title",
    !hasImage && "profile image",
    !hasAlt && "image alt text",
    !input.profile_summary && "profile summary",
    !input.profile_body && "full profile body",
    !input.meta_description && "meta description",
    !input.keywords.length && "keywords / expertise",
    !input.canonical_path && "canonical path",
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(`Complete these fields before publishing an indexable profile: ${missing.join(", ")}.`);
  }
}

function revalidateTeamSurfaces(path?: string | null, oldPath?: string | null, slug?: string | null, oldSlug?: string | null) {
  revalidateTag("team", "max");
  if (slug) revalidateTag(`team-profile-${slug}`, "max");
  if (oldSlug) revalidateTag(`team-profile-${oldSlug}`, "max");
  revalidatePath("/admin/team");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/buy-sell");
  revalidatePath("/sitemap.xml");
  if (path) revalidatePath(path);
  if (oldPath) revalidatePath(oldPath);
}

export async function createTeamMember(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const next = teamPayload(formData);
  validateIndexableProfile(next, formData);
  const { data, error } = await supabase.from("team_members").insert(next).select("id").single();
  if (error) throw new Error(error.message);
  const imagePatch = await resolveTeamImage(data.id, next.name, formData);
  const ogPatch = await resolveTeamOgImage(data.id, next.name, formData);
  const mediaPatch = { ...imagePatch, ...ogPatch };
  if (Object.keys(mediaPatch).length > 0) {
    const { error: imageError } = await supabase.from("team_members").update(mediaPatch).eq("id", data.id);
    if (imageError) throw new Error(imageError.message);
  }
  revalidateTeamSurfaces(next.canonical_path, null, next.slug);
  redirect(`/admin/team/${data.id}/edit?result=saved`);
}

export async function updateTeamMember(id: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("team_members")
    .select("slug, canonical_path")
    .eq("id", id)
    .maybeSingle();
  const next = teamPayload(formData);
  validateIndexableProfile(next, formData);
  const imagePatch = await resolveTeamImage(id, next.name, formData);
  const ogPatch = await resolveTeamOgImage(id, next.name, formData);
  const { error } = await supabase.from("team_members").update({ ...next, ...imagePatch, ...ogPatch }).eq("id", id);
  if (error) throw new Error(error.message);
  if (existing?.canonical_path && next.canonical_path && existing.canonical_path !== next.canonical_path) {
    await recordRedirect(existing.canonical_path, next.canonical_path, 301);
  }
  revalidateTeamSurfaces(next.canonical_path, existing?.canonical_path, next.slug, existing?.slug);
  redirect("/admin/team?result=saved");
}

export async function deleteTeamMember(id: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { data: existing } = await supabase.from("team_members").select("slug, canonical_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTeamSurfaces(null, existing?.canonical_path, null, existing?.slug);
  redirect("/admin/team?result=saved");
}
