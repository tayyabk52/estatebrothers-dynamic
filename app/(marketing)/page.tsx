import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { PartnersCarousel } from "@/components/ui/PartnersCarousel";
import { PopularSeoLinks } from "@/components/seo/PopularSeoLinks";
import { PropertyRow } from "@/components/ui/PropertyRow";
import { SafeMediaImage } from "@/components/ui/SafeMediaImage";
import { Testimonial } from "@/components/ui/Testimonial";
import {
  getHomeSection,
  normalizeFeaturedListings,
  normalizeFeaturedProjects,
  normalizeHomeAwards,
  normalizeHomeGallery,
  normalizeHomeStats,
  normalizeHomeStories,
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
    noIndex: page?.noindex ?? true,
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
            <SafeMediaImage
              src={heroImage}
              alt=""
              width={1920}
              height={1080}
              preload
              sizes="100vw"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
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

function listingToFeaturedProperty(
  listing: NormalizedListing,
  index: number,
  imageOverride?: string | null,
  imageAlt?: string,
) {
  const isHouse = listing.type === "house";
  const image = imageOverride ?? (isHouse
    ? listing.thumbnail ?? listing.gallery[0] ?? "/images/properties/hero-estatebrothers.webp"
    : listing.thumbnail ?? listing.gallery[0] ?? "/images/properties/hero-estatebrothers.webp");
  const title = isHouse ? listing.title : `${listing.phase ?? "Property"} ${listing.size ?? ""}`.trim();
  const city = listing.city ?? "Lahore";
  return {
    id: String(index + 1).padStart(2, "0"),
    image,
    imageAlt,
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
  featuredListings,
  section,
}: {
  featuredListings: ReturnType<typeof normalizeFeaturedListings>;
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
        {featuredListings.length > 0 ? (
          <div className="property-list">
            {featuredListings.map((item, index) => (
              <Link key={item.id} href={`/buy-sell/${item.listing.type}/${item.listing.slug}`}>
                <PropertyRow property={listingToFeaturedProperty(item.listing, index, item.imageUrl, item.alt)} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="inventory-empty">
            <div className="serif-i">No published listings yet.</div>
            <p>Select published, indexable listings in this homepage section from the admin dashboard.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedProjects({
  section,
  projects,
}: {
  section: ReturnType<typeof getHomeSection>;
  projects: ReturnType<typeof normalizeFeaturedProjects>;
}) {
  if (!projects.length) return null;

  return (
    <section className="section home-project-showcase" id="featured-projects">
      <div className="wrap">
        <header className="section-hd reveal">
          <div className="label">
            <div className="eyebrow">{section?.eyebrow ?? "Featured projects"}</div>
            {section?.subheading && <div className="mono section-date">{section.subheading}</div>}
          </div>
          <div className="title">
            <h2>{section?.heading ?? "Project areas Estate Brothers is actively tracking."}</h2>
          </div>
          <div className="aux">
            <Link href="/buy-sell">View all listings -&gt;</Link>
          </div>
        </header>

        {section?.body && <p className="home-project-intro">{section.body}</p>}

        <div className="home-project-grid">
          {projects.map((project, index) => (
            <article className="home-project-card reveal" key={project.id}>
              <Link href={project.href} aria-label={`View Estate Brothers listings for ${project.title}`}>
                <span className="home-project-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="home-project-media">
                  {project.imageUrl ? (
                    <SafeMediaImage
                      src={project.imageUrl}
                      alt={project.alt}
                      width={720}
                      height={520}
                      loading="lazy"
                      sizes="(max-width: 900px) 100vw, 50vw"
                    />
                  ) : (
                    <span className="home-project-placeholder" aria-hidden="true">
                      EB
                    </span>
                  )}
                </span>
                <span className="home-project-copy">
                  <span className="mono">{project.label}</span>
                  <strong>{project.title}</strong>
                  <span>{project.location}</span>
                  <p>{project.description}</p>
                  {project.gallery.length > 1 && (
                    <>
                      <span className="home-project-thumbs" aria-label={`${project.title} image gallery preview`}>
                        {project.gallery.slice(0, 4).map((image) => (
                          <span key={image.id}>
                            <SafeMediaImage
                              src={image.imageUrl}
                              alt=""
                              width={96}
                              height={72}
                              loading="lazy"
                              sizes="96px"
                            />
                          </span>
                        ))}
                      </span>
                      <small className="home-project-gallery-count">{project.gallery.length} project images</small>
                    </>
                  )}
                  <em>View matching inventory -&gt;</em>
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Narrative({
  section,
  team,
}: {
  section: ReturnType<typeof getHomeSection>;
  team: Awaited<ReturnType<typeof getPublishedTeamMembers>>;
}) {
  const ceo = team.find((member) => member.name.toLowerCase().includes("tajamal")) ?? team[0];
  const leadershipImage =
    mediaUrl(section?.media_assets) ?? ceo?.imageUrl ?? "/images/team/ceo-tajamal-hussain.jpg";
  return (
    <section className="narrative" id="about">
      <div className="wrap">
        <div className="col-l reveal">
          <div className="img">
            <SafeMediaImage
              src={leadershipImage}
              alt={ceo ? `${ceo.name}, ${ceo.role ?? "Estate Brothers"}` : "Estate Brothers leadership"}
              width={600}
              height={700}
              loading="lazy"
              sizes="(max-width:768px) 100vw, 600px"
            />
            <span className="ph">{ceo ? `${ceo.role ?? "Leadership"} - ${ceo.name}` : "Estate Brothers leadership"}</span>
          </div>
        </div>
        <div className="col-r reveal">
          <div className="eyebrow">{section?.eyebrow ?? "Leadership"}</div>
          <h2>{section?.heading ?? "Built on trust, expertise, and results."}</h2>
          {section?.subheading && <p>{section.subheading}</p>}
          {section?.body && <p className="narrative-meta">{section.body}</p>}
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

function HomeGallery({
  section,
  items,
}: {
  section: ReturnType<typeof getHomeSection>;
  items: ReturnType<typeof normalizeHomeGallery>;
}) {
  if (!items.length) return null;

  return (
    <section className="life-gallery" aria-labelledby="home-gallery-title">
      <div className="wrap">
        <header className="life-gallery-head reveal">
          <div>
            <div className="eyebrow">{section?.eyebrow ?? "Gallery"}</div>
            <h2 id="home-gallery-title">{section?.heading ?? "Life around Estate Brothers."}</h2>
          </div>
          {section?.subheading && <p>{section.subheading}</p>}
        </header>
        <div className="life-gallery-grid">
          {items.map((item) => (
            <figure className="life-gallery-card reveal" key={item.id}>
              <SafeMediaImage
                src={item.imageUrl}
                alt={item.alt}
                width={720}
                height={520}
                loading="lazy"
                sizes="(max-width: 900px) 100vw, 33vw"
              />
              <figcaption>
                <strong>{item.title}</strong>
                {item.caption && <span>{item.caption}</span>}
                {item.href && <Link href={item.href}>View details -&gt;</Link>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeAwards({
  section,
  awards,
}: {
  section: ReturnType<typeof getHomeSection>;
  awards: ReturnType<typeof normalizeHomeAwards>;
}) {
  if (!awards.length) return null;

  return (
    <section className="home-awards" aria-labelledby="home-awards-title">
      <div className="wrap">
        <header className="home-awards-head reveal">
          <div>
            <div className="eyebrow">{section?.eyebrow ?? "Awards & recognition"}</div>
            <h2 id="home-awards-title">{section?.heading ?? "Recognition that reflects professional trust."}</h2>
          </div>
          <div>
            {section?.subheading && <p>{section.subheading}</p>}
            <Link href="/about">View company profile -&gt;</Link>
          </div>
        </header>
        <div className="home-awards-rail">
          {awards.map((award) => (
            <article className="home-award-card reveal" key={award.id}>
              <div className="home-award-media">
                {award.imageUrl ? (
                  <SafeMediaImage
                    src={award.imageUrl}
                    alt={award.alt}
                    width={420}
                    height={320}
                    loading="lazy"
                    sizes="(max-width: 900px) 80vw, 240px"
                  />
                ) : (
                  <span aria-hidden="true">EB</span>
                )}
              </div>
              <div className="home-award-copy">
                <span className="mono">{award.category}</span>
                <h3>{award.title}</h3>
                {award.issuer && <p>{award.issuer}</p>}
                {award.description && <small>{award.description}</small>}
                {award.referenceUrl && <Link href={award.referenceUrl}>View reference -&gt;</Link>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeTeamStories({
  section,
  stories,
}: {
  section: ReturnType<typeof getHomeSection>;
  stories: ReturnType<typeof normalizeHomeStories>;
}) {
  if (!stories.length) return null;

  return (
    <section className="home-stories" aria-labelledby="home-stories-title">
      <div className="wrap">
        <header className="section-hd reveal">
          <div className="label">
            <div className="eyebrow">{section?.eyebrow ?? "Team stories"}</div>
          </div>
          <div className="title">
            <h2 id="home-stories-title">{section?.heading ?? "People behind the property advice."}</h2>
          </div>
          <div className="aux">
            <Link href="/about">Meet the team -&gt;</Link>
          </div>
        </header>
        <div className="home-story-grid">
          {stories.map((story) => (
            <article className="home-story-card reveal" key={story.id}>
              <div className="home-story-top">
                <span className="mono">{story.code}</span>
                {story.videoUrl && <Link href={story.videoUrl} target="_blank" rel="noopener noreferrer">Watch</Link>}
              </div>
              {story.imageUrl && (
                <SafeMediaImage
                  src={story.imageUrl}
                  alt={story.alt}
                  width={640}
                  height={420}
                  loading="lazy"
                  sizes="(max-width: 900px) 100vw, 33vw"
                />
              )}
              <h3>{story.title}</h3>
              <p>{story.summary}</p>
              <small>{story.person}</small>
            </article>
          ))}
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
  if (!page) notFound();
  const heroStats = normalizeHomeStats(page.page_sections);
  const partners = normalizePartners(page.page_sections);
  const testimonials = normalizeTestimonials(page.page_sections);
  const testimonialStats = normalizeHomeStats(page.page_sections, "testimonial-stats");
  const featuredListings = normalizeFeaturedListings(page.page_sections, listings);
  const featuredProjects = normalizeFeaturedProjects(page.page_sections);
  const galleryItems = normalizeHomeGallery(page.page_sections);
  const awards = normalizeHomeAwards(page.page_sections);
  const stories = normalizeHomeStories(page.page_sections);
  const orderedSections = page.page_sections ?? [];
  const hasFeaturedListingsSection = orderedSections.some((section) => section.section_key === "featured-listings");
  const hasFeaturedProjectsSection = orderedSections.some((section) => section.section_key === "featured-projects");

  return (
    <>
      <Hero page={page} stats={heroStats} />
      {orderedSections.map((section) => {
        switch (section.section_key) {
          case "hero-stats":
          case "testimonial-stats":
            return null;
          case "partners":
            return (
              <PartnersCarousel
                key={section.id}
                eyebrow={section.eyebrow}
                heading={section.heading}
                intro={section.subheading ?? section.body}
                partners={partners}
              />
            );
          case "featured-projects":
            return (
              <Fragment key={section.id}>
                <FeaturedProjects section={section} projects={featuredProjects} />
                {!hasFeaturedListingsSection && <PopularSeoLinks placement="home" />}
              </Fragment>
            );
          case "featured-listings":
            return (
              <Fragment key={section.id}>
                <Featured featuredListings={featuredListings} section={section} />
                <PopularSeoLinks placement="home" />
              </Fragment>
            );
          case "leadership":
            return <Narrative key={section.id} section={section} team={team} />;
          case "life-gallery":
          case "gallery":
            return <HomeGallery key={section.id} section={section} items={galleryItems} />;
          case "awards-recognition":
            return <HomeAwards key={section.id} section={section} awards={awards} />;
          case "team-stories":
            return <HomeTeamStories key={section.id} section={section} stories={stories} />;
          case "testimonials":
            return (
              <Testimonial
                key={section.id}
                testimonials={testimonials}
                stats={testimonialStats}
                eyebrow={section.eyebrow}
                heading={section.heading}
                intro={section.subheading ?? section.body}
              />
            );
          default:
            return null;
        }
      })}
      {!hasFeaturedListingsSection && !hasFeaturedProjectsSection ? (
        <PopularSeoLinks placement="home" />
      ) : null}
    </>
  );
}
