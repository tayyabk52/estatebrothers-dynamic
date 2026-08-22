"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin/auth";
import { createExternalMediaAsset, createUploadedMediaAsset } from "@/lib/admin/media";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ContentStatus = Database["public"]["Enums"]["content_status"];
type UpdateType = Database["public"]["Enums"]["update_type"];
type ArticleSchemaType = Database["public"]["Enums"]["article_schema_type"];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

export async function createUpdate(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const slug = slugify((formData.get("slug") as string) || title);
  const canonicalPath = `/updates/${slug}`;
  const status = formData.get("status") as ContentStatus;

  const body = (formData.get("body") as string) || null;
  const metaTitle = (formData.get("meta_title") as string) || title;
  const metaDescription = (formData.get("meta_description") as string) || null;
  const authorId = (formData.get("author_id") as string) || null;

  if (status === "published" && (!body || !metaDescription || !authorId)) {
    throw new Error("To publish, Body, Meta description, and Author are all required.");
  }

  const { data, error } = await supabase
    .from("updates")
    .insert({
      title,
      slug,
      canonical_path: canonicalPath,
      summary: (formData.get("summary") as string) || null,
      body,
      update_type: ((formData.get("update_type") as string) || "announcement") as UpdateType,
      source: (formData.get("source") as string) || "website",
      featured: formData.get("featured") === "true",
      tags: parseTags(formData),
      headline: (formData.get("headline") as string) || null,
      article_section: (formData.get("article_section") as string) || null,
      article_schema_type: (((formData.get("article_schema_type") as string) || "Article") as ArticleSchemaType),
      has_detail_page: true,
      meta_title: metaTitle,
      meta_description: metaDescription,
      author_id: authorId,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  await syncUpdateExtras(data.id, formData);
  revalidateTag("updates", "max");
  revalidateTag(`update-${slug}`, "max");
  revalidatePath("/admin/updates");
  revalidatePath("/updates");
  revalidatePath(`/updates/${slug}`);
  redirect(`/admin/updates/${data.id}/edit`);
}

import { recordRedirect } from "@/lib/db/redirects";

export async function updateUpdate(id: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const status = formData.get("status") as ContentStatus;

  const body = (formData.get("body") as string) || null;
  const metaTitle = (formData.get("meta_title") as string) || null;
  const metaDescription = (formData.get("meta_description") as string) || null;
  const authorId = (formData.get("author_id") as string) || null;

  if (status === "published" && (!body || !metaDescription || !authorId)) {
    throw new Error("To publish, Body, Meta description, and Author are all required.");
  }

  const { data: existing } = await supabase
    .from("updates")
    .select("slug, canonical_path")
    .eq("id", id)
    .single();

  const title = formData.get("title") as string;
  const rawSlug = formData.get("slug") as string | null;
  const newSlug = rawSlug ? slugify(rawSlug) : (existing?.slug ?? slugify(title));
  const newCanonicalPath = `/updates/${newSlug}`;

  const { error } = await supabase
    .from("updates")
    .update({
      title,
      slug: newSlug,
      canonical_path: newCanonicalPath,
      summary: (formData.get("summary") as string) || null,
      body,
      update_type: ((formData.get("update_type") as string) || "announcement") as UpdateType,
      source: (formData.get("source") as string) || "website",
      featured: formData.get("featured") === "true",
      tags: parseTags(formData),
      headline: (formData.get("headline") as string) || null,
      article_section: (formData.get("article_section") as string) || null,
      article_schema_type: (((formData.get("article_schema_type") as string) || "Article") as ArticleSchemaType),
      meta_title: metaTitle,
      meta_description: metaDescription,
      author_id: authorId,
      status,
      published_at: status === "published" ? (formData.get("published_at") as string) || new Date().toISOString() : null,
      modified_at: new Date().toISOString(),
      noindex: formData.get("noindex") === "true",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  if (existing?.canonical_path && existing.canonical_path !== newCanonicalPath) {
    await recordRedirect(existing.canonical_path, newCanonicalPath, 301);
    revalidateTag(`update-${existing.slug}`, "max");
  }

  await syncUpdateExtras(id, formData);
  revalidateTag("updates", "max");
  revalidateTag(`update-${newSlug}`, "max");
  revalidatePath("/admin/updates");
  revalidatePath("/updates");
  redirect("/admin/updates");
}

function parseTags(formData: FormData) {
  return String(formData.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function syncUpdateExtras(updateId: string, formData: FormData) {
  const supabase = await createClient();

  if (formData.has("links_submitted")) {
    await supabase.from("update_links").delete().eq("update_id", updateId);
    const linkLabels = formData.getAll("link_label").map(String);
    const linkUrls = formData.getAll("link_url").map(String);
    const linkKinds = formData.getAll("link_kind").map(String);
    const linkRows = linkLabels
      .map((label, index) => ({
        update_id: updateId,
        label: label.trim(),
        url: (linkUrls[index] ?? "").trim(),
        kind: (linkKinds[index] === "external" ? "external" : "internal") as "internal" | "external",
        sort_order: index,
      }))
      .filter((link) => link.label && link.url);
    if (linkRows.length) {
      const { error } = await supabase.from("update_links").insert(linkRows);
      if (error) throw new Error(error.message);
    }
  }

  const files = formData.getAll("update_media").filter((item): item is File => item instanceof File && item.size > 0);
  let sort = Number(formData.get("media_sort_start") || 0);
  for (const file of files) {
    const asset = await createUploadedMediaAsset({
      bucket: "update-media",
      ownerId: updateId,
      file,
      altText: (formData.get("media_alt_text") as string) || null,
      title: (formData.get("media_title") as string) || null,
    });
    if (!asset) continue;
    const { error } = await supabase.from("update_media").insert({
      update_id: updateId,
      media_id: asset.id,
      sort_order: sort++,
      is_featured: formData.get("media_featured") === "true",
      is_inline: false,
      is_og_candidate: formData.get("media_og") === "true",
    });
    if (error) throw new Error(error.message);
  }

  const externalUrl = String(formData.get("external_media_url") || "").trim();
  if (externalUrl) {
    const sourceType = externalUrl.includes("youtube") || externalUrl.includes("youtu.be")
      ? "youtube"
      : externalUrl.includes("facebook")
        ? "facebook"
        : "external";
    const asset = await createExternalMediaAsset({
      sourceType,
      mediaType: sourceType === "external" ? "image" : "embed",
      url: externalUrl,
      title: (formData.get("external_media_title") as string) || null,
      thumbnailUrl: (formData.get("external_thumbnail_url") as string) || null,
    });
    if (asset) {
      const { error } = await supabase.from("update_media").insert({
        update_id: updateId,
        media_id: asset.id,
        sort_order: sort,
        is_featured: false,
        is_inline: false,
        is_og_candidate: false,
      });
      if (error) throw new Error(error.message);
    }
  }
}

export async function deleteUpdate(id: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("updates").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag("updates", "max");
  revalidatePath("/admin/updates");
  revalidatePath("/updates");
  redirect("/admin/updates");
}
