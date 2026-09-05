const SITE_URL = "https://www.estatebrothers.pk";
const SITE_NAME = "Estate Brothers";
const BUSINESS_DESCRIPTION =
  "Estate Brothers is a Lahore real estate agency helping clients buy, sell, and invest in residential and commercial property across DHA and wider Pakistan.";
const TELEPHONE = "+92-323-8488195";
const EMAIL = "estatebrothers786@gmail.com";
const LOGO_URL = `${SITE_URL}/images/brand/headerlogo.svg`;
const SAME_AS = [
  "https://www.facebook.com/estatebrothers1",
  "https://www.instagram.com/estatebrothers1",
];

interface BusinessSchemaSettings {
  business_name?: string | null;
  legal_name?: string | null;
  business_description?: string | null;
  email?: string | null;
  phone?: string | null;
  logo_url?: string | null;
  social_links?: unknown;
  address_line_1?: string | null;
  city?: string | null;
  region?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  map_url?: string | null;
  price_range?: string | null;
  service_areas?: string[] | null;
  knows_about?: string[] | null;
}

function socialLinks(settings?: BusinessSchemaSettings | null) {
  const links = settings?.social_links;
  if (Array.isArray(links)) return links.filter(Boolean);
  if (links && typeof links === "object") return Object.values(links).filter(Boolean);
  return settings ? [] : SAME_AS;
}

export function buildOrganizationSchema(settings?: BusinessSchemaSettings | null) {
  const name = settings?.business_name ?? SITE_NAME;
  const telephone = settings?.phone ?? TELEPHONE;
  const email = settings?.email ?? EMAIL;
  const logo = settings?.logo_url ?? LOGO_URL;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: SITE_URL,
    logo,
    description: settings?.business_description ?? BUSINESS_DESCRIPTION,
    email,
    telephone,
    sameAs: socialLinks(settings),
    contactPoint: {
      "@type": "ContactPoint",
      telephone,
      contactType: "sales",
      areaServed: "PK",
      availableLanguage: ["en", "ur"],
    },
  };
}

// TODO (client facts needed):
// - openingHours: confirm actual business hours before restoring.
// - numberOfEmployees: confirm exact count from client before restoring.
export function buildRealEstateAgentSchema(settings?: BusinessSchemaSettings | null) {
  const name = settings?.business_name ?? SITE_NAME;
  const telephone = settings?.phone ?? TELEPHONE;
  const email = settings?.email ?? EMAIL;
  const logo = settings?.logo_url ?? LOGO_URL;
  const latitude = settings?.latitude != null ? Number(settings.latitude) : undefined;
  const longitude = settings?.longitude != null ? Number(settings.longitude) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    name,
    url: SITE_URL,
    logo,
    image: [logo],
    telephone,
    email,
    priceRange: settings?.price_range ?? "PKR",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.address_line_1,
      addressLocality: settings?.city,
      addressRegion: settings?.region,
      postalCode: settings?.postal_code,
      addressCountry: settings?.country_code ?? "PK",
    },
    ...(latitude != null && longitude != null
      ? { geo: { "@type": "GeoCoordinates", latitude, longitude } }
      : {}),
    ...(settings?.map_url ? { hasMap: settings.map_url } : {}),
    areaServed: settings?.service_areas ?? [],
    knowsAbout: settings?.knows_about ?? [],
    sameAs: socialLinks(settings),
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

