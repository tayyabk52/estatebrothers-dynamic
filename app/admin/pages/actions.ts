"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin/auth";
import { createExternalMediaAsset, createUploadedMediaAsset } from "@/lib/admin/media";
import { createClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/lib/supabase/types";

type ContentStatus = Database["public"]["Enums"]["content_status"];
type LinkKind = Database["public"]["Enums"]["link_kind"];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

function jsonObjectFromField(formData: FormData, key: string): Json {
  const raw = String(formData.get(key) || "").trim();
  if (!raw) return {};
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${key} must be a JSON object.`);
  }
  return parsed as Json;
}

function blockAttributesFromForm(formData: FormData): Json {
  const advanced = jsonObjectFromField(formData, "attributes");
  const sectionKey = String(formData.get("section_key") || "");

  if (sectionKey === "hero-stats" || sectionKey === "testimonial-stats") {
    return {
      ...(advanced && typeof advanced === "object" && !Array.isArray(advanced) ? advanced : {}),
      n: String(formData.get("title") || "").trim(),
      unit: String(formData.get("icon_name") || "").trim(),
      label: String(formData.get("body") || "").trim(),
    };
  }

  if (sectionKey === "testimonials") {
    return {
      ...(advanced && typeof advanced === "object" && !Array.isArray(advanced) ? advanced : {}),
      quote: String(formData.get("body") || "").trim(),
      name: String(formData.get("title") || "").trim(),
      role: String(formData.get("link_label") || "").trim(),
    };
  }

  return advanced;
}

async function payload(formData: FormData) {
  const routePath = String(formData.get("route_path") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const status = String(formData.get("status") || "draft") as ContentStatus;
  const metaTitle = String(formData.get("meta_title") || title).trim();
  const metaDescription = String(formData.get("meta_description") || "").trim();
  if (!routePath.startsWith("/")) throw new Error("Route path must start with /.");
  if (!title) throw new Error("Title is required.");
  if (status === "published" && (!metaTitle || !metaDescription)) {
    throw new Error("Meta title and meta description are required before publishing.");
  }
  let hero_media_id: string | null = null;
  const heroImageUrl = String(formData.get("hero_image_url") || "").trim();
  if (heroImageUrl) {
    const media = await createExternalMediaAsset({
      sourceType: "external",
      mediaType: "image",
      url: heroImageUrl,
      title: `${title} hero image`,
      altText: `${title} hero image`,
      thumbnailUrl: heroImageUrl,
    });
    hero_media_id = media?.id ?? null;
  } else if (formData.get("existing_hero_media_id")) {
    hero_media_id = String(formData.get("existing_hero_media_id"));
  }

  return {
    page_key: slugify(String(formData.get("page_key") || routePath.replace(/^\//, "") || "home")),
    route_path: routePath,
    title,
    heading: String(formData.get("heading") || "") || null,
    intro: String(formData.get("intro") || "") || null,
    body: String(formData.get("body") || "") || null,
    og_image: String(formData.get("og_image") || "") || null,
    hero_media_id,
    meta_title: metaTitle,
    meta_description: metaDescription,
    keywords: String(formData.get("keywords") || "").split(",").map((x) => x.trim()).filter(Boolean),
    status,
    published_at: status === "published" ? String(formData.get("published_at") || "") || new Date().toISOString() : null,
    noindex: formData.get("noindex") === "true",
  };
}

async function resolvePageMedia({
  ownerId,
  title,
  fileField,
  urlField,
  existingField,
  formData,
}: {
  ownerId: string;
  title: string;
  fileField: string;
  urlField: string;
  existingField: string;
  formData: FormData;
}) {
  const uploaded = formData.get(fileField);
  if (uploaded instanceof File && uploaded.size > 0) {
    const media = await createUploadedMediaAsset({
      bucket: "site-assets",
      ownerId,
      file: uploaded,
      title,
      altText: title,
    });
    return media?.id ?? null;
  }

  const imageUrl = String(formData.get(urlField) || "").trim();
  if (imageUrl) {
    const media = await createExternalMediaAsset({
      sourceType: "external",
      mediaType: "image",
      url: imageUrl,
      title,
      altText: title,
      thumbnailUrl: imageUrl,
    });
    return media?.id ?? null;
  }

  const existing = String(formData.get(existingField) || "").trim();
  return existing || null;
}

export async function createPage(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.from("pages").insert(await payload(formData)).select("id, route_path").single();
  if (error) throw new Error(error.message);
  revalidateTag("all-pages", "max");
  revalidateTag(`page-${data.route_path}`, "max");
  revalidatePath(data.route_path);
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${data.id}/edit`);
}

export async function updatePage(id: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const next = await payload(formData);
  const { error } = await supabase.from("pages").update(next).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag("all-pages", "max");
  revalidateTag(`page-${next.route_path}`, "max");
  revalidatePath(next.route_path);
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function deletePage(id: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag("all-pages", "max");
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function updatePageSection(id: string, routePath: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const heading = String(formData.get("heading") || "").trim();
  const mediaId = await resolvePageMedia({
    ownerId: `pages/sections/${id}`,
    title: heading || String(formData.get("section_key") || "Page section image"),
    fileField: "section_media",
    urlField: "section_media_url",
    existingField: "existing_section_media_id",
    formData,
  });

  const { error } = await supabase
    .from("page_sections")
    .update({
      eyebrow: String(formData.get("eyebrow") || "") || null,
      heading: heading || null,
      subheading: String(formData.get("subheading") || "") || null,
      body: String(formData.get("body") || "") || null,
      sort_order: Number(formData.get("sort_order") || 0),
      status: String(formData.get("status") || "draft") as ContentStatus,
      media_id: mediaId,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateTag("all-pages", "max");
  revalidateTag(`page-${routePath}`, "max");
  revalidatePath(routePath);
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${String(formData.get("page_id"))}/edit`);
}

export async function updatePageBlock(id: string, pageId: string, routePath: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const title = String(formData.get("title") || "").trim();
  const mediaId = await resolvePageMedia({
    ownerId: `pages/blocks/${id}`,
    title: title || String(formData.get("block_key") || "Page block image"),
    fileField: "block_media",
    urlField: "block_media_url",
    existingField: "existing_block_media_id",
    formData,
  });

  const { error } = await supabase
    .from("page_blocks")
    .update({
      title: title || null,
      body: String(formData.get("body") || "") || null,
      link_label: String(formData.get("link_label") || "") || null,
      link_url: String(formData.get("link_url") || "") || null,
      link_kind: (String(formData.get("link_kind") || "") || null) as LinkKind | null,
      icon_name: String(formData.get("icon_name") || "") || null,
      attributes: blockAttributesFromForm(formData),
      sort_order: Number(formData.get("sort_order") || 0),
      status: String(formData.get("status") || "draft") as ContentStatus,
      media_id: mediaId,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateTag("all-pages", "max");
  revalidateTag(`page-${routePath}`, "max");
  revalidatePath(routePath);
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${pageId}/edit`);
}
