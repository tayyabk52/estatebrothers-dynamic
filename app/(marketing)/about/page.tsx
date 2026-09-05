import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublishedPage,
  getPublishedOfficeLocations,
  mediaUrl,
  type PageBlockWithMedia,
  type PageSectionWithBlocks,
} from "@/lib/db/site";
import { getPublishedTeamMembers } from "@/lib/db/team";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildPersonSchema } from "@/lib/seo/structured-data";
import "@/styles/about.css";

const SITE_URL = "https://www.estatebrothers.pk";
const SITE_NAME = "Estate Brothers";

function AboutHeroHeading({ text }: { text: string }) {
  const emphasis = "trust, market knowledge, and results.";
  const start = text.toLowerCase().indexOf(emphasis);
  if (start < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, start)}
      <span className="serif-i">{text.slice(start, start + emphasis.length)}</span>
      {text.slice(start + emphasis.length)}
    </>
  );
}

function cleanTitle(title?: string | null) {
  const normalized = (title || "About Estate Brothers").trim();
  return normalized.replace(/\s+\|\s+Estate Brothers$/i, "");
}

export async function generateMetadata() {
  const page = await getPublishedPage("/about");
  return buildMetadata({
    title: cleanTitle(page?.meta_title),
    description: page?.meta_description,
    canonicalPath: "/about",
    image: page?.og_image ?? mediaUrl(page?.hero_media) ?? "/og-default.jpg",
    noIndex: page?.noindex ?? true,
    keywords: page?.keywords ?? ["real estate agent Lahore", "DHA Phase 6 real estate"],
  });
}

