import { describe, it, expect } from "vitest";
import { buildMetadata } from "../lib/seo/metadata";
import {
  buildWebSiteSchema,
  buildOrganizationSchema,
  buildRealEstateAgentSchema,
  buildBreadcrumbSchema,
  buildArticleSchema,
  buildRealEstateListingSchema,
  buildItemListSchema,
  buildProfilePageSchema,
} from "../lib/seo/structured-data";
import {
  calculateListingSeoQuality,
  calculateUpdateSeoQuality,
  detectBoilerplate,
} from "../lib/seo/validator";
import robots from "../app/robots";
import { canUseNextImage } from "../lib/media/images";
import { normalizeFeaturedListings, normalizeFeaturedProjects } from "../lib/db/home-content";
import { HOME_SECTION_DEFINITIONS, getHomeSectionDefinition } from "../lib/homepage/section-contract";
import type { PageSectionWithBlocks } from "../lib/db/site";
import type { NormalizedListing } from "../lib/types";

describe("SEO Metadata Builder", () => {
  it("formats title and creates absolute canonical URL", () => {
    const meta = buildMetadata({
      title: "5 Marla House in DHA Phase 6",
      description: "Luxury 5 marla designer house for sale in DHA Lahore.",
      canonicalPath: "/buy-sell/house/5-marla-dha-phase-6",
    });

    expect(meta.title).toEqual({ absolute: "5 Marla House in DHA Phase 6 | Estate Brothers" });
    expect(meta.description).toBe("Luxury 5 marla designer house for sale in DHA Lahore.");
    expect(meta.alternates?.canonical).toBe("https://estatebrothers.pk/buy-sell/house/5-marla-dha-phase-6");
  });

  it("handles root site title without duplicate brand suffix", () => {
    const meta = buildMetadata({
      title: "Estate Brothers",
      canonicalPath: "/",
    });

    expect(meta.title).toEqual({ absolute: "Estate Brothers" });
    expect(meta.alternates?.canonical).toBe("https://estatebrothers.pk/");
  });

  it("does not duplicate the brand when an admin-managed title already contains it", () => {
    const meta = buildMetadata({
      title: "DHA Lahore Plots for Sale | Estate Brothers",
      canonicalPath: "/dha-lahore-plots-for-sale",
    });

    expect(meta.title).toEqual({ absolute: "DHA Lahore Plots for Sale | Estate Brothers" });
    expect(meta.openGraph?.title).toBe("DHA Lahore Plots for Sale | Estate Brothers");
    expect(meta.twitter?.title).toBe("DHA Lahore Plots for Sale | Estate Brothers");
  });

  it("sets index, follow and googleBot directives when noIndex is false", () => {
    const meta = buildMetadata({
      title: "Public Page",
      canonicalPath: "/about",
      noIndex: false,
    });

    expect(meta.robots).toEqual({
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    });
  });

  it("sets noindex, nofollow when noIndex is true", () => {
    const meta = buildMetadata({
      title: "Unindexed Page",
      canonicalPath: "/private",
      noIndex: true,
    });

    expect(meta.robots).toEqual({
      index: false,
      follow: false,
    });
  });

  it("sets OpenGraph article type and timestamps for updates", () => {
    const meta = buildMetadata({
      title: "DHA Lahore Market Analysis 2026",
      canonicalPath: "/updates/dha-lahore-market-analysis-2026",
      ogType: "article",
      publishedTime: "2026-08-20T10:00:00Z",
      modifiedTime: "2026-08-21T10:00:00Z",
      authors: ["Estate Brothers Research Team"],
    });

    const og = meta.openGraph as Record<string, unknown>;
    expect(og?.type).toBe("article");
    expect(og?.publishedTime).toBe("2026-08-20T10:00:00Z");
    expect(og?.modifiedTime).toBe("2026-08-21T10:00:00Z");
    expect(og?.authors).toEqual(["Estate Brothers Research Team"]);
  });
});

