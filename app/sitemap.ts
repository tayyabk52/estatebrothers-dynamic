import type { MetadataRoute } from "next";
import { plotListings, houseListings } from "@/data/inventory";

const SITE_URL = "https://estatebrothers.pk";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/buy-sell`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/updates`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const plotRoutes: MetadataRoute.Sitemap = plotListings.map((listing) => ({
    url: `${SITE_URL}/buy-sell/plot/${listing.slug}`,
    lastModified: listing.updatedAt ? new Date(listing.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const houseRoutes: MetadataRoute.Sitemap = houseListings.map((listing) => ({
    url: `${SITE_URL}/buy-sell/house/${listing.slug}`,
    lastModified: listing.updatedAt ? new Date(listing.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...plotRoutes, ...houseRoutes];
}
