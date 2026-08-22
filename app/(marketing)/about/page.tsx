import Image from "next/image";
import { getPublishedPage, getPublishedOfficeLocations, mediaUrl } from "@/lib/db/site";
import { getPublishedTeamMembers } from "@/lib/db/team";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildPersonSchema } from "@/lib/seo/structured-data";
import "@/styles/about.css";

export async function generateMetadata() {
  const page = await getPublishedPage("/about");
  return buildMetadata({
    title: page?.meta_title ?? "About",
    description: page?.meta_description,
    canonicalPath: "/about",
    image: page?.og_image ?? mediaUrl(page?.hero_media) ?? "/og-default.jpg",
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

export default async function AboutPage() {
  const [page, teamMembers, offices] = await Promise.all([
    getPublishedPage("/about"),
    getPublishedTeamMembers(),
    getPublishedOfficeLocations(),
  ]);

  if (!page) return <EmptyAbout />;

  const heroImage = mediaUrl(page.hero_media);
  const personSchemas = teamMembers.map((member) =>
    buildPersonSchema({
      name: member.name,
      jobTitle: member.role ?? undefined,
      phone: member.phone ?? undefined,
      email: member.email ?? undefined,
    })
  );

  return (
    <main>
      {personSchemas.map((schema) => (
        <script
          key={schema.name}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="about-hero">
        <div className="wrap">
          <div className="about-hero-copy reveal">
            <div className="eyebrow">{page.title}</div>
            <h1>{page.heading ?? page.title}</h1>
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
            </div>
          )}
        </div>
      </section>

      {offices.length > 0 && (
        <section className="about-section about-offices" aria-labelledby="about-offices-title">
          <div className="wrap">
            <header className="about-section-head reveal">
              <div className="eyebrow">Office locations</div>
              <div>
                <h2 id="about-offices-title">Office locations published by Estate Brothers.</h2>
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
              <h2 id="about-team-title">Published Estate Brothers team members.</h2>
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

      {(page.page_sections ?? []).map((section) => (
        <section className="about-section" key={section.id}>
          <div className="wrap">
            <header className="about-section-head reveal">
              {section.eyebrow && <div className="eyebrow">{section.eyebrow}</div>}
              <div>
                {section.heading && <h2>{section.heading}</h2>}
                {section.subheading && <p>{section.subheading}</p>}
              </div>
            </header>
            {section.body && <p>{section.body}</p>}
          </div>
        </section>
      ))}
    </main>
  );
}
