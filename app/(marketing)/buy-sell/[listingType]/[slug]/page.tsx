import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryCarousel } from "@/components/ui/GalleryCarousel";
import { getAgent, getListingBySlug, houseListings, plotListings } from "@/data/inventory";
import { getPlotListings, getHouseListings } from "@/lib/data/inventory";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, buildRealEstateListingSchema } from "@/lib/seo/structured-data";
import "@/styles/buySell.css";

interface PageProps {
  params: Promise<{ listingType: string; slug: string }>;
}

export async function generateStaticParams() {
  const plots = await getPlotListings();
  const houses = await getHouseListings();
  return [
    ...plots.map((p) => ({ listingType: "plot", slug: p.slug })),
    ...houses.map((h) => ({ listingType: "house", slug: h.slug })),
  ];
}

export async function generateMetadata({ params }: PageProps) {
  const { listingType, slug } = await params;
  const listing = getListingBySlug(listingType, slug);
  if (!listing) return {};

  const title =
    listing.type === "plot"
      ? `${listing.phase} ${listing.size} Plot`
      : (listing as typeof houseListings[0]).title;

  return buildMetadata({
    title,
    description:
      listing.type === "plot"
        ? `${listing.size} plot for sale in ${listing.phase}, ${listing.city}. Price: ${listing.price}. Contact Estate Brothers.`
        : `${title} for sale in ${listing.phase}, ${listing.city}. Price: ${listing.price}. ${(listing as typeof houseListings[0]).bedrooms} bed, ${(listing as typeof houseListings[0]).bathrooms} bath.`,
    canonicalPath: `/buy-sell/${listingType}/${slug}`,
    image:
      listing.type === "house"
        ? ((listing as typeof houseListings[0]).gallery?.[0] ?? undefined)
        : undefined,
  });
}

function ContactPanel({
  agent,
  listing,
  compact = false,
}: {
  agent: ReturnType<typeof getAgent>;
  listing: ReturnType<typeof getListingBySlug>;
  compact?: boolean;
}) {
  if (!listing) return null;
  return (
    <aside className={`detail-contact${compact ? " detail-contact-top" : ""}`}>
      <div className="detail-contact-id">
        <span className="eyebrow">Contact person</span>
        <h3>{agent.name}</h3>
        <p>{agent.role}</p>
      </div>
      <div className="detail-contact-actions">
        <a href={`tel:${agent.phone.replace(/\s/g, "")}`}>{agent.phone}</a>
        <a href={`https://wa.me/${agent.whatsapp.replace(/\D/g, "")}`}>WhatsApp</a>
        <a href={`mailto:${agent.email}`}>Email</a>
      </div>
      <span className="mono detail-listing-id">{listing.id}</span>
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
  const listing = getListingBySlug(listingType, slug);

  if (!listing) notFound();

  const agent = getAgent(listing.contactPersonId);
  const isHouse = listing.type === "house";
  const houseListing = isHouse ? (listing as typeof houseListings[0]) : null;
  const plotListing = !isHouse ? (listing as typeof plotListings[0]) : null;

  const listingSchema = buildRealEstateListingSchema({
    ...listing,
    updatedAt: listing.updatedAt ?? new Date().toISOString().slice(0, 10),
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://estatebrothers.pk" },
    { name: "Buy/Sell", url: "https://estatebrothers.pk/buy-sell" },
    {
      name: isHouse ? (houseListing?.title ?? "") : `${plotListing?.phase} Plot`,
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
            <Link href="/buy-sell" className="detail-back">
              Back to Buy/Sell
            </Link>
            <div className="detail-title">
              <div className="eyebrow">{isHouse ? "House for sale" : "Plot for sale"}</div>
              <h1>
                {isHouse
                  ? houseListing?.title
                  : `${plotListing?.phase} ${plotListing?.size} Plot`}
              </h1>
              <p>
                {isHouse
                  ? `${houseListing?.phase}, ${houseListing?.city}`
                  : plotListing?.notes}
              </p>
            </div>
            <div className="detail-price">
              <span>{listing.status}</span>
              <strong>{listing.price}</strong>
            </div>
          </div>
        </section>

        {isHouse && houseListing ? (
          <>
            <GalleryCarousel
              gallery={houseListing.gallery}
              title={houseListing.title}
              listingId={houseListing.id}
            />
            <section className="detail-body">
              <div className="wrap">
                <div className="detail-main">
                  <ContactPanel agent={agent} listing={listing} compact />
                  <div className="detail-summary-table">
                    <table>
                      <tbody>
                        <tr>
                          <th>Size</th>
                          <td>{houseListing.size}</td>
                          <th>Bedrooms</th>
                          <td>{houseListing.bedrooms}</td>
                        </tr>
                        <tr>
                          <th>Bathrooms</th>
                          <td>{houseListing.bathrooms}</td>
                          <th>Garage</th>
                          <td>{houseListing.specs.garageCapacity} car</td>
                        </tr>
                        <tr>
                          <th>Phase</th>
                          <td>{houseListing.phase}</td>
                          <th>City</th>
                          <td>{houseListing.city}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="detail-block">
                    <h2>Location details</h2>
                    <dl className="detail-specs">
                      <div>
                        <dt>Address</dt>
                        <dd>{houseListing.location.address}</dd>
                      </div>
                      <div>
                        <dt>Neighborhood</dt>
                        <dd>{houseListing.location.neighborhood}</dd>
                      </div>
                      <div>
                        <dt>City</dt>
                        <dd>{houseListing.location.city}</dd>
                      </div>
                      <div>
                        <dt>Postal code</dt>
                        <dd>{houseListing.location.postalCode}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="detail-feature-grid">
                    <DetailList title="Interior" items={houseListing.features.interior} />
                    <DetailList title="Exterior" items={houseListing.features.exterior} />
                    <DetailList title="Tags" items={houseListing.features.tags} />
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : plotListing ? (
          <section className="detail-body">
            <div className="wrap">
              <div className="detail-main">
                <ContactPanel agent={agent} listing={listing} compact />
                <div className="detail-summary-table">
                  <table>
                    <tbody>
                      <tr>
                        <th>Phase</th>
                        <td>{plotListing.phase}</td>
                        <th>Size</th>
                        <td>{plotListing.size}</td>
                      </tr>
                      <tr>
                        <th>Project</th>
                        <td>{plotListing.project}</td>
                        <th>Status</th>
                        <td>{plotListing.status}</td>
                      </tr>
                      <tr>
                        <th>Block</th>
                        <td>{plotListing.block}</td>
                        <th>Updated</th>
                        <td>{plotListing.updatedAt}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="detail-block">
                  <h2>Plot details</h2>
                  <dl className="detail-specs compact">
                    <div>
                      <dt>Phase</dt>
                      <dd>{plotListing.phase}</dd>
                    </div>
                    <div>
                      <dt>Project</dt>
                      <dd>{plotListing.project}</dd>
                    </div>
                    <div>
                      <dt>Block</dt>
                      <dd>{plotListing.block}</dd>
                    </div>
                    <div>
                      <dt>Size</dt>
                      <dd>{plotListing.size}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{plotListing.status}</dd>
                    </div>
                    <div>
                      <dt>Updated</dt>
                      <dd>{plotListing.updatedAt}</dd>
                    </div>
                  </dl>
                </div>
                <div className="detail-block">
                  <h2>Notes</h2>
                  <p>{plotListing.notes}</p>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
