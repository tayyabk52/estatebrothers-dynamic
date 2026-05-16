"use client";
import { ExternalLink, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatUpdateDate, updates, updateTypes } from "@/data/updates";

type UpdateItem = (typeof updates)[0];
type UpdateLink = UpdateItem["externalLinks"][0];

function UpdateTypeTabs({
  activeType,
  setActiveType,
}: {
  activeType: string;
  setActiveType: (id: string) => void;
}) {
  return (
    <div className="updates-tabs" aria-label="Update categories">
      {updateTypes.map((type) => (
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

function UpdateLinkItem({ link }: { link: UpdateLink }) {
  const isExternal = link.kind === "external";
  const content = (
    <>
      <span>{link.label}</span>
      {isExternal ? (
        <ExternalLink size={13} strokeWidth={2} aria-hidden="true" />
      ) : (
        <FileText size={13} strokeWidth={2} aria-hidden="true" />
      )}
    </>
  );

  if (isExternal) {
    return (
      <a href={link.url} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return <Link href={link.url}>{content}</Link>;
}

function FeaturedUpdate({ update }: { update: UpdateItem }) {
  return (
    <article className="updates-feature reveal">
      <div className="updates-feature-copy">
        <div className="updates-meta">
          <span>{updateTypes.find((type) => type.id === update.type)?.label}</span>
          <time dateTime={update.publishedAt}>{formatUpdateDate(update.publishedAt)}</time>
        </div>
        <h2>{update.title}</h2>
        <p>{update.summary}</p>
        <div className="updates-actions">
          {update.externalLinks.map((link) => (
            <UpdateLinkItem key={link.label} link={link} />
          ))}
        </div>
      </div>
      <div className="updates-feature-media">
        <Image
          src={update.media.url}
          alt={update.media.alt}
          width={800}
          height={500}
          loading="eager"
        />
      </div>
    </article>
  );
}

function UpdateCard({ update }: { update: UpdateItem }) {
  return (
    <article className="update-card reveal">
      <div className="update-thumb">
        <Image
          src={update.media.url}
          alt={update.media.alt}
          width={400}
          height={250}
          loading="lazy"
        />
      </div>
      <div className="update-content">
        <header>
          <div className="updates-meta">
            <span>{updateTypes.find((type) => type.id === update.type)?.label}</span>
            <time dateTime={update.publishedAt}>{formatUpdateDate(update.publishedAt)}</time>
          </div>
          <h2>{update.title}</h2>
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
            {update.externalLinks.map((link) => (
              <UpdateLinkItem key={link.label} link={link} />
            ))}
          </div>
        </footer>
      </div>
    </article>
  );
}

export function UpdatesClient() {
  const [activeType, setActiveType] = useState("all");
  const featured = updates.find((update) => update.featured);
  const listedUpdates = useMemo(
    () =>
      updates.filter((update) => {
        if (update.status !== "published" || update.visibility !== "public") return false;
        if (activeType === "all") return true;
        return update.type === activeType;
      }),
    [activeType]
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
              A clean public record for Estate Brothers news, Facebook activity, MOU posts,
              property announcements, and client-facing updates.
            </p>
          </div>
          <div className="updates-hero-note reveal">
            <span className="mono">Published feed</span>
            <strong>{updates.length}</strong>
            <span>demo updates</span>
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
              <p>
                Structured for future admin publishing with media, links, tags, and attachments.
              </p>
            </div>
            <span className="mono">{listedUpdates.length} shown</span>
          </div>

          <div className="updates-list">
            {listedUpdates.map((update) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
