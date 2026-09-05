import { NextResponse } from "next/server";
import { getAllPublishedListings } from "@/lib/db/listings";
import { getIndexableTeamProfiles } from "@/lib/db/team";
import { getPublishedUpdates } from "@/lib/db/updates";
import {
  getIndexableCmsPagesForSitemap,
  getIndexableSeoLandingPages,
} from "@/lib/db/seo";
import { isCleanSeoLandingPath } from "@/lib/seo/landing-routes";

const SITE_URL = "https://www.estatebrothers.pk";
const ALWAYS_PUBLIC_ROUTES = {
  "/buy-sell": { changeFrequency: "daily", priority: 0.9 },
  "/updates": { changeFrequency: "weekly", priority: 0.7 },
} as const;

const CMS_ROUTE_CONFIG = {
  "/about": { changeFrequency: "monthly", priority: 0.8 },
  "/contact": { changeFrequency: "monthly", priority: 0.6 },
} as const;

interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: string;
  priority?: number;
  images?: string[];
}

function absoluteUrl(path: string) {
  return path === "/" ? SITE_URL : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderEntry(entry: SitemapEntry) {
  const images = (entry.images ?? [])
    .map((image) => `    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`)
    .join("\n");

  return [
    "  <url>",
    `    <loc>${escapeXml(entry.url)}</loc>`,
    entry.lastModified ? `    <lastmod>${escapeXml(entry.lastModified)}</lastmod>` : "",
    entry.changeFrequency ? `    <changefreq>${entry.changeFrequency}</changefreq>` : "",
    entry.priority != null ? `    <priority>${entry.priority}</priority>` : "",
    images,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function GET() {
  const [cmsPages, updates, seoLandingPages, listings, teamProfiles] = await Promise.all([
    getIndexableCmsPagesForSitemap(),
    getPublishedUpdates(),
    getIndexableSeoLandingPages(),
    getAllPublishedListings(),
    getIndexableTeamProfiles(),
  ]);

  const cmsUpdatedAt = new Map(cmsPages.map((page) => [page.path, page.updatedAt]));
  const entries: SitemapEntry[] = [
    {
      url: absoluteUrl("/"),
      lastModified: cmsUpdatedAt.get("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...Object.entries(ALWAYS_PUBLIC_ROUTES).map(([path, config]) => ({
      url: absoluteUrl(path),
      changeFrequency: config.changeFrequency,
      priority: config.priority,
    })),
    ...Object.entries(CMS_ROUTE_CONFIG)
      .filter(([path]) => cmsUpdatedAt.has(path))
      .map(([path, config]) => ({
        url: absoluteUrl(path),
        lastModified: cmsUpdatedAt.get(path),
        changeFrequency: config.changeFrequency,
        priority: config.priority,
      })),
    ...updates.map((update) => ({
      url: absoluteUrl(update.canonicalPath ?? `/updates/${update.slug}`),
      lastModified: update.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
    ...seoLandingPages
      .filter((page) => isCleanSeoLandingPath(page.canonical_path))
      .map((page) => ({
        url: absoluteUrl(page.canonical_path),
        lastModified: page.updated_at.slice(0, 10),
        changeFrequency: "weekly",
        priority: 0.7,
      })),
    ...teamProfiles
      .filter((profile) => profile.profilePath)
      .map((profile) => ({
        url: absoluteUrl(profile.profilePath!),
        lastModified: profile.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
        images: profile.imageUrl
          ? [profile.imageUrl.startsWith("http") ? profile.imageUrl : `${SITE_URL}${profile.imageUrl}`]
          : undefined,
      })),
    ...listings
      .filter((listing) => !listing.noindex)
      .map((listing) => ({
        url: `${SITE_URL}/buy-sell/${listing.type}/${listing.slug}`,
        lastModified: listing.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
        images: listing.type === "house" && listing.gallery.length
          ? listing.gallery.map((image) => (image.startsWith("http") ? image : `${SITE_URL}${image}`))
          : undefined,
      })),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries.map(renderEntry),
    "</urlset>",
  ].join("\n");

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