interface ListingForSchema {
  title?: string;
  name?: string;
  desc?: string;
  description?: string;
  notes?: string;
  slug: string;
  type: string;
  phase?: string;
  size?: string;
  price: string;
  priceNumeric?: number;
  availability?: string | null;
  thumbnail?: string;
  image?: string;
  city?: string;
  location?: {
    address?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
  updatedAt: string;
}

function offerAvailability(availability?: string | null) {
  const normalized = availability?.toLowerCase() ?? "";
  if (normalized.includes("sold")) return "https://schema.org/SoldOut";
  return "https://schema.org/InStock";
}

export function buildRealEstateListingSchema(listing: ListingForSchema) {
  const listingName = listing.title ?? listing.name ?? "";
  const listingDesc = listing.desc ?? listing.description ?? listing.notes ?? "";
  const listingImage = listing.thumbnail ?? listing.image ?? "";

  const address = listing.location
    ? {
        "@type": "PostalAddress",
        streetAddress: [listing.location.address, listing.location.neighborhood].filter(Boolean).join(", "),
        addressLocality: listing.location.city ?? listing.city ?? "Lahore",
        addressRegion: listing.location.state ?? "Punjab",
        postalCode: listing.location.postalCode,
        addressCountry: "PK",
      }
    : {
        "@type": "PostalAddress",
        addressLocality: listing.city ?? "Lahore",
        addressCountry: "PK",
      };

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listingName,
    description: listingDesc,
    url: `${SITE_URL}/buy-sell/${listing.type}/${listing.slug}`,
    datePosted: listing.updatedAt,
    image: listingImage.startsWith("/") ? `${SITE_URL}${listingImage}` : listingImage,
    ...(listing.priceNumeric
      ? {
          offers: {
            "@type": "Offer",
            price: listing.priceNumeric,
            priceCurrency: "PKR",
            availability: offerAvailability(listing.availability),
          },
        }
      : {}),
    address,
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

interface FAQItem {
  question: string;
  answer: string;
}

export function buildFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

interface PersonForSchema {
  name: string;
  role?: string;
  jobTitle?: string;
  phone?: string;
  email?: string;
  image?: string;
  url?: string;
  description?: string;
  sameAs?: string[];
  keywords?: string[];
}

export function buildPersonSchema(member: PersonForSchema) {
  const image = member.image?.startsWith("/") ? `${SITE_URL}${member.image}` : member.image;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.jobTitle ?? member.role,
    telephone: member.phone,
    email: member.email ?? EMAIL,
    image,
    url: member.url,
    description: member.description,
    sameAs: member.sameAs,
    knowsAbout: member.keywords,
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function buildProfilePageSchema(member: PersonForSchema & { canonicalPath: string }) {
  const url = member.canonicalPath.startsWith("http") ? member.canonicalPath : `${SITE_URL}${member.canonicalPath}`;
  const { ["@context"]: _context, ...person } = buildPersonSchema({ ...member, url });
  void _context;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    name: `${member.name} Profile`,
    description: member.description,
    mainEntity: person,
  };
}

interface ItemListListing {
  slug: string;
  type: string;
  title?: string;
  phase?: string;
  size?: string;
}

export function buildItemListSchema(listings: ItemListListing[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: listings.map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: listing.title ?? `${listing.phase ?? "Property"} ${listing.size ?? ""}`.trim(),
      url: `${SITE_URL}/buy-sell/${listing.type}/${listing.slug}`,
    })),
  };
}

interface UpdateForSchema {
  title: string;
  summary?: string;
  body?: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  media?: { url?: string };
  canonicalPath?: string;
  articleSection?: string;
}

export function buildUpdateItemListSchema(updates: UpdateForSchema[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: updates.map((update, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: update.title,
        description: update.summary ?? update.body,
        datePublished: update.publishedAt,
        dateModified: update.updatedAt ?? update.publishedAt,
        url: `${SITE_URL}${update.canonicalPath ?? `/updates/${update.slug}`}`,
      },
    })),
  };
}

export function buildArticleSchema(update: UpdateForSchema & {
  schemaType?: "Article" | "NewsArticle" | "BlogPosting";
  author?: string;
}) {
  const url = `${SITE_URL}${update.canonicalPath ?? `/updates/${update.slug}`}`;
  const image = update.media?.url
    ? update.media.url.startsWith("/")
      ? `${SITE_URL}${update.media.url}`
      : update.media.url
    : `${SITE_URL}/og-default.jpg`;
  const authorName = update.author ?? SITE_NAME;
  const authorType = authorName === SITE_NAME || authorName.toLowerCase().includes("estate brothers")
    ? "Organization"
    : "Person";

  return {
    "@context": "https://schema.org",
    "@type": update.schemaType ?? "Article",
    headline: update.title,
    description: update.summary ?? update.body,
    articleSection: update.articleSection,
    image: [image],
    datePublished: update.publishedAt,
    dateModified: update.updatedAt ?? update.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: {
      "@type": authorType,
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
  };
}