describe("Structured Data / JSON-LD Schemas", () => {
  it("generates WebSite schema without obsolete SearchAction", () => {
    const schema = buildWebSiteSchema();

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("WebSite");
    expect(schema.name).toBe("Estate Brothers");
    expect(schema.url).toBe("https://estatebrothers.pk");
    // Ensure SearchAction is NOT present (deprecated globally by Google Nov 2024)
    expect((schema as Record<string, unknown>).potentialAction).toBeUndefined();
  });

  it("generates valid Organization schema", () => {
    const schema = buildOrganizationSchema();

    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe("Estate Brothers");
    expect(schema.url).toBe("https://estatebrothers.pk");
    expect(schema.contactPoint).toBeDefined();
    expect(schema.contactPoint["@type"]).toBe("ContactPoint");
  });

  it("generates valid RealEstateAgent LocalBusiness schema", () => {
    const schema = buildRealEstateAgentSchema({
      business_name: "Estate Brothers",
      city: "Lahore",
      address_line_1: "DHA Phase 6 Main Boulevard",
      latitude: 31.4697,
      longitude: 74.4013,
    });

    expect(schema["@type"]).toEqual(["RealEstateAgent", "LocalBusiness"]);
    expect(schema.name).toBe("Estate Brothers");
    expect(schema.address["@type"]).toBe("PostalAddress");
    expect(schema.address.addressLocality).toBe("Lahore");
    expect(schema.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: 31.4697,
      longitude: 74.4013,
    });
  });

  it("generates valid BreadcrumbList schema matching 1-based hierarchy", () => {
    const items = [
      { name: "Home", url: "https://estatebrothers.pk" },
      { name: "Buy/Sell", url: "https://estatebrothers.pk/buy-sell" },
      { name: "1 Kanal House DHA Phase 5", url: "https://estatebrothers.pk/buy-sell/house/1-kanal-dha-phase-5" },
    ];

    const schema = buildBreadcrumbSchema(items);

    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://estatebrothers.pk",
    });
    expect(schema.itemListElement[2]).toEqual({
      "@type": "ListItem",
      position: 3,
      name: "1 Kanal House DHA Phase 5",
      item: "https://estatebrothers.pk/buy-sell/house/1-kanal-dha-phase-5",
    });
  });

  it("generates valid Article schema with publisher, author, and dates", () => {
    const schema = buildArticleSchema({
      title: "Real Estate Trends 2026",
      summary: "Overview of commercial and residential property trends.",
      slug: "real-estate-trends-2026",
      publishedAt: "2026-08-01",
      updatedAt: "2026-08-15",
      author: "Mian Tayyab",
      media: { url: "/images/blog/trends.jpg" },
      schemaType: "NewsArticle",
      articleSection: "Market Analysis",
    });

    expect(schema["@type"]).toBe("NewsArticle");
    expect(schema.headline).toBe("Real Estate Trends 2026");
    expect(schema.datePublished).toBe("2026-08-01");
    expect(schema.dateModified).toBe("2026-08-15");
    expect(schema.articleSection).toBe("Market Analysis");
    expect(schema.author).toEqual({
      "@type": "Person",
      name: "Mian Tayyab",
    });
    expect(schema.publisher["@type"]).toBe("Organization");
  });

  it("generates valid RealEstateListing schema with price offer block", () => {
    const schema = buildRealEstateListingSchema({
      slug: "10-marla-phase-7",
      type: "house",
      title: "10 Marla Brand New House",
      price: "PKR 5.5 Crore",
      priceNumeric: 55000000,
      thumbnail: "/images/houses/10-marla.jpg",
      city: "Lahore",
      location: {
        address: "Street 12, Sector C",
        neighborhood: "DHA Phase 7",
        city: "Lahore",
        state: "Punjab",
        postalCode: "54000",
        country: "PK",
      },
      updatedAt: "2026-08-20",
    });

    expect(schema["@type"]).toBe("RealEstateListing");
    expect(schema.name).toBe("10 Marla Brand New House");
    expect(schema.url).toBe("https://estatebrothers.pk/buy-sell/house/10-marla-phase-7");
    expect(schema.offers).toEqual({
      "@type": "Offer",
      price: 55000000,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
    });
    expect(schema.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "Street 12, Sector C, DHA Phase 7",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      postalCode: "54000",
      addressCountry: "PK",
    });
  });

  it("generates ItemList schema for property indices", () => {
    const schema = buildItemListSchema([
      { slug: "plot-1", type: "plot", phase: "DHA Phase 6", size: "1 Kanal" },
      { slug: "house-1", type: "house", title: "Modern 5 Bed House" },
    ]);

    expect(schema["@type"]).toBe("ItemList");
    expect(schema.itemListElement).toHaveLength(2);
    expect(schema.itemListElement[0].name).toBe("DHA Phase 6 1 Kanal");
    expect(schema.itemListElement[1].name).toBe("Modern 5 Bed House");
  });
});

