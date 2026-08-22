import Image from "next/image";
import Link from "next/link";
import { PartnersCarousel } from "@/components/ui/PartnersCarousel";
import { PropertyRow } from "@/components/ui/PropertyRow";
import { Testimonial } from "@/components/ui/Testimonial";
import {
  getHomeSection,
  normalizeHomeStats,
  normalizePartners,
  normalizeTestimonials,
} from "@/lib/db/home-content";
import { getAllPublishedListings } from "@/lib/db/listings";
import { getPublishedPage, mediaUrl } from "@/lib/db/site";
import { getPublishedTeamMembers } from "@/lib/db/team";
import { buildMetadata } from "@/lib/seo/metadata";
import type { NormalizedListing } from "@/lib/types";
import "@/styles/home.css";

export async function generateMetadata() {
  const page = await getPublishedPage("/");
  return buildMetadata({
    title: page?.meta_title ?? "Estate Brothers",
    description: page?.meta_description,
    canonicalPath: "/",
    image: page?.og_image ?? mediaUrl(page?.hero_media) ?? "/og-default.jpg",
    keywords: page?.keywords ?? ["real estate Lahore", "DHA Phase 6 property", "buy property Lahore", "estate brothers"],
  });
}

function EmptyMarketingPage({ title }: { title: string }) {
  return (
    <main>
      <section className="section">
        <div className="wrap">
          <div className="inventory-empty">
            <div className="serif-i">{title}</div>
            <p>This page is connected to Supabase. Publish page content in the admin dashboard to show it here.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Hero({
  page,
  stats,
}: {
  page: NonNullable<Awaited<ReturnType<typeof getPublishedPage>>>;
  stats: ReturnType<typeof normalizeHomeStats>;
}) {
  const heroImage = mediaUrl(page.hero_media);
  return (
    <section className="hero">
      <div className="hero-stage">
        {heroImage && (
          <div className="hero-img">
            <Image
              src={heroImage}
              alt=""
              fill
              fetchPriority="high"
              loading="eager"
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </div>
        )}
        <div className="hero-content">
          <div className="eyebrow-w">
            <span>{page.title}</span>
          </div>
          <h1>
            {page.heading ?? page.title}
          </h1>
          <div className="hero-side">
            {page.intro && <p className="lede">{page.intro}</p>}
            <Link href="/buy-sell" className="hero-primary-link">
              View Listings
            </Link>
          </div>
        </div>
      </div>

      <div className="hero-listings-strip">
        <div>
          <span className="eyebrow">Buy / Sell</span>
          <strong>View our listings</strong>
        </div>
        <Link href="/buy-sell">Open inventory</Link>
      </div>

      {stats.length > 0 && (
        <div className="hero-strip">
          {stats.map((stat) => (
            <div className="cell" key={stat.l}>
              <div className="n">
                {stat.n}
                {stat.unit && <span className="unit">{stat.unit}</span>}
              </div>
              <div className="l">{stat.l}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function listingToFeaturedProperty(listing: NormalizedListing, index: number) {
  const isHouse = listing.type === "house";
  const image = isHouse
    ? listing.thumbnail ?? listing.gallery[0] ?? "/images/properties/hero-estatebrothers.webp"
    : "/images/properties/hero-estatebrothers.webp";
  const title = isHouse ? listing.title : `${listing.phase ?? "Property"} ${listing.size ?? ""}`.trim();
  const city = listing.city ?? "Lahore";
  return {
    id: String(index + 1).padStart(2, "0"),
    image,
    photoNote: "PHOTOGRAPH - Estate Brothers listing media",
    place: `${listing.phase ?? "Estate Brothers"} · ${city}`,
    name: title,
    desc: isHouse
      ? listing.notes ?? `${listing.size ?? "House"} in ${listing.phase ?? city}.`
      : listing.notes ?? `${listing.size ?? "Plot"} in ${listing.phase ?? city}.`,
    arch: "Estate Brothers inventory",
    priceLabel: listing.price,
    plot: listing.size ?? "On request",
    covered: 0,
    beds: isHouse ? listing.bedrooms ?? 0 : 0,
    baths: isHouse ? listing.bathrooms ?? 0 : 0,
    tag: listing.status?.toLowerCase().includes("file") ? "allotment" : "possession",
    status: listing.status ?? "Available",
  };
}

function Featured({
  listings,
  section,
}: {
  listings: Awaited<ReturnType<typeof getAllPublishedListings>>;
  section: ReturnType<typeof getHomeSection>;
}) {
  return (
    <section className="section" id="listings">
      <div className="wrap">
        <header className="section-hd reveal">
          <div className="label">
            <div className="eyebrow">{section?.eyebrow ?? "Currently representing"}</div>
            {section?.subheading && <div className="mono section-date">{section.subheading}</div>}
          </div>
          <div className="title">
            <h2>{section?.heading ?? "Published inventory, ready for review."}</h2>
          </div>
          <div className="aux">
            <Link href="/buy-sell">View Buy/Sell -&gt;</Link>
          </div>
        </header>
        {listings.length > 0 ? (
          <div className="property-list">
            {listings.slice(0, 4).map((listing, index) => (
              <Link key={listing.id} href={`/buy-sell/${listing.type}/${listing.slug}`}>
                <PropertyRow property={listingToFeaturedProperty(listing, index)} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="inventory-empty">
            <div className="serif-i">No published listings yet.</div>
            <p>Listings published in the admin dashboard will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function Narrative({
  page,
  team,
}: {
  page: NonNullable<Awaited<ReturnType<typeof getPublishedPage>>>;
  team: Awaited<ReturnType<typeof getPublishedTeamMembers>>;
}) {
  const leadership = page.page_sections?.find((section) => section.section_key === "leadership");
  const ceo = team.find((member) => member.name.toLowerCase().includes("tajamal")) ?? team[0];
  const leadershipImage =
    mediaUrl(leadership?.media_assets) ?? ceo?.imageUrl ?? "/images/team/ceo-tajamal-hussain.jpg";
  return (
    <section className="narrative" id="about">
      <div className="wrap">
        <div className="col-l reveal">
          <div className="img">
            <Image
              src={leadershipImage}
              alt={ceo ? `${ceo.name}, ${ceo.role ?? "Estate Brothers"}` : "Estate Brothers leadership"}
              width={600}
              height={700}
              loading="lazy"
              sizes="(max-width:768px) 100vw, 600px"
              placeholder="blur"
              blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
            />
            <span className="ph">{ceo ? `${ceo.role ?? "Leadership"} - ${ceo.name}` : "Estate Brothers leadership"}</span>
          </div>
        </div>
        <div className="col-r reveal">
          <div className="eyebrow">{leadership?.eyebrow ?? "Leadership"}</div>
          <h2>{leadership?.heading ?? "Built on trust, expertise, and results."}</h2>
          {leadership?.subheading && <p>{leadership.subheading}</p>}
          {leadership?.body && <p className="narrative-meta">{leadership.body}</p>}
          <div className="signature">
            <div className="avatars">
              <div className="avatar avatar-one" />
              <div className="avatar avatar-two" />
            </div>
            <div className="who">
              <span className="name">{ceo?.name ?? "Estate Brothers"}</span>
              <span className="role">{ceo?.role ?? "Leadership"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [page, listings, team] = await Promise.all([
    getPublishedPage("/"),
    getAllPublishedListings(),
    getPublishedTeamMembers(),
  ]);
  if (!page) return <EmptyMarketingPage title="Home page content is not published yet." />;
  const heroStats = normalizeHomeStats(page.page_sections);
  const partnersSection = getHomeSection(page.page_sections, "partners");
  const partners = normalizePartners(page.page_sections);
  const testimonials = normalizeTestimonials(page.page_sections);
  const testimonialStats = normalizeHomeStats(page.page_sections, "testimonial-stats");
  const featuredSection = getHomeSection(page.page_sections, "featured-listings");

  return (
    <>
      <Hero page={page} stats={heroStats} />
      <PartnersCarousel
        eyebrow={partnersSection?.eyebrow}
        heading={partnersSection?.heading}
        intro={partnersSection?.subheading ?? partnersSection?.body}
        partners={partners}
      />
      <Featured listings={listings} section={featuredSection} />
      <Narrative page={page} team={team} />
      <Testimonial testimonials={testimonials} stats={testimonialStats} />
    </>
  );
}
