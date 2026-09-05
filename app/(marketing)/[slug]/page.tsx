import { notFound, permanentRedirect } from "next/navigation";
import { SeoLandingListings } from "@/components/seo/SeoLandingListings";
import { getAllPublishedListings } from "@/lib/db/listings";
import {
  getSeoLandingPageByPath,
  getIndexableSeoLandingPages,
  getSeoPageByPath,
  getSeoUrlRuleByPath,
  landingPageImage,
  listingMatchesSeoLandingPage,
} from "@/lib/db/seo";
import { mediaUrl } from "@/lib/db/site";
import { buildAgentMap, getPublishedTeamMembers } from "@/lib/db/team";
import { buildMetadata } from "@/lib/seo/metadata";
import { isCleanSeoLandingPath, seoLandingSlugFromPath } from "@/lib/seo/landing-routes";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/lib/seo/structured-data";
import { SafeMediaImage } from "@/components/ui/SafeMediaImage";
import type { NormalizedHouse } from "@/lib/types";
import "@/styles/buySell.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function routePath(slug: string) {
  return `/${slug}`;
}

function paragraphs(body?: string | null) {
  return (body ?? "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function safeStructuredData(value: unknown) {
  if (!value || typeof value !== "object") return [];
  const items = Array.isArray(value) ? value : [value];
  return items.filter((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    const record = item as Record<string, unknown>;
    return typeof record["@context"] === "string" && typeof record["@type"] === "string";
  });
}

export async function generateStaticParams() {
  const pages = await getIndexableSeoLandingPages();
  const params = pages
    .map((page) => seoLandingSlugFromPath(page.canonical_path))
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
  return params.length ? params : [{ slug: "__seo-placeholder" }];
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const path = routePath(slug);
  if (!isCleanSeoLandingPath(path)) return {};

  const [landingPage, seoPage, urlRule] = await Promise.all([
    getSeoLandingPageByPath(path),
    getSeoPageByPath(path),
    getSeoUrlRuleByPath(path),
  ]);

  if (!landingPage) return {};

  return buildMetadata({
    title: seoPage?.meta_title ?? landingPage.meta_title,
    description: seoPage?.meta_description ?? landingPage.meta_description,
    canonicalPath: urlRule?.rule_kind === "canonical" && urlRule.canonical_path
      ? urlRule.canonical_path
      : seoPage?.canonical_url ?? landingPage.canonical_path,
    image: seoPage?.og_image ?? landingPageImage(landingPage),
    noIndex: Boolean(urlRule?.rule_kind === "noindex" || seoPage?.noindex || landingPage.noindex),
    keywords: seoPage?.keywords ?? landingPage.keywords,
  });
}

export default async function CleanSeoLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const path = routePath(slug);
  if (!isCleanSeoLandingPath(path)) notFound();

  const urlRule = await getSeoUrlRuleByPath(path);
  if (urlRule?.rule_kind === "canonical" && urlRule.canonical_path && urlRule.canonical_path !== path) {
    permanentRedirect(urlRule.canonical_path);
  }

  const landingPage = await getSeoLandingPageByPath(path);
  if (!landingPage) notFound();

  const [allListings, teamMembers, seoPage] = await Promise.all([
    getAllPublishedListings(),
    getPublishedTeamMembers(),
    getSeoPageByPath(path),
  ]);
  const listings = allListings.filter((listing) => listingMatchesSeoLandingPage(listing, landingPage));
  const agentMap = buildAgentMap(teamMembers);
  const heroImage = mediaUrl(landingPage.hero_media);
  const heroAlt = landingPage.hero_media?.alt_text || landingPage.heading || landingPage.title;
  const structuredData = [
    buildBreadcrumbSchema([
      { name: "Home", url: "https://www.estatebrothers.pk" },
      { name: landingPage.title, url: `https://www.estatebrothers.pk${landingPage.canonical_path}` },
    ]),
    buildItemListSchema(listings.map((listing) => ({
      slug: listing.slug,
      type: listing.type,
      title: listing.type === "house" ? (listing as NormalizedHouse).title : undefined,
      phase: listing.phase ?? undefined,
      size: listing.size ?? undefined,
    }))),
    ...safeStructuredData(seoPage?.structured_data_overrides),
  ];

  return (
    <>
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <main>
        <section className={`inventory-hero seo-landing-hero${heroImage ? " has-media" : ""}`}>
          <div className="wrap">
            <div className="inventory-hero-copy reveal">
              <div className="eyebrow">Estate Brothers</div>
              <h1>{landingPage.heading}</h1>
              <p>{landingPage.intro}</p>
            </div>
            {heroImage ? (
              <figure className="seo-landing-hero-media reveal">
                <SafeMediaImage
                  src={heroImage}
                  alt={heroAlt}
                  width={900}
                  height={620}
                  preload
                  sizes="(max-width: 980px) 100vw, 36vw"
                />
                {landingPage.hero_media?.caption ? (
                  <figcaption>{landingPage.hero_media.caption}</figcaption>
                ) : null}
              </figure>
            ) : null}
            <div className="inventory-hero-meta reveal">
              <span className="mono">{landingPage.page_type.replace("_", " ")}</span>
              <strong>{listings.length}</strong>
              <span>matching listings</span>
            </div>
          </div>
        </section>

        <section className="inventory-results">
          <div className="wrap">
            <div className="inventory-section-head reveal">
              <div>
                <h2>{landingPage.title}</h2>
                <span className="inventory-updated mono">
                  Updated: {landingPage.updated_at.slice(0, 10)}
                </span>
              </div>
              <p>{landingPage.meta_description}</p>
            </div>

            {paragraphs(landingPage.body).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <h2 className="seo-listing-title">Matching listings</h2>
            <SeoLandingListings listings={listings} agentMap={agentMap} />
          </div>
        </section>
      </main>
    </>
  );
}
