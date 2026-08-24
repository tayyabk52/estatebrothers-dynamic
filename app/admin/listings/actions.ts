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

function nullableString(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
}

function listingAvailability(formData: FormData, fallback = "available") {
  return String(formData.get("availability") || fallback).trim() || fallback;
}

function revalidateListingSurfaces(path?: string | null) {
  revalidateTag("all-listings", "max");
  revalidatePath("/admin/listings");
  revalidatePath("/buy-sell");
  revalidatePath("/sitemap.xml");
  if (path) revalidatePath(path);
}

export async function createListing(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const listingTypeSlug = formData.get("listing_type_slug") as string;
  const title = formData.get("title") as string;
  const slug = slugify((formData.get("slug") as string) || title);
  const canonicalPath = `/buy-sell/${listingTypeSlug}/${slug}`;
  const status = formData.get("status") as ContentStatus;
  const metaDescription = (formData.get("meta_description") as string) || null;

  if (status === "published" && !metaDescription) {
    throw new Error("Meta description is required before publishing a listing.");
  }

  const { data, error } = await supabase
    .from("real_estate_listings")
    .insert({
      listing_type_slug: listingTypeSlug,
      title,
      slug,
      canonical_path: canonicalPath,
      availability: listingAvailability(formData),
      contact_person_id: nullableString(formData.get("contact_person_id")),
      phase: (formData.get("phase") as string) || null,
      city: (formData.get("city") as string) || null,
      block: (formData.get("block") as string) || null,
      project: (formData.get("project") as string) || null,
      size_label: (formData.get("size_label") as string) || null,
      area_value: formData.get("area_value") ? Number(formData.get("area_value")) : null,
      area_unit: (formData.get("area_unit") as string) || null,
      price_label: (formData.get("price_label") as string) || "On Call",
      price_numeric: formData.get("price_numeric") ? Number(formData.get("price_numeric")) : null,
      bedrooms: formData.get("bedrooms") ? Number(formData.get("bedrooms")) : null,
      bathrooms: formData.get("bathrooms") ? Number(formData.get("bathrooms")) : null,
      listing_status: (formData.get("listing_status") as string) || null,
      summary: (formData.get("summary") as string) || null,
      description: (formData.get("description") as string) || null,
      meta_title: (formData.get("meta_title") as string) || title,
      meta_description: metaDescription,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  await attachListingMedia(data.id, formData);
  revalidateListingSurfaces(canonicalPath);
  redirect(`/admin/listings/${data.id}/edit`);
}

import { recordRedirect } from "@/lib/db/redirects";

export async function updateListing(id: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const status = formData.get("status") as ContentStatus;
  const metaDescription = (formData.get("meta_description") as string) || null;

  if (status === "published" && !metaDescription) {
    throw new Error("Meta description is required before publishing a listing.");
  }

  const { data: existing } = await supabase
    .from("real_estate_listings")
    .select("slug, listing_type_slug, canonical_path, availability")
    .eq("id", id)
    .single();

  const title = formData.get("title") as string;
  const rawSlug = formData.get("slug") as string | null;
  const newSlug = rawSlug ? slugify(rawSlug) : (existing?.slug ?? slugify(title));
  const listingTypeSlug = (formData.get("listing_type_slug") as string) || existing?.listing_type_slug || "plot";
  const newCanonicalPath = `/buy-sell/${listingTypeSlug}/${newSlug}`;

  const { error } = await supabase
    .from("real_estate_listings")
    .update({
      title,
      slug: newSlug,
      canonical_path: newCanonicalPath,
      listing_type_slug: listingTypeSlug,
      availability: listingAvailability(formData, existing?.availability ?? "available"),
      contact_person_id: nullableString(formData.get("contact_person_id")),
      phase: (formData.get("phase") as string) || null,
      city: (formData.get("city") as string) || null,
      block: (formData.get("block") as string) || null,
      project: (formData.get("project") as string) || null,
      size_label: (formData.get("size_label") as string) || null,
      area_value: formData.get("area_value") ? Number(formData.get("area_value")) : null,
      area_unit: (formData.get("area_unit") as string) || null,
      price_label: (formData.get("price_label") as string) || "On Call",
      price_numeric: formData.get("price_numeric") ? Number(formData.get("price_numeric")) : null,
      bedrooms: formData.get("bedrooms") ? Number(formData.get("bedrooms")) : null,
      bathrooms: formData.get("bathrooms") ? Number(formData.get("bathrooms")) : null,
      listing_status: (formData.get("listing_status") as string) || null,
      summary: (formData.get("summary") as string) || null,
      description: (formData.get("description") as string) || null,
      meta_title: (formData.get("meta_title") as string) || null,
      meta_description: metaDescription,
      status,
      published_at: status === "published" ? (formData.get("published_at") as string) || new Date().toISOString() : null,
      noindex: formData.get("noindex") === "true",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  if (existing?.canonical_path && existing.canonical_path !== newCanonicalPath) {
    await recordRedirect(existing.canonical_path, newCanonicalPath, 301);
    revalidateTag(`listing-${existing.slug}`, "max");
    revalidatePath(existing.canonical_path);
  }

  await attachListingMedia(id, formData);
  revalidateTag(`listing-${newSlug}`, "max");
  revalidateListingSurfaces(newCanonicalPath);
  redirect("/admin/listings");
}

async function attachListingMedia(listingId: string, formData: FormData) {
  const supabase = await createClient();
  const files = formData.getAll("listing_media").filter((item): item is File => item instanceof File && item.size > 0);
  let sort = Number(formData.get("media_sort_start") || 0);

  for (const file of files) {
    const asset = await createUploadedMediaAsset({
      bucket: "listing-media",
      ownerId: listingId,
      file,
      altText: (formData.get("media_alt_text") as string) || null,
      title: (formData.get("media_title") as string) || null,
    });
    if (!asset) continue;
    const { error } = await supabase.from("listing_media").insert({
      listing_id: listingId,
      media_id: asset.id,
      sort_order: sort++,
      is_primary: formData.get("media_primary") === "true",
      is_gallery_item: true,
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
      const { error } = await supabase.from("listing_media").insert({
        listing_id: listingId,
        media_id: asset.id,
        sort_order: sort,
        is_primary: false,
        is_gallery_item: true,
        is_og_candidate: false,
      });
      if (error) throw new Error(error.message);
    }
  }
}

export async function updateListingMediaItem(listingId: string, relationId: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();
  const { data: relation, error: relationError } = await supabase
    .from("listing_media")
    .select("media_id, real_estate_listings(slug, canonical_path)")
    .eq("id", relationId)
    .eq("listing_id", listingId)
    .single();
  if (relationError) throw new Error(relationError.message);

  const isPrimary = formData.get("is_primary") === "true";
  const isOgCandidate = formData.get("is_og_candidate") === "true";

  if (isPrimary) {
    const { error } = await supabase.from("listing_media").update({ is_primary: false }).eq("listing_id", listingId);
    if (error) throw new Error(error.message);
  }
  if (isOgCandidate) {
    const { error } = await supabase.from("listing_media").update({ is_og_candidate: false }).eq("listing_id", listingId);
    if (error) throw new Error(error.message);
  }

  const { error: updateError } = await supabase
    .from("listing_media")
    .update({
      sort_order: Number(formData.get("sort_order") || 0),
      is_primary: isPrimary,
      is_gallery_item: formData.get("is_gallery_item") === "true",
      is_og_candidate: isOgCandidate,
    })
    .eq("id", relationId)
    .eq("listing_id", listingId);
  if (updateError) throw new Error(updateError.message);

  const { error: assetError } = await supabase
    .from("media_assets")
    .update({
      title: nullableString(formData.get("media_title")),
      alt_text: nullableString(formData.get("media_alt_text")),
    })
    .eq("id", relation.media_id);
  if (assetError) throw new Error(assetError.message);

  const listing = Array.isArray(relation.real_estate_listings)
    ? relation.real_estate_listings[0]
    : relation.real_estate_listings;
  if (listing?.slug) revalidateTag(`listing-${listing.slug}`, "max");
  revalidatePath(`/admin/listings/${listingId}/edit`);
  revalidateListingSurfaces(listing?.canonical_path);
}

export async function removeListingMediaItem(listingId: string, relationId: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { data: relation, error: relationError } = await supabase
    .from("listing_media")
    .select("real_estate_listings(slug, canonical_path)")
    .eq("id", relationId)
    .eq("listing_id", listingId)
    .single();
  if (relationError) throw new Error(relationError.message);
  const { error } = await supabase.from("listing_media").delete().eq("id", relationId).eq("listing_id", listingId);
  if (error) throw new Error(error.message);

  const listing = Array.isArray(relation.real_estate_listings)
    ? relation.real_estate_listings[0]
    : relation.real_estate_listings;
  if (listing?.slug) revalidateTag(`listing-${listing.slug}`, "max");
  revalidatePath(`/admin/listings/${listingId}/edit`);
  revalidateListingSurfaces(listing?.canonical_path);
}

export async function deleteListing(id: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("real_estate_listings")
    .select("canonical_path, slug")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("real_estate_listings").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (existing?.slug) revalidateTag(`listing-${existing.slug}`, "max");
  revalidateListingSurfaces(existing?.canonical_path);
  redirect("/admin/listings");
}
