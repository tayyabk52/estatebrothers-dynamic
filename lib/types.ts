// Shared normalized types used across marketing pages and admin.
// These bridge DB rows → client component props without leaking Supabase types.

export interface NormalizedPlot {
  id: string;
  title: string;
  slug: string;
  type: "plot";
  phase: string | null;
  project: string | null;
  block: string | null;
  city: string | null;
  size: string | null;
  price: string;
  priceNumeric: number | null;
  status: string | null;
  availability: string | null;
  noindex: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  contactPersonId: string | null;
  thumbnail?: string | null;
  gallery: string[];
  ogImage?: string | null;
  notes: string | null;
  neighborhood: string | null;
  propertyType: string;
  paymentPlan: { label: string; amount: string }[];
  amenities: string[];
  terms: string[];
  sourceListingId: string | null;
  sourceUpdatedAt: string | null;
  updatedAt: string;
}

export interface NormalizedHouse {
  id: string;
  slug: string;
  type: "house";
  title: string;
  phase: string | null;
  city: string | null;
  size: string | null;
  price: string;
  priceNumeric: number | null;
  status: string | null;
  availability: string | null;
  noindex: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  contactPersonId: string | null;
  thumbnail: string | null;
  gallery: string[];
  ogImage?: string | null;
  features: {
    interior?: string[];
    exterior?: string[];
    tags?: string[];
  };
  specs: { garageCapacity: number | null };
  location: {
    address: string | null;
    neighborhood: string | null;
    city: string | null;
    postalCode: string | null;
  };
  notes: string | null;
  updatedAt: string;
}

export type NormalizedListing = NormalizedPlot | NormalizedHouse;

export interface NormalizedAgent {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  slug?: string | null;
  profilePath?: string | null;
  profileSummary?: string | null;
  profileBody?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  keywords?: string[];
  updatedAt?: string;
}

export interface NormalizedUpdate {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  type: string;
  source: string;
  author: string | null;
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
  tags: string[];
  media: { url: string; alt: string };
  externalLinks: { label: string; url: string; kind: string }[];
  body?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalPath?: string | null;
  ogImage?: string | null;
  articleSchemaType?: "Article" | "NewsArticle" | "BlogPosting";
  articleSection?: string | null;
  visibility: "public";
  status: string;
  noindex: boolean;
}

export const DEFAULT_AGENT: NormalizedAgent = {
  id: "",
  name: "Estate Brothers",
  role: "Sales Agent",
  phone: "+92 323 84 88 195",
  whatsapp: "+92 323 84 88 195",
  email: "estatebrothers786@gmail.com",
};
