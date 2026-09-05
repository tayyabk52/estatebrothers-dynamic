import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { GalleryCarousel } from "@/components/ui/GalleryCarousel";
import { getListingBySlug, getAllPublishedListings } from "@/lib/db/listings";
import { getRedirectForPath } from "@/lib/db/redirects";
import { getTeamMemberById } from "@/lib/db/team";
import { DEFAULT_AGENT, type NormalizedAgent, type NormalizedHouse, type NormalizedPlot } from "@/lib/types";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, buildRealEstateListingSchema } from "@/lib/seo/structured-data";
import "@/styles/buySell.css";

interface PageProps {
  params: Promise<{ listingType: string; slug: string }>;
}

export async function generateStaticParams() {
  const listings = await getAllPublishedListings();
  const params = listings.map((listing) => ({
    listingType: listing.type,
    slug: listing.slug,
  }));
  return params.length ? params : [{ listingType: "plot", slug: "__placeholder" }];
}

export async function generateMetadata({ params }: PageProps) {
  const { listingType, slug } = await params;
  const listing = await getListingBySlug(listingType, slug);
  if (!listing) return {};

  const isHouse = listing.type === "house";
  const house = isHouse ? (listing as NormalizedHouse) : null;
  const plot = !isHouse ? (listing as NormalizedPlot) : null;

  const title = isHouse
    ? house!.title
    : plot!.title;

  const description = isHouse
    ? `${title} for sale in ${house!.phase}, ${house!.city}. Price: ${listing.price}. ${house!.bedrooms} bed, ${house!.bathrooms} bath.`
    : `${listing.size} plot for sale in ${plot!.phase}, ${listing.city}. Price: ${listing.price}. Contact Estate Brothers.`;

  return buildMetadata({
    title: listing.metaTitle ?? title,
    description: listing.metaDescription ?? description,
    canonicalPath: `/buy-sell/${listingType}/${slug}`,
    image: (isHouse ? house!.ogImage ?? house!.thumbnail : plot!.ogImage ?? plot!.thumbnail) ?? "/og-default.jpg",
    noIndex: listing.noindex,
    keywords: listing.keywords.length ? listing.keywords : [
      `${listing.phase ?? ""} ${listing.size ?? ""}`.trim(),
      `${listing.type} for sale Lahore`,
      "Estate Brothers listings",
    ],
  });
}

function ContactPanel({
  agent,
  listingId,
  compact = false,
}: {
  agent: NormalizedAgent;
  listingId: string;
  compact?: boolean;
}) {
  return (
    <aside className={`detail-contact${compact ? " detail-contact-top" : ""}`}>
      <div className="detail-contact-id">
        <span className="eyebrow">Contact person</span>
        <h3>{agent.name}</h3>
        <p>{agent.role}</p>
      </div>
      <div className="detail-contact-actions">
        {agent.profilePath && <Link href={agent.profilePath}>View profile</Link>}
        {agent.phone && <a href={`tel:${agent.phone.replace(/\s/g, "")}`}>{agent.phone}</a>}
        {agent.whatsapp && (
          <a href={`https://wa.me/${agent.whatsapp.replace(/\D/g, "")}`}>WhatsApp</a>
        )}
        {agent.email && <a href={`mailto:${agent.email}`}>Email</a>}
      </div>
      <span className="mono detail-listing-id">{listingId}</span>
    </aside>
  );
}

