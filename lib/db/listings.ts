import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { assertAdmin } from "@/lib/admin/auth";
import type { NormalizedPlot, NormalizedHouse } from "@/lib/types";
import type { ListingRow } from "@/lib/supabase/types";

type ListingMediaJoin = {
  id: string;
  media_id: string;
  sort_order: number;
  is_primary: boolean;
  is_gallery_item: boolean;
  is_og_candidate: boolean;
  media_assets?: {
    public_url: string | null;
    external_url: string | null;
    thumbnail_url: string | null;
    title: string | null;
    alt_text: string | null;
    media_type: string;
    status: string;
  } | null;
};

export type ListingWithMedia = ListingRow & { listing_media?: ListingMediaJoin[] | null };

function assetImageUrl(asset?: ListingMediaJoin["media_assets"]) {
  if (!asset || asset.status !== "published") return null;
  if (asset.media_type === "image") return asset.public_url ?? asset.external_url ?? asset.thumbnail_url ?? null;
  return asset.thumbnail_url ?? null;
}

function listingImages(row: ListingWithMedia) {
  const media = [...(row.listing_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const gallery = media.filter((item) => item.is_gallery_item).map((item) => assetImageUrl(item.media_assets)).filter(Boolean) as string[];
  const primary = media.find((item) => item.is_primary);
  const og = media.find((item) => item.is_og_candidate);
  return {
    primary: assetImageUrl(primary?.media_assets) ?? row.thumbnail_url,
    og: assetImageUrl(og?.media_assets) ?? row.og_image ?? row.thumbnail_url,
    gallery: gallery.length ? gallery : row.thumbnail_url ? [row.thumbnail_url] : [],
  };
}

const LISTING_SELECT = "*, listing_media(*, media_assets(*))";

function rowToPlot(row: ListingWithMedia): NormalizedPlot {
  const images = listingImages(row);

  return {
    id: row.id,
    slug: row.slug,
    type: "plot",
    phase: row.phase,
    project: row.project,
    block: row.block,
    city: row.city,
    size: row.size_label,
    price: row.price_label,
    priceNumeric: row.price_numeric != null ? Number(row.price_numeric) : null,
    status: row.listing_status,
    availability: row.availability ?? row.listing_status,
    noindex: row.noindex ?? false,
    contactPersonId: row.contact_person_id,
    thumbnail: images.primary,
    gallery: images.gallery,
    ogImage: images.og,
    notes: row.summary,
    updatedAt: row.updated_at.slice(0, 10),
  };
}

function rowToHouse(row: ListingWithMedia): NormalizedHouse {
  const features = (row.features ?? {}) as {
    interior?: string[];
    exterior?: string[];
    tags?: string[];
    gallery?: string[];
  };
  const attributes = (row.attributes ?? {}) as { garageCapacity?: number };

  const images = listingImages(row);

  return {
    id: row.id,
    slug: row.slug,
    type: "house",
    title: row.title,
    phase: row.phase,
    city: row.city,
    size: row.size_label,
    price: row.price_label,
    priceNumeric: row.price_numeric != null ? Number(row.price_numeric) : null,
    status: row.listing_status,
    availability: row.availability ?? row.listing_status,
    noindex: row.noindex ?? false,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    contactPersonId: row.contact_person_id,
    thumbnail: images.primary,
    ogImage: images.og,
    gallery: images.gallery.length
      ? images.gallery
      : features.gallery?.length
      ? features.gallery
      : row.thumbnail_url
        ? [row.thumbnail_url]
        : [],
    features: {
      interior: features.interior,
      exterior: features.exterior,
      tags: features.tags,
    },
    specs: {
      garageCapacity: row.garage_capacity ?? attributes.garageCapacity ?? null,
    },
    location: {
      address: row.address_line,
      neighborhood: row.neighborhood,
      city: row.city,
      postalCode: row.postal_code,
    },
    notes: row.summary,
    updatedAt: row.updated_at.slice(0, 10),
  };
}

export async function getPublishedPlots(): Promise<NormalizedPlot[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("all-listings", "plots");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("real_estate_listings")
    .select(LISTING_SELECT)
    .eq("listing_type_slug", "plot")
    .eq("status", "published")
    .eq("noindex", false)
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });
  return ((data ?? []) as ListingWithMedia[]).map(rowToPlot);
}

export async function getPublishedHouses(): Promise<NormalizedHouse[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("all-listings", "houses");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("real_estate_listings")
    .select(LISTING_SELECT)
    .eq("listing_type_slug", "house")
    .eq("status", "published")
    .eq("noindex", false)
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });
  return ((data ?? []) as ListingWithMedia[]).map(rowToHouse);
}

export async function getListingBySlug(type: string, slug: string): Promise<NormalizedPlot | NormalizedHouse | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("all-listings", `listing-${slug}`);

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("real_estate_listings")
    .select(LISTING_SELECT)
    .eq("listing_type_slug", type)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return null;
  return type === "plot" ? rowToPlot(data) : rowToHouse(data);
}

export async function getAllPublishedListings() {
  "use cache";
  cacheLife("hours");
  cacheTag("all-listings");

  const [plots, houses] = await Promise.all([getPublishedPlots(), getPublishedHouses()]);
  return [...plots, ...houses];
}

// Admin: all listings regardless of status (not cached — always fresh)
export async function getAllListingsAdmin() {
  await assertAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("real_estate_listings")
    .select("id, slug, title, listing_type_slug, status, noindex, price_label, phase, city, published_at, updated_at")
    .order("updated_at", { ascending: false });
  return data ?? [];
}

export async function getListingByIdAdmin(id: string): Promise<ListingWithMedia | null> {
  await assertAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("real_estate_listings")
    .select(LISTING_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data as ListingWithMedia | null;
}
