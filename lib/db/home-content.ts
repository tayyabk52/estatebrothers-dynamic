import type { PageSectionWithBlocks } from "@/lib/db/site";
import { mediaUrl } from "@/lib/db/site";
import type { NormalizedListing } from "@/lib/types";

interface JsonRecord {
  [key: string]: unknown;
}

export interface HomeStat {
  n: string;
  unit: string;
  l: string;
}

export interface HomePartner {
  name: string;
  image: string;
  alt: string;
}

export interface HomeTestimonial {
  quote: string;
  name: string;
  role: string;
  imageUrl?: string | null;
}

export interface HomeFeaturedProject {
  id: string;
  title: string;
  location: string;
  label: string;
  description: string;
  href: string;
  imageUrl?: string | null;
  alt: string;
  gallery: HomeProjectImage[];
}

export interface HomeFeaturedListing {
  id: string;
  listing: NormalizedListing;
  imageUrl?: string | null;
  alt: string;
}

export interface HomeProjectImage {
  id: string;
  imageUrl: string;
  alt: string;
  caption: string;
  isPrimary: boolean;
}

export interface HomeGalleryItem {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  alt: string;
  href?: string | null;
}

export interface HomeAward {
  id: string;
  title: string;
  description: string;
  category: string;
  issuer: string;
  imageUrl?: string | null;
  alt: string;
  referenceUrl?: string | null;
}

export interface HomeStory {
  id: string;
  title: string;
  summary: string;
  code: string;
  person: string;
  videoUrl?: string | null;
  imageUrl?: string | null;
  alt: string;
}

function section(pageSections: PageSectionWithBlocks[] | undefined, key: string) {
  return pageSections?.find((item) => item.section_key === key) ?? null;
}

