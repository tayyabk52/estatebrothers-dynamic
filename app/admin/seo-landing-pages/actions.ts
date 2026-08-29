"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin/auth";
import { createExternalMediaAsset, createUploadedMediaAsset } from "@/lib/admin/media";
import { recordRedirect } from "@/lib/db/redirects";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import {
  cleanSeoCanonicalPath,
  isCleanSeoLandingPath,
  normalizeSeoLandingPath,
} from "@/lib/seo/landing-routes";

type ContentStatus = Database["public"]["Enums"]["content_status"];
type SeoLandingPageType = Database["public"]["Enums"]["seo_landing_page_type"];
type Json = Database["public"]["Tables"]["seo_landing_pages"]["Insert"]["filters"];

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(formData: FormData, key: string) {
  const value = textValue(formData, key);
  return value || null;
}

function parseKeywords(value: string) {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function parseFilters(value: string): Json {
  if (!value) return {};
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Filters must be a JSON object.");
  }
  return parsed as Json;
}

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function requireText(formData: FormData, key: string, label: string) {
  const value = textValue(formData, key);
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

function buildSlug(source: string) {
  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function validatePublishReadiness(input: {
  status: ContentStatus;
  noindex: boolean;
  title: string;
  heading: string;
  intro: string;
  body: string | null;
  metaTitle: string;
  metaDescription: string;
  listingTypeSlug: string | null;
  city: string | null;
  phase: string | null;
  neighborhood: string | null;
  showInFooter: boolean;
  showOnHome: boolean;
  showOnBuySell: boolean;
  publicLinkLabel: string | null;
}) {
  if (input.status !== "published") return;

  const missing = [
    ["title", input.title],
    ["heading", input.heading],
    ["intro", input.intro],
    ["body", input.body],
    ["meta title", input.metaTitle],
    ["meta description", input.metaDescription],
  ].filter(([, value]) => !value);

  if (missing.length) {
    throw new Error(`Published SEO pages need: ${missing.map(([label]) => label).join(", ")}.`);
  }

  if (!input.noindex) {
    if ((input.body ?? "").length < 700) {
      throw new Error("Indexable SEO landing pages need at least 700 characters of useful body content.");
    }
    if (input.intro.length < 80) {
      throw new Error("Indexable SEO landing pages need a specific intro of at least 80 characters.");
    }
    if (!input.listingTypeSlug && !input.city && !input.phase && !input.neighborhood) {
      throw new Error("Indexable SEO landing pages need at least one listing filter so the page has a clear purpose.");
    }
    if (!input.showInFooter && !input.showOnHome && !input.showOnBuySell) {
      throw new Error("Indexable SEO landing pages need at least one public placement so people and search engines can discover them through a normal site link.");
    }
    if (!input.publicLinkLabel) {
      throw new Error("Indexable SEO landing pages need a descriptive public link label.");
    }
  }
}

async function resolveMedia(formData: FormData, ownerId: string) {
  const heroFile = getFile(formData, "hero_media_file");
  const heroExternalUrl = nullableText(formData, "hero_external_url");
  const ogFile = getFile(formData, "og_media_file");
  const ogExternalUrl = nullableText(formData, "og_external_url");
  const heroAlt = nullableText(formData, "hero_alt_text");
  const ogAlt = nullableText(formData, "og_alt_text");
  const title = textValue(formData, "title");

  const [uploadedHero, uploadedOg] = await Promise.all([
    heroFile
      ? createUploadedMediaAsset({
          bucket: "site-assets",
          ownerId,
          file: heroFile,
          altText: heroAlt,
          title: heroAlt || title,
        })
      : null,
    ogFile
      ? createUploadedMediaAsset({
          bucket: "site-assets",
          ownerId,
          file: ogFile,
          altText: ogAlt || heroAlt,
          title: ogAlt || title,
        })
      : null,
  ]);

  const [externalHero, externalOg] = await Promise.all([
    !uploadedHero && heroExternalUrl
      ? createExternalMediaAsset({
          sourceType: "external",
          mediaType: "image",
          url: heroExternalUrl,
          title: title || null,
          altText: heroAlt,
        })
      : null,
    !uploadedOg && ogExternalUrl
      ? createExternalMediaAsset({
          sourceType: "external",
          mediaType: "image",
          url: ogExternalUrl,
          title: title || null,
          altText: ogAlt || heroAlt,
        })
      : null,
  ]);

  return {
    heroMediaId: formData.get("remove_hero_media") === "on"
      ? null
      : uploadedHero?.id ?? externalHero?.id ?? nullableText(formData, "existing_hero_media_id"),
    ogMediaId: formData.get("remove_og_media") === "on"
      ? null
      : uploadedOg?.id ?? externalOg?.id ?? nullableText(formData, "existing_og_media_id"),
  };
}

function buildPayload(formData: FormData) {
  const title = requireText(formData, "title", "Title");
  const heading = requireText(formData, "heading", "H1 heading");
  const intro = requireText(formData, "intro", "Intro");
  const metaTitle = requireText(formData, "meta_title", "Meta title");
  const metaDescription = requireText(formData, "meta_description", "Meta description");
  if (metaDescription.length > 180) {
    throw new Error("Meta description must be 180 characters or fewer.");
  }

  const rawSlug = textValue(formData, "slug") || title;
  const slug = buildSlug(rawSlug);
  const canonicalPath = normalizeSeoLandingPath(
    textValue(formData, "canonical_path") || cleanSeoCanonicalPath(slug)
  );
  if (!slug) throw new Error("A valid slug is required.");
  if (!isCleanSeoLandingPath(canonicalPath)) {
    throw new Error("Canonical path must be one clean public URL segment, like /dha-lahore-plots-for-sale.");
  }

  const status = (textValue(formData, "status") || "draft") as ContentStatus;
  const noindex = formData.get("noindex") === "on";
  const body = nullableText(formData, "body");
  const listingTypeSlug = nullableText(formData, "listing_type_slug");
  const city = nullableText(formData, "city");
  const phase = nullableText(formData, "phase");
  const neighborhood = nullableText(formData, "neighborhood");
  const showInFooter = formData.get("show_in_footer") === "on";
  const showOnHome = formData.get("show_on_home") === "on";
  const showOnBuySell = formData.get("show_on_buy_sell") === "on";
  const publicLinkLabel = nullableText(formData, "public_link_label") || title;

  validatePublishReadiness({
    status,
    noindex,
    title,
    heading,
    intro,
    body,
    metaTitle,
    metaDescription,
    listingTypeSlug,
    city,
    phase,
    neighborhood,
    showInFooter,
    showOnHome,
    showOnBuySell,
    publicLinkLabel,
  });

  return {
    title,
    slug,
    canonical_path: canonicalPath,
    page_type: (textValue(formData, "page_type") || "listing_category") as SeoLandingPageType,
    status,
    noindex,
    heading,
    intro,
    body,
    meta_title: metaTitle,
    meta_description: metaDescription,
    keywords: parseKeywords(textValue(formData, "keywords")),
    listing_type_slug: listingTypeSlug,
    city,
    phase,
    neighborhood,
    listing_status: nullableText(formData, "listing_status"),
    filters: parseFilters(textValue(formData, "filters_json")),
    show_in_footer: showInFooter,
    show_on_home: showOnHome,
    show_on_buy_sell: showOnBuySell,
    public_link_label: publicLinkLabel,
    public_link_description: nullableText(formData, "public_link_description"),
    sort_order: Number(textValue(formData, "sort_order") || "0") || 0,
    published_at: status === "published" ? textValue(formData, "published_at") || new Date().toISOString() : null,
  };
}

function revalidateSeoLanding(oldPath?: string | null, newPath?: string | null) {
  revalidateTag("seo-landing-pages", "max");
  revalidateTag("seo-pages", "max");
  revalidateTag("seo-url-rules", "max");
  if (oldPath) {
    revalidateTag(`seo-landing-${oldPath}`, "max");
    revalidateTag(`seo-page-${oldPath}`, "max");
    revalidatePath(oldPath);
  }
  if (newPath) {
    revalidateTag(`seo-landing-${newPath}`, "max");
    revalidateTag(`seo-page-${newPath}`, "max");
    revalidatePath(newPath);
  }
  revalidatePath("/sitemap.xml");
  revalidatePath("/");
  revalidatePath("/buy-sell");
  revalidatePath("/admin/seo-landing-pages");
}

export async function createSeoLandingPage(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const id = crypto.randomUUID();
  const payload = buildPayload(formData);
  const media = await resolveMedia(formData, `seo-landing-pages/${id}`);

  const { error } = await supabase.from("seo_landing_pages").insert({
    id,
    ...payload,
    hero_media_id: media.heroMediaId,
    og_media_id: media.ogMediaId,
  });
  if (error) throw new Error(error.message);

  revalidateSeoLanding(null, payload.canonical_path);
  redirect(`/admin/seo-landing-pages/${id}/edit`);
}

export async function updateSeoLandingPage(id: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("seo_landing_pages")
    .select("canonical_path")
    .eq("id", id)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (!existing) throw new Error("SEO landing page was not found.");

  const payload = buildPayload(formData);
  const media = await resolveMedia(formData, `seo-landing-pages/${id}`);
  const { error } = await supabase
    .from("seo_landing_pages")
    .update({
      ...payload,
      hero_media_id: media.heroMediaId,
      og_media_id: media.ogMediaId,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (existing.canonical_path !== payload.canonical_path) {
    await recordRedirect(existing.canonical_path, payload.canonical_path, 301);
  }

  revalidateSeoLanding(existing.canonical_path, payload.canonical_path);
  redirect(`/admin/seo-landing-pages/${id}/edit`);
}

export async function deleteSeoLandingPage(id: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("seo_landing_pages")
    .select("canonical_path")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("seo_landing_pages").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateSeoLanding(existing?.canonical_path, null);
  redirect("/admin/seo-landing-pages");
}