describe("Robots Configuration", () => {
  it("allows public crawling while protecting admin, dashboard, and API routes", () => {
    const config = robots();

    expect(config.sitemap).toBe("https://estatebrothers.pk/sitemap.xml");

    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const generalRule = rules.find((r) => r.userAgent === "*");
    expect(generalRule).toBeDefined();
    expect(generalRule?.allow).toBe("/");
    expect(generalRule?.disallow).toEqual(["/admin/", "/dashboard", "/dashboard/", "/api/"]);

    const aiRule = rules.find((r) => Array.isArray(r.userAgent) && r.userAgent.includes("GPTBot"));
    expect(aiRule).toBeDefined();
    expect(aiRule?.disallow).toBe("/");
  });
});

describe("Admin-managed media rendering safety", () => {
  it("allows Next image optimization for local, Supabase, and production-domain media", () => {
    expect(canUseNextImage("/images/example.jpg")).toBe(true);
    expect(canUseNextImage("https://zucpsqjiaexxxobzwodd.supabase.co/storage/v1/object/public/site-assets/example.jpg")).toBe(true);
    expect(canUseNextImage("https://estatebrothers.pk/og-default.jpg")).toBe(true);
  });

  it("generates valid ProfilePage schema with Person mainEntity", () => {
    const schema = buildProfilePageSchema({
      name: "Abdul Rehman",
      jobTitle: "Property Consultant",
      phone: "+92 300 0000000",
      email: "abdul@example.com",
      image: "/images/team/abdul.jpg",
      description: "Abdul Rehman advises clients on DHA Lahore residential plots and investment opportunities.",
      keywords: ["DHA Lahore", "Residential plots", "Investment advisory"],
      canonicalPath: "/team/abdul-rehman",
    });

    expect(schema["@type"]).toBe("ProfilePage");
    expect(schema.url).toBe("https://estatebrothers.pk/team/abdul-rehman");
    expect(schema.mainEntity["@type"]).toBe("Person");
    expect(schema.mainEntity.name).toBe("Abdul Rehman");
    expect(schema.mainEntity.jobTitle).toBe("Property Consultant");
    expect(schema.mainEntity.image).toBe("https://estatebrothers.pk/images/team/abdul.jpg");
    expect(schema.mainEntity.worksFor).toEqual({
      "@type": "Organization",
      name: "Estate Brothers",
      url: "https://estatebrothers.pk",
    });
  });

  it("falls back away from Next image optimization for unallowlisted external media", () => {
    expect(canUseNextImage("https://cdn.example.com/property.jpg")).toBe(false);
    expect(canUseNextImage("http://estatebrothers.pk/insecure.jpg")).toBe(false);
  });
});

describe("Homepage CMS production contract", () => {
  it("keeps projects and listings as independent ordered homepage sections", () => {
    expect(HOME_SECTION_DEFINITIONS.map((section) => section.key)).toEqual([
      "hero-stats",
      "partners",
      "featured-projects",
      "featured-listings",
      "leadership",
      "life-gallery",
      "awards-recognition",
      "team-stories",
      "testimonials",
      "testimonial-stats",
    ]);
    expect(getHomeSectionDefinition("featured-listings")?.defaultSortOrder).toBeGreaterThan(
      getHomeSectionDefinition("featured-projects")?.defaultSortOrder ?? 0,
    );
  });

  it("renders only explicitly linked, indexable featured listings with a block image override", () => {
    const listing = {
      id: "listing-1",
      slug: "linked-listing",
      type: "plot",
      phase: "DHA Phase 6",
      project: null,
      block: null,
      city: "Lahore",
      size: "1 Kanal",
      price: "PKR 5 Crore",
      priceNumeric: 50000000,
      status: "Available",
      availability: "available",
      noindex: false,
      contactPersonId: null,
      thumbnail: "/listing.jpg",
      gallery: [],
      notes: "A linked published listing.",
      updatedAt: "2026-08-29",
    } satisfies NormalizedListing;
    const sections = [{
      section_key: "featured-listings",
      page_blocks: [{
        id: "block-1",
        listing_id: "listing-1",
        media_assets: { media_type: "image", public_url: "/override.jpg", external_url: null, thumbnail_url: null, alt_text: "Front view" },
      }],
    }] as unknown as PageSectionWithBlocks[];

    const result = normalizeFeaturedListings(sections, [listing]);
    expect(result).toHaveLength(1);
    expect(result[0].listing.slug).toBe("linked-listing");
    expect(result[0].imageUrl).toBe("/override.jpg");
    expect(result[0].alt).toBe("Front view");
  });

  it("keeps every published project block instead of silently capping the collection", () => {
    const sections = [{
      section_key: "featured-projects",
      page_blocks: Array.from({ length: 7 }, (_, index) => ({
        id: `project-${index}`,
        title: `Project ${index}`,
        body: `Useful project summary ${index}`,
        link_label: "Lahore",
        link_url: "/buy-sell",
        icon_name: "Residential",
        attributes: {},
        page_block_media: [],
      })),
    }] as unknown as PageSectionWithBlocks[];

    expect(normalizeFeaturedProjects(sections)).toHaveLength(7);
  });
});