function attrs(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function sectionByFirstKey(pageSections: PageSectionWithBlocks[] | undefined, keys: string[]) {
  for (const key of keys) {
    const found = section(pageSections, key);
    if (found) return found;
  }
  return null;
}

export function getHomeSection(pageSections: PageSectionWithBlocks[] | undefined, key: string) {
  return section(pageSections, key);
}

export function normalizeHomeStats(pageSections: PageSectionWithBlocks[] | undefined, key = "hero-stats"): HomeStat[] {
  const statsSection = section(pageSections, key);
  return (statsSection?.page_blocks ?? []).map((block) => {
    const data = attrs(block.attributes);
    return {
      n: text(data.n) || block.title || "",
      unit: text(data.unit) || block.icon_name || "",
      l: text(data.label) || block.body || "",
    };
  }).filter((stat) => stat.n && stat.l);
}

export function normalizePartners(pageSections: PageSectionWithBlocks[] | undefined): HomePartner[] {
  const partnersSection = section(pageSections, "partners");
  return (partnersSection?.page_blocks ?? []).map((block) => {
    const image = mediaUrl(block.media_assets);
    return {
      name: block.title || block.block_key || "Partner",
      image: image ?? "",
      alt: block.body || block.title || "Estate Brothers partner",
    };
  }).filter((partner) => partner.image);
}

export function normalizeTestimonials(pageSections: PageSectionWithBlocks[] | undefined): HomeTestimonial[] {
  const testimonialsSection = section(pageSections, "testimonials");
  return (testimonialsSection?.page_blocks ?? []).map((block) => {
    const data = attrs(block.attributes);
    return {
      quote: text(data.quote) || block.body || "",
      name: text(data.name) || block.title || "Estate Brothers client",
      role: text(data.role) || block.link_label || "",
      imageUrl: mediaUrl(block.media_assets),
    };
  }).filter((testimonial) => testimonial.quote);
}

export function normalizeFeaturedProjects(pageSections: PageSectionWithBlocks[] | undefined): HomeFeaturedProject[] {
  const projectsSection = section(pageSections, "featured-projects");
  return (projectsSection?.page_blocks ?? []).map((block, index) => {
    const data = attrs(block.attributes);
    const title = block.title || text(data.title) || block.block_key || "Featured project";
    const gallery = (block.page_block_media ?? [])
      .map((item) => ({
        id: item.id,
        imageUrl: mediaUrl(item.media_assets) ?? "",
        alt: item.media_assets?.alt_text || item.caption || `${title} project image`,
        caption: item.caption || item.media_assets?.caption || "",
        isPrimary: item.is_primary,
      }))
      .filter((item) => item.imageUrl)
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
    const image = gallery[0]?.imageUrl ?? mediaUrl(block.media_assets);
    return {
      id: block.id || block.block_key || String(index),
      title,
      location: block.link_label || text(data.location) || "Lahore",
      label: block.icon_name || text(data.label) || "Featured project",
      description: block.body || text(data.description) || "",
      href: block.link_url || text(data.href) || "/buy-sell",
      imageUrl: image,
      alt: gallery[0]?.alt || block.media_assets?.alt_text || `${title} by Estate Brothers`,
      gallery,
    };
  }).filter((project) => project.title && project.description);
}

export function normalizeFeaturedListings(
  pageSections: PageSectionWithBlocks[] | undefined,
  listings: NormalizedListing[],
): HomeFeaturedListing[] {
  const listingsSection = section(pageSections, "featured-listings");
  const byId = new Map(listings.map((listing) => [listing.id, listing]));

  return (listingsSection?.page_blocks ?? [])
    .map((block) => {
      const listing = block.listing_id ? byId.get(block.listing_id) : null;
      if (!listing || listing.noindex) return null;
      const fallbackName = listing.type === "house" ? listing.title : listing.phase ?? "Property";
      return {
        id: block.id,
        listing,
        imageUrl: mediaUrl(block.media_assets) ?? listing.thumbnail ?? listing.gallery[0] ?? null,
        alt: block.media_assets?.alt_text || `${fallbackName} listing in ${listing.city ?? "Lahore"}`,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export function normalizeHomeGallery(pageSections: PageSectionWithBlocks[] | undefined): HomeGalleryItem[] {
  const gallerySection = sectionByFirstKey(pageSections, ["life-gallery", "gallery", "events"]);
  return (gallerySection?.page_blocks ?? []).map((block, index) => {
    const data = attrs(block.attributes);
    const image = mediaUrl(block.media_assets);
    return {
      id: block.id || block.block_key || String(index),
      title: block.title || text(data.title) || "Estate Brothers moment",
      caption: block.body || text(data.caption) || block.media_assets?.caption || "",
      imageUrl: image ?? "",
      alt: block.media_assets?.alt_text || block.title || "Estate Brothers event image",
      href: block.link_url,
    };
  }).filter((item) => item.imageUrl);
}

export function normalizeHomeAwards(pageSections: PageSectionWithBlocks[] | undefined): HomeAward[] {
  const awardsSection = section(pageSections, "awards-recognition");
  return (awardsSection?.page_blocks ?? []).map((block, index) => {
    const data = attrs(block.attributes);
    const title = block.title || text(data.title) || block.block_key || "Estate Brothers recognition";
    return {
      id: block.id || block.block_key || String(index),
      title,
      description: block.body || text(data.description) || "",
      category: block.icon_name || text(data.category) || "Recognition",
      issuer: block.link_label || text(data.issuer) || "Estate Brothers",
      imageUrl: mediaUrl(block.media_assets),
      alt: block.media_assets?.alt_text || `${title} certificate or award`,
      referenceUrl: block.link_url,
    };
  }).filter((award) => award.title);
}

export function normalizeHomeStories(pageSections: PageSectionWithBlocks[] | undefined): HomeStory[] {
  const storiesSection = section(pageSections, "team-stories");
  return (storiesSection?.page_blocks ?? []).map((block, index) => {
    const data = attrs(block.attributes);
    const title = block.title || text(data.title) || block.block_key || "Estate Brothers story";
    return {
      id: block.id || block.block_key || String(index),
      title,
      summary: block.body || text(data.summary) || "",
      code: block.icon_name || text(data.code) || "Story",
      person: block.link_label || text(data.person) || "Estate Brothers team",
      videoUrl: block.link_url || text(data.videoUrl) || null,
      imageUrl: mediaUrl(block.media_assets),
      alt: block.media_assets?.alt_text || `${title} team story`,
    };
  }).filter((story) => story.title && story.summary);
}
