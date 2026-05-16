import type { Metadata } from "next";

const SITE_URL = "https://estatebrothers.pk";
const SITE_NAME = "Estate Brothers";
const DEFAULT_DESCRIPTION = "Buy, sell, and invest in property across Lahore, Karachi, and Islamabad with Estate Brothers — Pakistan's trusted real estate team.";

interface BuildMetadataOptions {
  title: string;
  description?: string;
  canonicalPath: string;
  image?: string;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  image = "/images/properties/hero-estatebrothers.webp",
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const ogImage = image.startsWith("/") ? `${SITE_URL}${image}` : image;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}
