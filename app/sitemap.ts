import type { MetadataRoute } from "next";
import { getAllPublishedListings } from "@/lib/db/listings";
import { getPublishedUpdates } from "@/lib/db/updates";

const SITE_URL = "https://estatebrothers.pk";
const BUILD_DATE = new Date().toISOString();
const URLS_PER_SITEMAP = 45000;

export async function generateSitemaps() {
  const listings = await getAllPublishedListings();
  const chunks = Math.ceil(listings.length / URLS_PER_SITEMAP) || 1;
  return Array.from({ length: chunks }, (_, i) => ({ id: i }));
}

export default async function sitemap({ id = 0 }: { id?: number }): Promise<MetadataRoute.Sitemap> {
  let staticRoutes: MetadataRoute.Sitemap = [];
  let updateRoutes: MetadataRoute.Sitemap = [];

  // Only include static pages and updates in the first sitemap chunk
  if (id === 0) {
    staticRoutes = [
      { url: SITE_URL, lastModified: BUILD_DATE, changeFrequency: "weekly", priority: 1 },
      { url: `${SITE_URL}/buy-sell`, lastModified: BUILD_DATE, changeFrequency: "daily", priority: 0.9 },
      { url: `${SITE_URL}/about`, lastModified: BUILD_DATE, changeFrequency: "monthly", priority: 0.8 },
      { url: `${SITE_URL}/updates`, lastModified: BUILD_DATE, changeFrequency: "weekly", priority: 0.7 },
      { url: `${SITE_URL}/contact`, lastModified: BUILD_DATE, changeFrequency: "monthly", priority: 0.6 },
    ];
    
    const updates = await getPublishedUpdates();
    updateRoutes = updates.map((update) => ({
      url: `${SITE_URL}${update.canonicalPath ?? `/updates/${update.slug}`}`,
      lastModified: update.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  }

  // Chunk the listings array based on the requested sitemap id
  const allListings = await getAllPublishedListings();
  const start = id * URLS_PER_SITEMAP;
  const chunkedListings = allListings.slice(start, start + URLS_PER_SITEMAP);

  const listingRoutes: MetadataRoute.Sitemap = chunkedListings
    .filter((listing) => !listing.noindex)
    .map((listing) => ({
      url: `${SITE_URL}/buy-sell/${listing.type}/${listing.slug}`,
      lastModified: listing.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
      ...(listing.type === "house" && listing.gallery.length
        ? { images: listing.gallery.map((image) => (image.startsWith("http") ? image : `${SITE_URL}${image}`)) }
        : {}),
    }));

  return [...staticRoutes, ...updateRoutes, ...listingRoutes];
}