describe("SEO Quality & Boilerplate Validator", () => {
  it("grades a complete, high-quality property listing as excellent", () => {
    const report = calculateListingSeoQuality({
      title: "1 Kanal Luxury Designer House in DHA Phase 6",
      meta_title: "1 Kanal Luxury Designer House for Sale in DHA Phase 6 Lahore",
      meta_description: "Exquisite 1 Kanal 5-bedroom modern house for sale in DHA Phase 6 Lahore. Designer kitchen, imported fittings, lush lawn, and direct possession. Call Estate Brothers.",
      summary: "Modern 1 Kanal house with 5 master bedrooms, imported spanish tiles, and lush green lawn.",
      description: "Located on Main Boulevard Sector C, this brand new luxury house offers state of the art architecture, solar system, and servant quarters.",
      phase: "DHA Phase 6",
      city: "Lahore",
      size_label: "1 Kanal",
      price_label: "PKR 6.5 Crore",
      price_numeric: 65000000,
      bedrooms: 5,
      bathrooms: 6,
      listing_type_slug: "house",
      slug: "1-kanal-luxury-house-dha-phase-6",
      has_media: true,
      media_alt_text: "Front elevation view of 1 Kanal luxury house in DHA Phase 6 Lahore",
    });

    expect(report.score).toBeGreaterThanOrEqual(85);
    expect(report.grade).toBe("excellent");
    expect(report.warnings).toHaveLength(0);
    expect(report.serpTitle).toContain("1 Kanal Luxury Designer House");
  });

  it("grades an incomplete, thin listing as poor or needs work", () => {
    const report = calculateListingSeoQuality({
      title: "House",
      meta_title: "",
      meta_description: "",
      summary: "",
      description: "",
      phase: "",
      city: "Lahore",
      size_label: "",
      price_label: "On Call",
      price_numeric: null,
      listing_type_slug: "house",
      slug: "",
      has_media: false,
      media_alt_text: "",
    });

    expect(report.score).toBeLessThanOrEqual(50);
    expect(["poor", "needs_work"]).toContain(report.grade);
    expect(report.checks.some((c) => !c.passed && c.id === "unique_description")).toBe(true);
  });

  it("detects generic real-estate filler boilerplate", () => {
    const warnings = detectBoilerplate(
      "Prime location hot deal in DHA Lahore. Best property hurry up and contact us for more details."
    );

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain("Contains generic real-estate filler copy");
  });

  it("detects excessive keyword repetition", () => {
    const warnings = detectBoilerplate(
      "DHA house for sale. This DHA property in DHA sector is the best DHA home in DHA Phase 6."
    );

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some((w) => w.includes("keyword repetition"))).toBe(true);
  });

  it("evaluates blog/article SEO quality properly", () => {
    const report = calculateUpdateSeoQuality({
      title: "DHA Lahore Market Outlook: Property Investment Guide 2026",
      meta_title: "DHA Lahore Market Outlook: 2026 Property Investment Guide",
      meta_description: "In-depth analysis of residential and commercial property trends in DHA Lahore for 2026. Explore price trends, development timelines, and high-ROI sectors.",
      summary: "Comprehensive market analysis and growth forecasts for property investors in Lahore.",
      body: "Over the past six months, DHA Lahore has demonstrated remarkable resilience across residential sectors. Investors looking for capital appreciation should closely monitor Phase 6, Phase 7, and Phase 9 Prism as infrastructure projects reach completion. Commercial sectors in Phase 6 continue to generate stable rental yields.",
      author_id: "author-123",
      tags: ["DHA Lahore", "Market Analysis", "Investment"],
      slug: "dha-lahore-market-outlook-2026",
      has_media: true,
      media_alt: "Chart illustrating DHA Lahore property price index 2026",
    });

    expect(report.score).toBeGreaterThanOrEqual(85);
    expect(report.grade).toBe("excellent");
  });
});
