import type { PageSectionWithBlocks } from "@/lib/db/site";
import { mediaUrl } from "@/lib/db/site";

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

function section(pageSections: PageSectionWithBlocks[] | undefined, key: string) {
  return pageSections?.find((item) => item.section_key === key) ?? null;
}

function attrs(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
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
