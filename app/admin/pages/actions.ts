"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin/auth";
import {
  createExternalMediaAsset,
  createUploadedMediaAsset,
  discardUnattachedMediaAsset,
} from "@/lib/admin/media";
import { recordRedirect } from "@/lib/db/redirects";
import { getHomeSectionDefinition } from "@/lib/homepage/section-contract";
import { createClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/lib/supabase/types";

type ContentStatus = Database["public"]["Enums"]["content_status"];
type LinkKind = Database["public"]["Enums"]["link_kind"];
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

interface ResolvedPageMedia {
  id: string | null;
  created: boolean;
}

function field(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function optionalField(formData: FormData, key: string) {
  return field(formData, key) || null;
}

function validateLink(url: string | null, kind: LinkKind | null, label: string) {
  if (!url) return;
  if (kind === "internal" && !url.startsWith("/")) {
    throw new Error(`${label} must start with / for an internal link.`);
  }
  if (kind === "external") {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error();
    } catch {
      throw new Error(`${label} must be a complete http or https URL.`);
    }
  }
}

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

function blockAttributesFromForm(formData: FormData, sectionKey: string): Json {
  const advanced = jsonObjectFromField(formData, "attributes");

  if (sectionKey === "hero-stats" || sectionKey === "testimonial-stats" || sectionKey === "about-proof") {
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

  if (sectionKey === "featured-projects") {
    return {
      ...(advanced && typeof advanced === "object" && !Array.isArray(advanced) ? advanced : {}),
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("body") || "").trim(),
      location: String(formData.get("link_label") || "").trim(),
      href: String(formData.get("link_url") || "").trim(),
      label: String(formData.get("icon_name") || "").trim(),
    };
  }

  if (sectionKey === "life-gallery" || sectionKey === "gallery" || sectionKey === "events") {
    return {
      ...(advanced && typeof advanced === "object" && !Array.isArray(advanced) ? advanced : {}),
      title: String(formData.get("title") || "").trim(),
      caption: String(formData.get("body") || "").trim(),
      label: String(formData.get("icon_name") || "").trim(),
    };
  }

  return advanced;
}

function validFiles(formData: FormData, key: string) {
  return formData.getAll(key).filter((item): item is File => item instanceof File && item.size > 0);
}

async function revalidatePage(routePath: string, pageId?: string) {
  revalidateTag("all-pages", "max");
  revalidateTag(`page-${routePath}`, "max");
  revalidatePath(routePath);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/pages");
  if (pageId) revalidatePath(`/admin/pages/${pageId}/edit`);
}

async function updateMediaAlt(
  supabase: SupabaseServerClient,
  mediaId: string | null,
  altText: string,
) {
  if (!mediaId || !altText) return;
  const { error } = await supabase.from("media_assets").update({ alt_text: altText }).eq("id", mediaId);
  if (error) throw new Error(error.message);
}

async function getSectionContext(supabase: SupabaseServerClient, sectionId: string) {
  const { data, error } = await supabase
    .from("page_sections")
    .select("id, section_key, page_id, pages!inner(route_path)")
    .eq("id", sectionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Page section was not found.");
  const page = Array.isArray(data.pages) ? data.pages[0] : data.pages;
  return { ...data, routePath: page?.route_path ?? "" };
}

async function getBlockContext(supabase: SupabaseServerClient, blockId: string) {
  const { data, error } = await supabase
    .from("page_blocks")
    .select("id, section_id, page_sections!inner(section_key, page_id, pages!inner(route_path))")
    .eq("id", blockId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Page block was not found.");
  const section = Array.isArray(data.page_sections) ? data.page_sections[0] : data.page_sections;
  const page = Array.isArray(section?.pages) ? section.pages[0] : section?.pages;
  return {
    blockId: data.id,
    sectionId: data.section_id,
    sectionKey: section?.section_key ?? "",
    pageId: section?.page_id ?? "",
    routePath: page?.route_path ?? "",
  };
}

function assertEditorContext(
  context: { pageId: string; routePath: string },
  pageId: string,
  routePath: string,
) {
  if (context.pageId !== pageId || context.routePath !== routePath) {
    throw new Error("Page content changed. Refresh the editor and try again.");
  }
}

async function validateHomeBlock({
  supabase,
  sectionKey,
  routePath,
  formData,
  mediaId,
  blockId,
}: {
  supabase: SupabaseServerClient;
  sectionKey: string;
  routePath: string;
  formData: FormData;
  mediaId: string | null;
  blockId?: string;
}) {
  if (routePath !== "/") return;
  const definition = getHomeSectionDefinition(sectionKey);
  if (!definition) throw new Error(`Unsupported homepage section type: ${sectionKey}.`);
  if (!definition.supportsBlocks) throw new Error(`${definition.label} does not support content blocks.`);

  const status = field(formData, "status") as ContentStatus;
  if (status !== "published") return;

  const title = field(formData, "title");
  const body = field(formData, "body");
  const linkUrl = optionalField(formData, "link_url");
  const linkKind = (optionalField(formData, "link_kind") as LinkKind | null);
  const hasPendingGallery = validFiles(formData, "project_gallery_files").length > 0;
  let hasExistingGallery = false;
  if (blockId && definition.supportsGallery) {
    const { count } = await supabase
      .from("page_block_media")
      .select("id", { count: "exact", head: true })
      .eq("page_block_id", blockId);
    hasExistingGallery = Boolean(count);
  }

  if (definition.kind === "stats" && (!title || !body)) {
    throw new Error("Published stats require a number and a clear label.");
  }
  if (definition.kind === "partners" && (!title || !mediaId)) {
    throw new Error("Published partners require a partner name and logo image.");
  }
  if (definition.kind === "projects") {
    if (!title || !body || !linkUrl) {
      throw new Error("Published projects require a name, useful summary, and destination link.");
    }
    validateLink(linkUrl, linkKind ?? "internal", "Project link");
    if (!mediaId && !hasPendingGallery && !hasExistingGallery) {
      throw new Error("Published projects require at least one project image.");
    }
  }
  if (definition.kind === "listings") {
    const listingId = field(formData, "listing_id");
    if (!listingId) throw new Error("Choose a real listing before publishing this featured listing.");
    const { data: listing, error } = await supabase
      .from("real_estate_listings")
      .select("id, status, noindex")
      .eq("id", listingId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!listing || listing.status !== "published" || listing.noindex) {
      throw new Error("A published homepage feature must reference a published, indexable listing.");
    }
  }
  if (definition.kind === "gallery" && (!title || !mediaId)) {
    throw new Error("Published gallery items require a title and image.");
  }
  if (definition.kind === "awards" && (!title || !body || !mediaId)) {
    throw new Error("Published recognition items require a title, description, and supporting image.");
  }
  if (definition.kind === "stories") {
    if (!title || !body) throw new Error("Published stories require a title and visible summary.");
    if (linkUrl) validateLink(linkUrl, "external", "Story video URL");
  }
  if (definition.kind === "testimonials" && (!title || !body)) {
    throw new Error("Published testimonials require a client name and quote.");
  }
}

async function appendBlockGalleryMedia({
  supabase,
  blockId,
  files,
  title,
}: {
  supabase: SupabaseServerClient;
  blockId: string;
  files: File[];
  title: string;
}) {
  if (!files.length) return;

  const { data: latest } = await supabase.from("page_block_media")
    .select("sort_order")
    .eq("page_block_id", blockId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { count } = await supabase.from("page_block_media")
    .select("id", { count: "exact", head: true })
    .eq("page_block_id", blockId);
  const baseSort = Number(latest?.sort_order ?? 0);
  const existingCount = count ?? 0;
  const createdMediaIds: string[] = [];
  const createdRelationIds: string[] = [];

  try {
    for (const [index, file] of files.entries()) {
      if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not a supported image file.`);
      const media = await createUploadedMediaAsset({
        bucket: "site-assets",
        ownerId: `pages/blocks/${blockId}/gallery`,
        file,
        title: `${title} project image ${existingCount + index + 1}`,
        altText: `${title} project image ${existingCount + index + 1}`,
      });
      if (!media?.id) continue;
      createdMediaIds.push(media.id);

      const { data: relation, error } = await supabase
        .from("page_block_media")
        .insert({
          page_block_id: blockId,
          media_id: media.id,
          sort_order: baseSort + ((index + 1) * 10),
          is_primary: existingCount === 0 && index === 0,
          caption: title,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      createdRelationIds.push(relation.id);
    }
  } catch (error) {
    if (createdRelationIds.length) {
      await supabase.from("page_block_media").delete().in("id", createdRelationIds);
    }
    for (const mediaId of createdMediaIds) {
      await discardUnattachedMediaAsset(mediaId);
    }
    throw error;
  }
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
  removeField,
  altField,
  formData,
}: {
  ownerId: string;
  title: string;
  fileField: string;
  urlField: string;
  existingField: string;
  removeField: string;
  altField?: string;
  formData: FormData;
}): Promise<ResolvedPageMedia> {
  if (formData.get(removeField) === "true") {
    return { id: null, created: false };
  }

  const uploaded = formData.get(fileField);
  const altText = (altField ? field(formData, altField) : "") || title;
  if (uploaded instanceof File && uploaded.size > 0) {
    if (!uploaded.type.startsWith("image/")) throw new Error("Only image files are supported here.");
    const media = await createUploadedMediaAsset({
      bucket: "site-assets",
      ownerId,
      file: uploaded,
      title,
      altText,
    });
    return { id: media?.id ?? null, created: Boolean(media?.id) };
  }

  const imageUrl = String(formData.get(urlField) || "").trim();
  if (imageUrl) {
    const media = await createExternalMediaAsset({
      sourceType: "external",
      mediaType: "image",
      url: imageUrl,
      title,
      altText,
      thumbnailUrl: imageUrl,
    });
    return { id: media?.id ?? null, created: Boolean(media?.id) };
  }

  const existing = String(formData.get(existingField) || "").trim();
  return { id: existing || null, created: false };
}

export async function createPage(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.from("pages").insert(await payload(formData)).select("id, route_path").single();
  if (error) throw new Error(error.message);
  revalidateTag("all-pages", "max");
  revalidateTag(`page-${data.route_path}`, "max");
  revalidatePath(data.route_path);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${data.id}/edit`);
}

export async function updatePage(id: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const next = await payload(formData);
  const { data: existing } = await supabase
    .from("pages")
    .select("route_path, page_key")
    .eq("id", id)
    .maybeSingle();
  if (!existing) throw new Error("Page was not found.");
  if (existing.route_path === "/") {
    next.route_path = "/";
    next.page_key = existing.page_key;
    next.status = "published";
    next.noindex = false;
    next.published_at = next.published_at || new Date().toISOString();
  }
  const { error } = await supabase.from("pages").update(next).eq("id", id);
  if (error) throw new Error(error.message);
  if (existing?.route_path && existing.route_path !== next.route_path) {
    await recordRedirect(existing.route_path, next.route_path, 301);
    revalidateTag(`page-${existing.route_path}`, "max");
    revalidatePath(existing.route_path);
  }
  revalidateTag("all-pages", "max");
  revalidateTag(`page-${next.route_path}`, "max");
  revalidatePath(next.route_path);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function deletePage(id: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { data: existing } = await supabase.from("pages").select("route_path").eq("id", id).maybeSingle();
  if (!existing) throw new Error("Page was not found.");
  if (existing.route_path === "/") throw new Error("The production homepage cannot be deleted.");
  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag("all-pages", "max");
  if (existing?.route_path) {
    revalidateTag(`page-${existing.route_path}`, "max");
    revalidatePath(existing.route_path);
  }
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function createPageSection(pageId: string, routePath: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = crypto.randomUUID();
  const heading = field(formData, "heading");
  const sectionKey = slugify(field(formData, "section_key") || "section");
  const { data: page, error: pageError } = await supabase.from("pages").select("route_path").eq("id", pageId).maybeSingle();
  if (pageError) throw new Error(pageError.message);
  if (!page) throw new Error("Page was not found.");
  if (page.route_path !== routePath) throw new Error("Page route changed. Refresh the editor and try again.");

  const definition = page.route_path === "/" ? getHomeSectionDefinition(sectionKey) : null;
  if (page.route_path === "/" && !definition) throw new Error(`Unsupported homepage section type: ${sectionKey}.`);
  if (page.route_path === "/") {
    const { count } = await supabase
      .from("page_sections")
      .select("id", { count: "exact", head: true })
      .eq("page_id", pageId)
      .eq("section_key", sectionKey);
    if (count) throw new Error(`${definition?.label ?? sectionKey} already exists on the homepage.`);
  }

  const resolvedMedia = definition?.supportsSectionMedia
    ? await resolvePageMedia({
        ownerId: `pages/sections/${id}`,
        title: heading || sectionKey,
        fileField: "section_media",
        urlField: "section_media_url",
        existingField: "existing_section_media_id",
        removeField: "remove_section_media",
        altField: "section_media_alt",
        formData,
      })
    : { id: null, created: false };

  const { error } = await supabase.from("page_sections").insert({
    id,
    page_id: pageId,
    section_key: sectionKey,
    eyebrow: String(formData.get("eyebrow") || "") || null,
    heading: heading || null,
    subheading: String(formData.get("subheading") || "") || null,
    body: String(formData.get("body") || "") || null,
    sort_order: Number(formData.get("sort_order") || 0),
    status: String(formData.get("status") || "draft") as ContentStatus,
    media_id: resolvedMedia.id,
  });

  if (error) {
    if (resolvedMedia.created && resolvedMedia.id) await discardUnattachedMediaAsset(resolvedMedia.id);
    throw new Error(error.message);
  }
  await updateMediaAlt(supabase, resolvedMedia.id, field(formData, "section_media_alt"));
  revalidateTag("all-pages", "max");
  revalidateTag(`page-${routePath}`, "max");
  revalidatePath(routePath);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${pageId}/edit`);
}

export async function updatePageSection(id: string, routePath: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const heading = field(formData, "heading");
  const context = await getSectionContext(supabase, id);
  if (context.routePath !== routePath) throw new Error("Page route changed. Refresh the editor and try again.");
  const definition = context.routePath === "/" ? getHomeSectionDefinition(context.section_key) : null;
  const resolvedMedia = definition?.supportsSectionMedia || context.routePath !== "/"
    ? await resolvePageMedia({
        ownerId: `pages/sections/${id}`,
        title: heading || context.section_key,
        fileField: "section_media",
        urlField: "section_media_url",
        existingField: "existing_section_media_id",
        removeField: "remove_section_media",
        altField: "section_media_alt",
        formData,
      })
    : { id: optionalField(formData, "existing_section_media_id"), created: false };

  const { error } = await supabase
    .from("page_sections")
    .update({
      eyebrow: String(formData.get("eyebrow") || "") || null,
      heading: heading || null,
      subheading: String(formData.get("subheading") || "") || null,
      body: String(formData.get("body") || "") || null,
      sort_order: Number(formData.get("sort_order") || 0),
      status: String(formData.get("status") || "draft") as ContentStatus,
      media_id: resolvedMedia.id,
    })
    .eq("id", id);

  if (error) {
    if (resolvedMedia.created && resolvedMedia.id) await discardUnattachedMediaAsset(resolvedMedia.id);
    throw new Error(error.message);
  }
  await updateMediaAlt(supabase, resolvedMedia.id, field(formData, "section_media_alt"));
  revalidateTag("all-pages", "max");
  revalidateTag(`page-${routePath}`, "max");
  revalidatePath(routePath);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${context.page_id}/edit`);
}

export async function deletePageSection(id: string, pageId: string, routePath: string) {
  await assertAdmin();
  const supabase = await createClient();
  const context = await getSectionContext(supabase, id);
  if (context.page_id !== pageId || context.routePath !== routePath) {
    throw new Error("Page section changed. Refresh the editor and try again.");
  }
  const { error } = await supabase.from("page_sections").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await revalidatePage(routePath, pageId);
  redirect(`/admin/pages/${pageId}/edit`);
}

export async function createPageBlock(sectionId: string, pageId: string, routePath: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = crypto.randomUUID();
  const title = field(formData, "title");
  const context = await getSectionContext(supabase, sectionId);
  if (context.page_id !== pageId || context.routePath !== routePath) {
    throw new Error("Page section changed. Refresh the editor and try again.");
  }
  const definition = context.routePath === "/" ? getHomeSectionDefinition(context.section_key) : null;
  if (context.routePath === "/" && !definition?.supportsBlocks) {
    throw new Error(`${definition?.label ?? context.section_key} does not support content blocks.`);
  }
  const resolvedMedia = definition?.supportsBlockMedia || context.routePath !== "/"
    ? await resolvePageMedia({
        ownerId: `pages/blocks/${id}`,
        title: title || field(formData, "block_key") || "Page block image",
        fileField: "block_media",
        urlField: "block_media_url",
        existingField: "existing_block_media_id",
        removeField: "remove_block_media",
        altField: "block_media_alt",
        formData,
      })
    : { id: null, created: false };

  await validateHomeBlock({
    supabase,
    sectionKey: context.section_key,
    routePath: context.routePath,
    formData,
    mediaId: resolvedMedia.id,
  });

  const { error } = await supabase.from("page_blocks").insert({
    id,
    section_id: context.id,
    block_key: slugify(String(formData.get("block_key") || title || "block")),
    title: title || null,
    body: String(formData.get("body") || "") || null,
    link_label: String(formData.get("link_label") || "") || null,
    link_url: String(formData.get("link_url") || "") || null,
    link_kind: (String(formData.get("link_kind") || "") || null) as LinkKind | null,
    icon_name: String(formData.get("icon_name") || "") || null,
    attributes: blockAttributesFromForm(formData, context.section_key),
    sort_order: Number(formData.get("sort_order") || 0),
    status: String(formData.get("status") || "draft") as ContentStatus,
    media_id: resolvedMedia.id,
    listing_id: definition?.kind === "listings" ? optionalField(formData, "listing_id") : null,
  });

  if (error) {
    if (resolvedMedia.created && resolvedMedia.id) await discardUnattachedMediaAsset(resolvedMedia.id);
    throw new Error(error.message);
  }
  await updateMediaAlt(supabase, resolvedMedia.id, field(formData, "block_media_alt"));
  try {
    await appendBlockGalleryMedia({
      supabase,
      blockId: id,
      files: validFiles(formData, "project_gallery_files"),
      title: title || String(formData.get("block_key") || "Project"),
    });
  } catch (error) {
    await supabase.from("page_blocks").delete().eq("id", id);
    if (resolvedMedia.created && resolvedMedia.id) await discardUnattachedMediaAsset(resolvedMedia.id);
    throw error;
  }
  await revalidatePage(routePath, pageId);
  redirect(`/admin/pages/${pageId}/edit`);
}

export async function updatePageBlock(id: string, pageId: string, routePath: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const title = field(formData, "title");
  const { data: existing, error: existingError } = await supabase
    .from("page_blocks")
    .select("id, section_id, media_id")
    .eq("id", id)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (!existing) throw new Error("Page block was not found.");
  const context = await getSectionContext(supabase, existing.section_id);
  if (context.page_id !== pageId || context.routePath !== routePath) {
    throw new Error("Page block changed. Refresh the editor and try again.");
  }
  const definition = context.routePath === "/" ? getHomeSectionDefinition(context.section_key) : null;
  const resolvedMedia = definition?.supportsBlockMedia || context.routePath !== "/"
    ? await resolvePageMedia({
        ownerId: `pages/blocks/${id}`,
        title: title || field(formData, "block_key") || "Page block image",
        fileField: "block_media",
        urlField: "block_media_url",
        existingField: "existing_block_media_id",
        removeField: "remove_block_media",
        altField: "block_media_alt",
        formData,
      })
    : { id: existing.media_id, created: false };

  await validateHomeBlock({
    supabase,
    sectionKey: context.section_key,
    routePath: context.routePath,
    formData,
    mediaId: resolvedMedia.id,
    blockId: id,
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
      attributes: blockAttributesFromForm(formData, context.section_key),
      sort_order: Number(formData.get("sort_order") || 0),
      status: String(formData.get("status") || "draft") as ContentStatus,
      media_id: resolvedMedia.id,
      listing_id: definition?.kind === "listings" ? optionalField(formData, "listing_id") : null,
    })
    .eq("id", id);

  if (error) {
    if (resolvedMedia.created && resolvedMedia.id) await discardUnattachedMediaAsset(resolvedMedia.id);
    throw new Error(error.message);
  }
  await updateMediaAlt(supabase, resolvedMedia.id, field(formData, "block_media_alt"));
  await revalidatePage(routePath, pageId);
  redirect(`/admin/pages/${pageId}/edit`);
}

export async function deletePageBlock(id: string, pageId: string, routePath: string) {
  await assertAdmin();
  const supabase = await createClient();
  const context = await getBlockContext(supabase, id);
  assertEditorContext(context, pageId, routePath);
  const { error } = await supabase.from("page_blocks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await revalidatePage(routePath, pageId);
  redirect(`/admin/pages/${pageId}/edit`);
}

export async function uploadPageBlockGalleryMedia(blockId: string, pageId: string, routePath: string, formData: FormData) {
  await assertAdmin();
  const files = validFiles(formData, "project_gallery_files");
  if (!files.length) throw new Error("Choose at least one image to upload.");
  const title = String(formData.get("project_title") || "Project").trim();
  const supabase = await createClient();
  const context = await getBlockContext(supabase, blockId);
  assertEditorContext(context, pageId, routePath);
  if (context.sectionKey !== "featured-projects") throw new Error("Only featured projects support image galleries.");
  await appendBlockGalleryMedia({ supabase, blockId, files, title });
  await revalidatePage(routePath, pageId);
  redirect(`/admin/pages/${pageId}/edit`);
}

export async function updatePageBlockGalleryMedia(relationId: string, pageId: string, routePath: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const { data: relation, error: relationError } = await supabase.from("page_block_media")
    .select("id, page_block_id, media_id")
    .eq("id", relationId)
    .maybeSingle();
  if (relationError) throw new Error(relationError.message);
  if (!relation) throw new Error("Project image relation was not found.");
  const context = await getBlockContext(supabase, relation.page_block_id);
  assertEditorContext(context, pageId, routePath);
  if (context.sectionKey !== "featured-projects") throw new Error("Only featured projects support image galleries.");

  const makePrimary = formData.get("is_primary") === "true";
  const caption = String(formData.get("caption") || "").trim();
  const { error: relationUpdateError } = await supabase.from("page_block_media")
    .update({
      caption: caption || null,
      sort_order: Number(formData.get("sort_order") || 0),
      is_primary: makePrimary,
    })
    .eq("id", relationId);
  if (relationUpdateError) throw new Error(relationUpdateError.message);

  if (makePrimary) {
    const { error: resetError } = await supabase
      .from("page_block_media")
      .update({ is_primary: false })
      .eq("page_block_id", relation.page_block_id)
      .neq("id", relationId);
    if (resetError) throw new Error(resetError.message);
  }

  const { error: mediaUpdateError } = await supabase
    .from("media_assets")
    .update({
      title: String(formData.get("media_title") || "").trim() || null,
      alt_text: String(formData.get("alt_text") || "").trim() || null,
      caption: caption || null,
    })
    .eq("id", relation.media_id);
  if (mediaUpdateError) throw new Error(mediaUpdateError.message);

  await revalidatePage(routePath, pageId);
  redirect(`/admin/pages/${pageId}/edit`);
}

export async function deletePageBlockGalleryMedia(relationId: string, pageId: string, routePath: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { data: relation, error: relationError } = await supabase.from("page_block_media")
    .select("id, page_block_id, is_primary")
    .eq("id", relationId)
    .maybeSingle();
  if (relationError) throw new Error(relationError.message);
  if (!relation) throw new Error("Project image relation was not found.");
  const context = await getBlockContext(supabase, relation.page_block_id);
  assertEditorContext(context, pageId, routePath);
  if (context.sectionKey !== "featured-projects") throw new Error("Only featured projects support image galleries.");

  const { error: deleteError } = await supabase.from("page_block_media").delete().eq("id", relationId);
  if (deleteError) throw new Error(deleteError.message);

  if (relation.is_primary) {
    const { data: nextPrimary } = await supabase.from("page_block_media")
      .select("id")
      .eq("page_block_id", relation.page_block_id)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (nextPrimary?.id) {
      const { error: primaryError } = await supabase.from("page_block_media")
        .update({ is_primary: true })
        .eq("id", nextPrimary.id);
      if (primaryError) throw new Error(primaryError.message);
    }
  }

  await revalidatePage(routePath, pageId);
  redirect(`/admin/pages/${pageId}/edit`);
}