function EmptyAbout() {
  return (
    <main>
      <section className="about-hero">
        <div className="wrap">
          <div className="inventory-empty">
            <div className="serif-i">About page content is not published yet.</div>
            <p>Publish the About page, team members, and office locations in the admin dashboard.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function publishedBlocks(section: PageSectionWithBlocks) {
  return (section.page_blocks ?? [])
    .filter((block) => block.status === "published")
    .sort((a, b) => a.sort_order - b.sort_order);
}

function attrString(block: PageBlockWithMedia, key: string) {
  const attrs = block.attributes;
  if (!attrs || typeof attrs !== "object" || Array.isArray(attrs)) return "";
  const value = (attrs as Record<string, unknown>)[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function blockImage(block: PageBlockWithMedia) {
  return mediaUrl(block.media_assets);
}

function imageAlt(block: PageBlockWithMedia, fallback: string) {
  return block.media_assets?.alt_text ?? fallback;
}

function SectionHead({ section, id }: { section: PageSectionWithBlocks; id: string }) {
  return (
    <header className="about-section-head reveal">
      {section.eyebrow && <div className="eyebrow">{section.eyebrow}</div>}
      <div>
        {section.heading && <h2 id={id}>{section.heading}</h2>}
        {section.subheading && <p>{section.subheading}</p>}
      </div>
    </header>
  );
}

function ProofSection({ section }: { section: PageSectionWithBlocks }) {
  const blocks = publishedBlocks(section);
  if (!blocks.length) return null;
  return (
    <section className="about-proof" aria-label={section.heading ?? "Estate Brothers proof points"}>
      <div className="wrap">
        {blocks.map((block) => (
          <div className="proof-cell reveal" key={block.id}>
            <span className="value">{block.title}</span>
            <span className="label">{block.body}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServicesSection({ section }: { section: PageSectionWithBlocks }) {
  const blocks = publishedBlocks(section);
  return (
    <section className="about-section about-services" aria-labelledby={`${section.id}-title`}>
      <div className="wrap">
        <SectionHead section={section} id={`${section.id}-title`} />
        {blocks.length > 0 ? (
          <div className="pillar-grid">
            {blocks.map((block, index) => (
              <article className="pillar reveal" key={block.id}>
                <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  {block.title && <h3>{block.title}</h3>}
                  {block.body && <p>{block.body}</p>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          section.body && <p>{section.body}</p>
        )}
      </div>
    </section>
  );
}

function AwardsSection({ section }: { section: PageSectionWithBlocks }) {
  const blocks = publishedBlocks(section);
  if (!blocks.length) return null;
  return (
    <section className="about-section about-posts" aria-labelledby={`${section.id}-title`}>
      <div className="wrap">
        <SectionHead section={section} id={`${section.id}-title`} />
      </div>
      <div className="about-carousel posts-carousel" aria-label={section.heading ?? "Estate Brothers awards and recognition"}>
        {blocks.map((block) => {
          const image = blockImage(block);
          const label = block.icon_name || attrString(block, "type") || "Recognition";
          return (
            <article className="post-card reveal" key={block.id}>
              {image && (
                <div className="post-image">
                  <Image
                    src={image}
                    alt={imageAlt(block, block.title ?? "Estate Brothers recognition")}
                    width={600}
                    height={450}
                    loading="lazy"
                    sizes="(max-width:768px) 82vw, 378px"
                  />
                  <span>{label}</span>
                </div>
              )}
              <div className="post-copy">
                <span className="mono">{attrString(block, "issuer") || SITE_NAME}</span>
                {block.title && <h3>{block.title}</h3>}
                {block.body && <p>{block.body}</p>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function StoryPoster({ block }: { block: PageBlockWithMedia }) {
  const image = blockImage(block);
  const initials = attrString(block, "storyCode") || (block.link_label ?? block.title ?? "EB").slice(0, 2);
  if (image) {
    return (
      <div className="story-poster">
        <Image
          src={image}
          alt={imageAlt(block, block.title ?? "Estate Brothers team story")}
          width={640}
          height={400}
          loading="lazy"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <span className="story-play" aria-hidden="true"><span /></span>
      </div>
    );
  }
  return (
    <div className="story-poster" aria-hidden="true">
      <span className="story-initials">{initials}</span>
      <span className="story-play"><span /></span>
    </div>
  );
}

function TeamStoriesSection({ section }: { section: PageSectionWithBlocks }) {
  const blocks = publishedBlocks(section);
  if (!blocks.length) return null;
  return (
    <section className="about-videos" aria-labelledby={`${section.id}-title`}>
      <div className="wrap">
        <SectionHead section={section} id={`${section.id}-title`} />
        <div className="video-story-grid">
          {blocks.map((block, index) => (
            <article className="video-story reveal" key={block.id}>
              <span className="story-index mono">{String(index + 1).padStart(2, "0")}</span>
              <StoryPoster block={block} />
              <div className="story-copy">
                <div className="story-meta">
                  <span>{attrString(block, "storyCode") || block.icon_name || "EB"}</span>
                  <span>{attrString(block, "duration") || block.icon_name}</span>
                </div>
                {block.title && <h3>{block.title}</h3>}
                {block.body && <p>{block.body}</p>}
                <div className="story-person">
                  <span className="name">{block.link_label || attrString(block, "person") || SITE_NAME}</span>
                  <span className="role">{attrString(block, "role") || "Estate Brothers"}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function OperatingSection({ section }: { section: PageSectionWithBlocks }) {
  const blocks = publishedBlocks(section);
  return (
    <section className="about-operating" aria-labelledby={`${section.id}-title`}>
      <div className="wrap">
        <div className="operating-title reveal">
          {section.eyebrow && <div className="eyebrow">{section.eyebrow}</div>}
          {section.heading && <h2 id={`${section.id}-title`}>{section.heading}</h2>}
        </div>
        <div className="operating-list">
          {(blocks.length ? blocks : []).map((block, index) => (
            <div className="operating-row reveal" key={block.id}>
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <p>{block.body || block.title}</p>
            </div>
          ))}
          {!blocks.length && section.body && (
            <div className="operating-row reveal">
              <span className="mono">01</span>
              <p>{section.body}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BranchesSection({ section }: { section: PageSectionWithBlocks }) {
  const blocks = publishedBlocks(section);
  return (
    <section className="about-branches" aria-labelledby={`${section.id}-title`}>
      <div className="wrap">
        <div className="branch-panel reveal">
          <div>
            {section.eyebrow && <div className="eyebrow">{section.eyebrow}</div>}
            {section.heading && <h2 id={`${section.id}-title`}>{section.heading}</h2>}
          </div>
          <div className="branch-list">
            {(blocks.length ? blocks : [{ id: section.id, body: section.body }]).map((block) => (
              <p key={block.id}>{block.body}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function GenericSection({ section }: { section: PageSectionWithBlocks }) {
  const blocks = publishedBlocks(section);
  const image = mediaUrl(section.media_assets);
  return (
    <section className="about-section" aria-labelledby={`${section.id}-title`}>
      <div className="wrap">
        <SectionHead section={section} id={`${section.id}-title`} />
        {image && (
          <div className="post-image reveal">
            <Image
              src={image}
              alt={section.media_assets?.alt_text ?? section.heading ?? section.eyebrow ?? "Estate Brothers"}
              width={900}
              height={600}
              loading="lazy"
              sizes="(max-width:768px) 100vw, 900px"
            />
          </div>
        )}
        {section.body && <p>{section.body}</p>}
        {blocks.length > 0 && (
          <div className="pillar-grid">
            {blocks.map((block, index) => (
              <article className="pillar reveal" key={block.id}>
                <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  {block.title && <h3>{block.title}</h3>}
                  {block.body && <p>{block.body}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AboutCmsSection({ section }: { section: PageSectionWithBlocks }) {
  if (section.section_key === "about-proof") return <ProofSection section={section} />;
  if (section.section_key === "services") return <ServicesSection section={section} />;
  if (section.section_key === "awards-recognition") return <AwardsSection section={section} />;
  if (section.section_key === "team-stories") return <TeamStoriesSection section={section} />;
  if (section.section_key === "operating-model") return <OperatingSection section={section} />;
  if (section.section_key === "branches-support") return <BranchesSection section={section} />;
  return <GenericSection section={section} />;
}

function aboutStructuredData(sections: PageSectionWithBlocks[]) {
  const awards = sections
    .find((section) => section.section_key === "awards-recognition")
    ? publishedBlocks(sections.find((section) => section.section_key === "awards-recognition")!)
    : [];
  const stories = sections
    .find((section) => section.section_key === "team-stories")
    ? publishedBlocks(sections.find((section) => section.section_key === "team-stories")!)
    : [];

  const schemas: object[] = [];
  if (awards.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      award: awards.map((award) => award.title).filter(Boolean),
      hasCredential: awards
        .filter((award) => /registration|certificate|membership|taxpayer|dnbfp|dnfbp/i.test(`${award.title} ${award.icon_name}`))
        .map((award) => ({
          "@type": "EducationalOccupationalCredential",
          name: award.title,
          description: award.body,
          image: blockImage(award),
        })),
    });
  }

  stories.forEach((story) => {
    const videoUrl = attrString(story, "videoUrl") || story.media_assets?.embed_url || story.media_assets?.external_url;
    if (!videoUrl) return;
    schemas.push({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: story.title,
      description: story.body,
      thumbnailUrl: blockImage(story),
      uploadDate: attrString(story, "uploadDate") || undefined,
      duration: attrString(story, "durationIso") || undefined,
      embedUrl: story.media_assets?.embed_url || undefined,
      contentUrl: videoUrl,
    });
  });

  return schemas;
}

export default async function AboutPage() {
  const [page, teamMembers, offices] = await Promise.all([
    getPublishedPage("/about"),
    getPublishedTeamMembers(),
    getPublishedOfficeLocations(),
  ]);

  if (!page) notFound();

  const heroImage = mediaUrl(page.hero_media);
  const sections = page.page_sections ?? [];
  const chiefExecutive =
    teamMembers.find((member) => member.name.toLowerCase().includes("tajamal")) ?? teamMembers[0];
  const proofSection = sections.find((section) => section.section_key === "about-proof");
  const remainingSections = sections.filter((section) => section.section_key !== "about-proof");
  const sectionSchemas = aboutStructuredData(sections);
  const personSchemas = teamMembers.map((member) => ({
    key: member.id,
    schema: buildPersonSchema({
      name: member.name,
      jobTitle: member.role ?? undefined,
      phone: member.phone ?? undefined,
      email: member.email ?? undefined,
    }),
  }));

  return (
    <main>
      {personSchemas.map(({ key, schema }) => (
        <script
          key={key}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {sectionSchemas.map((schema, index) => (
        <script
          key={`about-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="about-hero">
        <div className="wrap">
          <div className="about-hero-copy reveal">
            <div className="eyebrow">{page.title}</div>
            <h1><AboutHeroHeading text={page.heading ?? page.title} /></h1>
            {page.intro && <p>{page.intro}</p>}
          </div>

          {heroImage && (
            <div className="about-hero-media reveal">
              <Image
                src={heroImage}
                alt={page.heading ?? page.title}
                width={600}
                height={700}
                priority
                sizes="(max-width:768px) 100vw, 600px"
              />
              {chiefExecutive && (
                <div className="about-media-caption">
                  <span className="mono">{chiefExecutive.role ?? "Chief Executive Officer"}</span>
                  <strong>{chiefExecutive.name}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {proofSection && <ProofSection section={proofSection} />}

      {offices.length > 0 && (
        <section className="about-section about-offices" aria-labelledby="about-offices-title">
          <div className="wrap">
            <header className="about-section-head reveal">
              <div className="eyebrow">Office locations</div>
              <div>
                <h2 id="about-offices-title">Real offices, visible presence, and a team clients can visit.</h2>
                <p>Estate Brothers operates from DHA Phase 6 Lahore for private meetings, client advisory, documentation, and site coordination.</p>
              </div>
            </header>
            <div className="office-grid">
              {offices.map((office) => (
                <article className={`office-card reveal${office.imageUrl ? "" : " office-card-text-only"}`} key={office.id}>
                  {office.imageUrl && (
                    <div className="office-photo">
                      <Image
                        src={office.imageUrl}
                        alt={office.name}
                        width={600}
                        height={400}
                        loading="lazy"
                        sizes="(max-width:768px) 100vw, 600px"
                      />
                      {office.status_label && <span className="office-status">{office.status_label}</span>}
                    </div>
                  )}
                  <div className="office-copy">
                    <h3>{office.name}</h3>
                    {office.detail && <p>{office.detail}</p>}
                    <span className="mono">
                      {[office.address_line_1, office.city, office.region].filter(Boolean).join(", ")}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="about-section about-team" aria-labelledby="about-team-title">
        <div className="wrap">
          <header className="about-section-head reveal">
            <div className="eyebrow">Our team</div>
            <div>
              <h2 id="about-team-title">The people clients speak with, meet, and trust through the process.</h2>
              <p>A working team across leadership, branch management, sales direction, and client advisory.</p>
            </div>
          </header>
        </div>
        {teamMembers.length > 0 ? (
          <div className="about-carousel" aria-label="Estate Brothers team members">
            {teamMembers.map((member) => (
              <article className="team-card reveal" key={member.id}>
                <div className="team-avatar">
                  {member.imageUrl ? (
                    <Image
                      src={member.imageUrl}
                      alt={member.name}
                      width={132}
                      height={132}
                      loading="lazy"
                      sizes="132px"
                    />
                  ) : (
                    <span>
                      {member.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="team-copy">
                  {member.role && <span className="role">{member.role}</span>}
                  <h3>{member.name}</h3>
                  {member.profilePath && <Link href={member.profilePath}>View profile</Link>}
                  {member.phone && <a href={`tel:${member.phone.replace(/\s/g, "")}`}>{member.phone}</a>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="wrap">
            <div className="inventory-empty">
              <div className="serif-i">No public team members yet.</div>
              <p>Published team members will appear here.</p>
            </div>
          </div>
        )}
      </section>

      {remainingSections.map((section) => <AboutCmsSection section={section} key={section.id} />)}
    </main>
  );
}
