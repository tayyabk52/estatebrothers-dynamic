"use client";
import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { NormalizedUpdate } from "@/lib/types";
import { formatUpdateDate, updateTypeLabels } from "@/lib/db/updates-utils";
import { SafeMediaImage } from "@/components/ui/SafeMediaImage";

const updateTypeTabs = [
  { id: "all", label: "All updates" },
  { id: "announcement", label: "Announcements" },
  { id: "facebook", label: "Facebook" },
  { id: "event", label: "Events" },
  { id: "market", label: "Market notes" },
];

interface Props {
  updates: NormalizedUpdate[];
}

function UpdateTypeTabs({
  activeType,
  setActiveType,
}: {
  activeType: string;
  setActiveType: (id: string) => void;
}) {
  return (
    <div className="updates-tabs" aria-label="Update categories">
      {updateTypeTabs.map((type) => (
        <button
          key={type.id}
          type="button"
          className={activeType === type.id ? "active" : ""}
          onClick={() => setActiveType(type.id)}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}

function UpdateLinkItem({
  link,
}: {
  link: NormalizedUpdate["externalLinks"][0];
}) {
  const isExternal = link.kind === "external";
  const content = (
    <>
      <span>{link.label}</span>
      {isExternal ? (
        <ExternalLink size={13} strokeWidth={2} aria-hidden />
      ) : (
        <FileText size={13} strokeWidth={2} aria-hidden />
      )}
    </>
  );
  return isExternal ? (
    <a href={link.url} target="_blank" rel="noreferrer">{content}</a>
  ) : (
    <Link href={link.url}>{content}</Link>
  );
}

function FeaturedUpdate({ update }: { update: NormalizedUpdate }) {
  return (
    <article id={update.slug} className="updates-feature reveal">
      <div className="updates-feature-copy">
        <div className="updates-meta">
          <span>{updateTypeLabels[update.type] ?? update.type}</span>
          <time dateTime={update.publishedAt}>{formatUpdateDate(update.publishedAt)}</time>
        </div>
        <h2>
          <Link href={update.canonicalPath ?? `/updates/${update.slug}`}>{update.title}</Link>
        </h2>
        <p>{update.summary}</p>
        <div className="updates-actions">
          <Link href={update.canonicalPath ?? `/updates/${update.slug}`}>
            <span>Read update</span>
            <FileText size={13} strokeWidth={2} aria-hidden />
          </Link>
          {update.externalLinks.map((link) => (
            <UpdateLinkItem key={link.label} link={link} />
          ))}
        </div>
      </div>
      <div className="updates-feature-media">
        <SafeMediaImage src={update.media.url} alt={update.media.alt} width={800} height={500} loading="eager" />
      </div>
    </article>
  );
}

function UpdateCard({ update }: { update: NormalizedUpdate }) {
  return (
    <article id={update.slug} className="update-card reveal">
      <div className="update-thumb">
        <SafeMediaImage src={update.media.url} alt={update.media.alt} width={400} height={250} loading="lazy" />
      </div>
      <div className="update-content">
        <header>
          <div className="updates-meta">
            <span>{updateTypeLabels[update.type] ?? update.type}</span>
            <time dateTime={update.publishedAt}>{formatUpdateDate(update.publishedAt)}</time>
          </div>
          <h2>
            <Link href={update.canonicalPath ?? `/updates/${update.slug}`}>{update.title}</Link>
          </h2>
        </header>
        <p>{update.summary}</p>
        <div className="update-tags" aria-label="Tags">
          {update.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <footer>
          <span className="mono">Updated {formatUpdateDate(update.updatedAt)}</span>
          <div className="updates-actions">
            <Link href={update.canonicalPath ?? `/updates/${update.slug}`}>
              <span>Read</span>
              <FileText size={13} strokeWidth={2} aria-hidden />
            </Link>
            {update.externalLinks.map((link) => (
              <UpdateLinkItem key={link.label} link={link} />
            ))}
          </div>
        </footer>
      </div>
    </article>
  );
}

export function UpdatesClient({ updates }: Props) {
  const [activeType, setActiveType] = useState("all");
  const featured = updates.find((u) => u.featured);
  const listed = useMemo(
    () =>
      updates.filter((u) => {
        if (activeType === "all") return true;
        return u.type === activeType;
      }),
    [updates, activeType]
  );

  return (
    <main>
      <section className="updates-hero">
        <div className="wrap">
          <div className="updates-hero-copy reveal">
            <div className="eyebrow">Updates</div>
            <h1>
              Announcements, posts, and market notes in{" "}
              <span className="serif-i">one feed.</span>
            </h1>
            <p>
              Explore Estate Brothers registrations, professional memberships, partner awards,
              property announcements, and company updates.
            </p>
          </div>
          <div className="updates-hero-note reveal">
            <span className="mono">Published feed</span>
            <strong>{updates.length}</strong>
            <span>published updates</span>
          </div>
        </div>
      </section>

      <section className="updates-body">
        <div className="wrap">
          <UpdateTypeTabs activeType={activeType} setActiveType={setActiveType} />
          {featured && activeType === "all" && <FeaturedUpdate update={featured} />}
          <div className="updates-list-head">
            <div>
              <h2>Latest updates</h2>
              <p>Market notes, partnership activity, and property updates collected for easy review.</p>
            </div>
            <span className="mono">{listed.length} shown</span>
          </div>
          <div className="updates-list">
            {listed.length > 0 ? (
              listed.map((update) => <UpdateCard key={update.id} update={update} />)
            ) : (
              <div className="inventory-empty">
                <div className="serif-i">No published updates yet.</div>
                <p>Published company news, market notes, and property updates will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
