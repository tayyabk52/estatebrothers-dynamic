import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { SafeMediaImage } from "@/components/ui/SafeMediaImage";
import { getRedirectForPath } from "@/lib/db/redirects";
import { getIndexableTeamProfiles, getPublishedTeamProfileBySlug } from "@/lib/db/team";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, buildProfilePageSchema } from "@/lib/seo/structured-data";
import "@/styles/about.css";
import "@/styles/buySell.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function paragraphs(body?: string | null) {
  return (body ?? "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export async function generateStaticParams() {
  const profiles = await getIndexableTeamProfiles();
  const params = profiles.map((profile) => ({ slug: profile.slug ?? "" })).filter((param) => param.slug);
  return params.length ? params : [{ slug: "__placeholder" }];
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getPublishedTeamProfileBySlug(slug);
  if (!profile?.profilePath) return {};

  return buildMetadata({
    title: profile.metaTitle ?? `${profile.name} | Estate Brothers`,
    description: profile.metaDescription ?? profile.profileSummary ?? undefined,
    canonicalPath: profile.profilePath,
    image: profile.ogImage ?? profile.imageUrl ?? "/og-default.jpg",
    keywords: profile.keywords,
    ogType: "profile",
  });
}

export default async function TeamProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getPublishedTeamProfileBySlug(slug);

  if (!profile?.profilePath) {
    const redirectTarget = await getRedirectForPath(`/team/${slug}`);
    if (redirectTarget) permanentRedirect(redirectTarget.target_path);
    notFound();
  }

  const profileSchema = buildProfilePageSchema({
    name: profile.name,
    jobTitle: profile.role ?? undefined,
    phone: profile.phone ?? undefined,
    email: profile.email ?? undefined,
    image: profile.imageUrl ?? undefined,
    description: profile.profileSummary ?? profile.metaDescription ?? undefined,
    keywords: profile.keywords,
    canonicalPath: profile.profilePath,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://www.estatebrothers.pk" },
    { name: "About", url: "https://www.estatebrothers.pk/about" },
    { name: profile.name, url: `https://www.estatebrothers.pk${profile.profilePath}` },
  ]);
  const bodyParagraphs = paragraphs(profile.profileBody);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main>
        <section className="detail-hero team-profile-hero">
          <div className="wrap">
            <nav aria-label="Breadcrumb" className="breadcrumb-nav">
              <ol className="breadcrumb-list">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-separator" aria-hidden="true">/</li>
                <li className="breadcrumb-item"><Link href="/about">About</Link></li>
                <li className="breadcrumb-separator" aria-hidden="true">/</li>
                <li className="breadcrumb-item" aria-current="page"><span>{profile.name}</span></li>
              </ol>
            </nav>
            <div className="detail-title">
              <div className="eyebrow">Estate Brothers team</div>
              <h1>{profile.name}</h1>
              {profile.role && <p>{profile.role}</p>}
            </div>
            <div className="detail-price">
              <span>Profile</span>
              <strong>{profile.updatedAt ?? "Current"}</strong>
            </div>
          </div>
        </section>

        <section className="detail-body team-profile-body">
          <div className="wrap">
            <div className="team-profile-grid">
              <aside className="team-profile-card">
                {profile.imageUrl && (
                  <SafeMediaImage
                    src={profile.imageUrl}
                    alt={profile.imageAlt ?? `${profile.name}, ${profile.role ?? "Estate Brothers"}`}
                    width={520}
                    height={620}
                    sizes="(max-width: 860px) 100vw, 420px"
                    preload
                  />
                )}
                <div className="team-profile-contact">
                  <h2>{profile.name}</h2>
                  {profile.role && <p>{profile.role}</p>}
                  {profile.phone && <a href={`tel:${profile.phone.replace(/\s/g, "")}`}>{profile.phone}</a>}
                  {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`}>WhatsApp</a>}
                  {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
                </div>
              </aside>

              <article className="team-profile-content">
                {profile.profileSummary && <p className="team-profile-summary">{profile.profileSummary}</p>}
                {bodyParagraphs.length > 0 ? (
                  bodyParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                ) : null}
                {profile.keywords?.length ? (
                  <div className="update-tags" aria-label="Expertise areas">
                    {profile.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
                  </div>
                ) : null}
                <div className="updates-actions update-detail-links">
                  <Link href="/contact">Contact Estate Brothers</Link>
                  <Link href="/buy-sell">View active listings</Link>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
