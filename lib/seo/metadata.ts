import type { Metadata } from "next";

const SITE_URL = "https://estatebrothers.pk";
const SITE_NAME = "Estate Brothers";
const DEFAULT_DESCRIPTION =
  "Buy, sell, and invest in property across Lahore, Karachi, and Islamabad with Estate Brothers - Pakistan's trusted real estate team.";
const DEFAULT_OG_IMAGE = "/og-default.jpg";

interface BuildMetadataOptions {
  title: string;
  description?: string;
  canonicalPath: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
  ogType?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

function withSiteName(title: string) {
  const normalizedTitle = title.trim();
  const normalizedSiteName = SITE_NAME.toLocaleLowerCase();
  const normalizedComparisonTitle = normalizedTitle.toLocaleLowerCase();

  if (
    normalizedComparisonTitle === normalizedSiteName ||
    normalizedComparisonTitle.endsWith(`| ${normalizedSiteName}`)
  ) {
    return normalizedTitle;
  }

  return `${normalizedTitle} | ${SITE_NAME}`;
}

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
  keywords,
  ogType = "website",
  publishedTime,
  modifiedTime,
  authors,
}: BuildMetadataOptions): Metadata {
  const fullTitle = withSiteName(title);
  const canonicalUrl = canonicalPath.startsWith("http")
    ? canonicalPath
    : `${SITE_URL}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;
  const ogImage = image.startsWith("/") ? `${SITE_URL}${image}` : image;
  const robots: Metadata["robots"] = noIndex
    ? { index: false, follow: false }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      };

  return {
    title: { absolute: fullTitle },
    description,
    keywords,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: canonicalUrl },
    category: "Real Estate",
    creator: SITE_NAME,
    robots,
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: ogType,
      locale: "en_PK",
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
      ...(ogType === "article" && {
        publishedTime,
        modifiedTime,
        authors,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    other: {
      "geo.region": "PK-PB",
      "geo.placename": "Lahore",
      "geo.position": "31.4697;74.4013",
      ICBM: "31.4697, 74.4013",
    },
  };
}
