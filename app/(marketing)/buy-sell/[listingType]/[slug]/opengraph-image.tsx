import { ImageResponse } from "next/og";
import { getListingBySlug } from "@/lib/db/listings";
import type { NormalizedHouse, NormalizedPlot } from "@/lib/types";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ listingType: string; slug: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { listingType, slug } = await params;
  const listing = await getListingBySlug(listingType, slug);
  const title =
    listing?.type === "house"
      ? (listing as NormalizedHouse).title
      : listing
        ? (listing as NormalizedPlot).title
        : "Estate Brothers Listing";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px",
          background: "#2E4A3A",
          color: "#FAF6EC",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ color: "#D7B56D", fontSize: 28, letterSpacing: 4 }}>
          ESTATE BROTHERS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 78, fontWeight: 800, lineHeight: 1 }}>{title}</div>
          <div style={{ fontSize: 34, color: "#D7B56D" }}>
            {listing ? `${listing.phase}, ${listing.city} - ${listing.price}` : "DHA Lahore"}
          </div>
        </div>
        <div style={{ fontSize: 28 }}>estatebrothers.pk</div>
      </div>
    ),
    size
  );
}