function DetailList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="detail-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { listingType, slug } = await params;
  const listing = await getListingBySlug(listingType, slug);

  if (!listing) {
    const currentPath = `/buy-sell/${listingType}/${slug}`;
    const redirectTarget = await getRedirectForPath(currentPath);
    if (redirectTarget) {
      permanentRedirect(redirectTarget.target_path);
    }
    notFound();
  }

  const agent = listing.contactPersonId
    ? (await getTeamMemberById(listing.contactPersonId)) ?? DEFAULT_AGENT
    : DEFAULT_AGENT;

  const isHouse = listing.type === "house";
  const house = isHouse ? (listing as NormalizedHouse) : null;
  const plot = !isHouse ? (listing as NormalizedPlot) : null;
  const itemTitle = isHouse ? house!.title : plot!.title;

  const listingSchema = buildRealEstateListingSchema({
    slug: listing.slug,
    type: listing.type,
    title: itemTitle,
    notes: plot?.notes ?? undefined,
    phase: listing.phase ?? undefined,
    size: listing.size ?? undefined,
    price: listing.price,
    priceNumeric: listing.priceNumeric ?? undefined,
    availability: listing.availability,
    thumbnail: (isHouse ? house!.ogImage ?? house!.thumbnail : plot!.ogImage ?? plot!.thumbnail) ?? undefined,
    city: listing.city ?? undefined,
    location: isHouse ? {
      address: house!.location.address ?? "",
      neighborhood: house!.location.neighborhood ?? "",
      city: house!.location.city ?? "",
      state: "Punjab",
      postalCode: house!.location.postalCode ?? "",
      country: "PK",
    } : undefined,
    updatedAt: plot?.sourceUpdatedAt ?? listing.updatedAt,
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://estatebrothers.pk" },
    { name: "Buy/Sell", url: "https://estatebrothers.pk/buy-sell" },
    {
      name: itemTitle,
      url: `https://estatebrothers.pk/buy-sell/${listingType}/${slug}`,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main>
        <section className="detail-hero">
          <div className="wrap">
            <nav aria-label="Breadcrumb" className="breadcrumb-nav">
              <ol className="breadcrumb-list">
                <li className="breadcrumb-item">
                  <Link href="/">Home</Link>
                </li>
                <li className="breadcrumb-separator" aria-hidden="true">/</li>
                <li className="breadcrumb-item">
                  <Link href="/buy-sell">Buy/Sell</Link>
                </li>
                <li className="breadcrumb-separator" aria-hidden="true">/</li>
                <li className="breadcrumb-item" aria-current="page">
                  <span>{itemTitle}</span>
                </li>
              </ol>
            </nav>

            <div className="detail-title">
              <div className="eyebrow">{isHouse ? "House for sale" : "Plot for sale"}</div>
              <h1>{itemTitle}</h1>
              <p>
                {isHouse
                  ? `${house!.phase}, ${house!.city}`
                  : plot!.notes}
              </p>
            </div>
            <div className="detail-price">
              <span className={listing.availability === "sold" ? "status-tag status-sold" : "status-tag"}>
                {listing.availability === "sold" ? "Sold" : listing.status ?? "Available"}
              </span>
              <strong>{listing.price}</strong>
            </div>
          </div>
        </section>

        {isHouse && house ? (
          <>
            {house.gallery.length > 0 && (
              <GalleryCarousel
                gallery={house.gallery}
                title={house.title}
                listingId={house.id}
              />
            )}
            <section className="detail-body">
              <div className="wrap">
                <div className="detail-main">
                  <ContactPanel agent={agent} listingId={house.id.slice(0, 8)} compact />
                  <div className="detail-summary-table">
                    <table>
                      <tbody>
                        <tr>
                          <th>Size</th>
                          <td>{house.size}</td>
                          <th>Bedrooms</th>
                          <td>{house.bedrooms}</td>
                        </tr>
                        <tr>
                          <th>Bathrooms</th>
                          <td>{house.bathrooms}</td>
                          <th>Garage</th>
                          <td>{house.specs.garageCapacity} car</td>
                        </tr>
                        <tr>
                          <th>Phase</th>
                          <td>{house.phase}</td>
                          <th>City</th>
                          <td>{house.city}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="detail-block">
                    <h2>Location details</h2>
                    <dl className="detail-specs">
                      {house.location.address && (
                        <div><dt>Address</dt><dd>{house.location.address}</dd></div>
                      )}
                      {house.location.neighborhood && (
                        <div><dt>Neighborhood</dt><dd>{house.location.neighborhood}</dd></div>
                      )}
                      {house.location.city && (
                        <div><dt>City</dt><dd>{house.location.city}</dd></div>
                      )}
                      {house.location.postalCode && (
                        <div><dt>Postal code</dt><dd>{house.location.postalCode}</dd></div>
                      )}
                    </dl>
                  </div>
                  <div className="detail-feature-grid">
                    <DetailList title="Interior" items={house.features.interior} />
                    <DetailList title="Exterior" items={house.features.exterior} />
                    <DetailList title="Tags" items={house.features.tags} />
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : plot ? (
          <>
            {plot.gallery.length > 0 && (
              <GalleryCarousel
                gallery={plot.gallery}
                title={itemTitle}
                listingId={plot.id}
              />
            )}
            <section className="detail-body">
              <div className="wrap">
                <div className="detail-main">
                  <ContactPanel agent={agent} listingId={plot.sourceListingId ?? plot.id.slice(0, 8)} compact />
                  <div className="detail-summary-table">
                    <table>
                      <tbody>
                        <tr>
                          <th>Project</th>
                          <td>{plot.phase}</td>
                          <th>Size</th>
                          <td>{plot.size}</td>
                        </tr>
                        <tr>
                          <th>Type</th>
                          <td>{plot.propertyType}</td>
                          <th>Status</th>
                          <td>{plot.status}</td>
                        </tr>
                        <tr>
                          <th>Location</th>
                          <td>{plot.city}</td>
                          <th>Updated</th>
                          <td>{plot.sourceUpdatedAt ?? plot.updatedAt}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="detail-block">
                    <h2>Listing details</h2>
                    <dl className="detail-specs compact">
                      {[
                        ["Project", plot.project],
                        ["Neighborhood", plot.neighborhood],
                        ["Property type", plot.propertyType],
                        ["Size", plot.size],
                        ["Status", plot.status],
                        ["Updated", plot.sourceUpdatedAt ?? plot.updatedAt],
                      ].filter(([, v]) => v).map(([label, value]) => (
                        <div key={label as string}>
                          <dt>{label}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  {plot.notes && (
                    <div className="detail-block">
                      <h2>Notes</h2>
                      <p>{plot.notes}</p>
                    </div>
                  )}
                  {(plot.paymentPlan.length > 0 || plot.amenities.length > 0 || plot.terms.length > 0) && (
                    <div className="detail-feature-grid">
                      {plot.paymentPlan.length > 0 && (
                        <div className="detail-list">
                          <h3>Payment plan</h3>
                          <ul>
                            {plot.paymentPlan.map((item) => (
                              <li className="payment-row" key={`${item.label}-${item.amount}`}>
                                <span>{item.label}</span>
                                <strong>{item.amount}</strong>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <DetailList title="Amenities" items={plot.amenities} />
                      <DetailList title="Terms" items={plot.terms} />
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </>
  );
}
