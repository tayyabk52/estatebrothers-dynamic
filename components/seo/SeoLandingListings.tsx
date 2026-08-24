import Link from "next/link";
import type { NormalizedAgent, NormalizedHouse, NormalizedListing } from "@/lib/types";

function listingTitle(listing: NormalizedListing) {
  if (listing.type === "house") return (listing as NormalizedHouse).title;
  return `${listing.phase ?? "Property"} ${listing.size ?? ""}`.trim() || "Plot listing";
}

function listingLocation(listing: NormalizedListing) {
  const parts = [listing.phase, listing.city].filter(Boolean);
  if (listing.type === "house" && (listing as NormalizedHouse).location.neighborhood) {
    parts.unshift((listing as NormalizedHouse).location.neighborhood);
  }
  return parts.join(" · ") || "Estate Brothers";
}

function listingSummary(listing: NormalizedListing) {
  if (listing.type === "house") {
    const house = listing as NormalizedHouse;
    const specs = [
      house.size,
      house.bedrooms ? `${house.bedrooms} beds` : null,
      house.bathrooms ? `${house.bathrooms} baths` : null,
      house.status ?? house.availability,
    ].filter(Boolean);
    return specs.join(" · ") || house.notes || "House listing";
  }

  return [listing.size, listing.project, listing.status ?? listing.availability].filter(Boolean).join(" · ");
}

function listingTypeLabel(type: NormalizedListing["type"]) {
  return type === "house" ? "House" : "Plot";
}

export function SeoLandingListings({
  listings,
  agentMap,
}: {
  listings: NormalizedListing[];
  agentMap: Record<string, NormalizedAgent>;
}) {
  if (!listings.length) {
    return (
      <div className="inventory-empty">
        <div className="serif-i">No matching listings are published yet.</div>
        <p>Contact Estate Brothers for current availability in this category.</p>
      </div>
    );
  }

  return (
    <div className="inventory-table-wrap seo-listing-table-wrap">
      <table className="inventory-table seo-listing-table">
        <caption>Matching property listings</caption>
        <thead>
          <tr>
            <th scope="col">Listing</th>
            <th scope="col">Location</th>
            <th scope="col">Details</th>
            <th scope="col">Price</th>
            <th scope="col">Contact</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {listings.slice(0, 12).map((listing) => {
            const agent = agentMap[listing.contactPersonId ?? ""];
            const href = `/buy-sell/${listing.type}/${listing.slug}`;
            const title = listingTitle(listing);

            return (
              <tr key={listing.id}>
                <td data-label="Listing">
                  <Link href={href}>
                    <strong>{title}</strong>
                  </Link>
                  <span>{listingTypeLabel(listing.type)}</span>
                </td>
                <td data-label="Location">{listingLocation(listing)}</td>
                <td data-label="Details">{listingSummary(listing)}</td>
                <td data-label="Price" className="seo-listing-price">
                  {listing.price}
                </td>
                <td data-label="Contact">{agent?.name ?? "Estate Brothers"}</td>
                <td data-label="Action" className="action-cell seo-listing-action-cell">
                  <Link href={href} className="detail-link seo-listing-action">
                    View details →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
