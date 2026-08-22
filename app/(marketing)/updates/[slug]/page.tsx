import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ExternalLink, FileText } from "lucide-react";
import { getAllPublishedUpdateSlugs, getPublishedUpdateBySlug } from "@/lib/db/updates";
import { getRedirectForPath } from "@/lib/db/redirects";
import { formatUpdateDate, updateTypeLabels } from "@/lib/db/updates-utils";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildArticleSchema, buildBreadcrumbSchema } from "@/lib/seo/structured-data";
import "@/styles/updates.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedUpdateSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const update = await getPublishedUpdateBySlug(slug);
  if (!update) return {};

  return buildMetadata({
    title: update.metaTitle ?? update.title,
    description: update.metaDescription ?? update.summary ?? undefined,
    canonicalPath: update.canonicalPath ?? `/updates/${update.slug}`,
    image: update.ogImage ?? update.media.url,
    keywords: update.tags,
    noIndex: update.noindex,
    ogType: "article",
    publishedTime: update.publishedAt,
    modifiedTime: update.updatedAt,
    authors: update.author ? [update.author] : undefined,
  });
}

function paragraphs(body?: string | null) {
  return (body ?? "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default async function UpdateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const update = await getPublishedUpdateBySlug(slug);

  if (!update) {
    const currentPath = `/updates/${slug}`;
    const redirectTarget = await getRedirectForPath(currentPath);
    if (redirectTarget) {
      permanentRedirect(redirectTarget.target_path);
    }
    notFound();
  }

  const articleSchema = buildArticleSchema({
    title: update.title,
    summary: update.summary ?? undefined,
    body: update.body ?? undefined,
    slug: update.slug,
    canonicalPath: update.canonicalPath ?? `/updates/${update.slug}`,
    publishedAt: update.publishedAt,
    updatedAt: update.updatedAt,
    author: update.author ?? undefined,
    media: update.media,
    schemaType: update.articleSchemaType,
    articleSection: update.articleSection ?? undefined,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://estatebrothers.pk" },
    { name: "Updates", url: "https://estatebrothers.pk/updates" },
    {
      name: update.title,
      url: `https://estatebrothers.pk${update.canonicalPath ?? `/updates/${update.slug}`}`,
    },
  ]);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <section className="updates-hero update-detail-hero">
        <div className="wrap">
          <div className="updates-hero-copy reveal">
            <nav aria-label="Breadcrumb" className="breadcrumb-nav">
              <ol className="breadcrumb-list">
                <li className="breadcrumb-item">
                  <Link href="/">Home</Link>
                </li>
                <li className="breadcrumb-separator" aria-hidden="true">/</li>
                <li className="breadcrumb-item">
                  <Link href="/updates">Updates</Link>
                </li>
                <li className="breadcrumb-separator" aria-hidden="true">/</li>
                <li className="breadcrumb-item" aria-current="page">
                  <span>{update.title}</span>
                </li>
              </ol>
            </nav>
            <div className="updates-meta">
              <span>{updateTypeLabels[update.type] ?? update.type}</span>
              <time dateTime={update.publishedAt}>{formatUpdateDate(update.publishedAt)}</time>
            </div>
            <h1>{update.title}</h1>
            {update.summary && <p>{update.summary}</p>}
          </div>
          <div className="updates-feature-media reveal">
            <Image
              src={update.media.url}
              alt={update.media.alt}
              width={900}
              height={560}
              priority
              sizes="(max-width:768px) 100vw, 900px"
            />
          </div>
        </div>
      </section>

      <section className="updates-body update-detail-body">
        <div className="wrap">
          <article className="update-article">
            <div className="updates-meta">
              {update.author && <span>By {update.author}</span>}
              <span>Updated {formatUpdateDate(update.updatedAt)}</span>
            </div>
            {paragraphs(update.body).length > 0 ? (
              paragraphs(update.body).map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            ) : (
              <p>This update is published as a short market note. Contact Estate Brothers for details.</p>
            )}
            {update.tags.length > 0 && (
              <div className="update-tags" aria-label="Tags">
                {update.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
            {update.externalLinks.length > 0 && (
              <div className="updates-actions update-detail-links">
                {update.externalLinks.map((link) =>
                  link.kind === "external" ? (
                    <a key={link.label} href={link.url} target="_blank" rel="noreferrer">
                      <span>{link.label}</span>
                      <ExternalLink size={13} strokeWidth={2} aria-hidden />
                    </a>
                  ) : (
                    <Link key={link.label} href={link.url}>
                      <span>{link.label}</span>
                      <FileText size={13} strokeWidth={2} aria-hidden />
                    </Link>
                  )
                )}
              </div>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}

