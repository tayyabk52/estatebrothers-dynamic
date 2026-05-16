const SITE_URL = "https://estatebrothers.pk";
const SITE_NAME = "Estate Brothers";

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/headerlogo.svg`,
    email: "estatebrothers786@gmail.com",
    telephone: "+92-323-8488195",
    foundingDate: "2014",
    sameAs: [] as string[],
  };
}

export function buildRealEstateAgentSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/headerlogo.svg`,
    telephone: "+92-323-8488195",
    email: "estatebrothers786@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "44-A Main DHA Office Phase 6",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      addressCountry: "PK",
    },
    areaServed: ["Lahore", "Karachi", "Islamabad", "Pakistan"],
    openingHours: "Mo-Su 00:00-23:59",
    numberOfEmployees: { "@type": "QuantitativeValue", value: 30 },
    foundingDate: "2014",
    sameAs: [] as string[],
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/buy-sell?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
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
  price: string;
  thumbnail?: string;
  image?: string;
  city?: string;
  location?: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  updatedAt: string;
}

export function buildRealEstateListingSchema(listing: ListingForSchema) {
  const listingName = listing.title ?? listing.name ?? "";
  const listingDesc = listing.desc ?? listing.description ?? listing.notes ?? "";
  const listingImage = listing.thumbnail ?? listing.image ?? "";

  const address = listing.location
    ? {
        "@type": "PostalAddress",
        streetAddress: listing.location.address,
        addressLocality: listing.location.city,
        addressRegion: listing.location.state,
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
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
    },
    address,
  };
}

interface BreadcrumbItem { name: string; url: string; }

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
