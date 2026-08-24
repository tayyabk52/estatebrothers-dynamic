import Link from "next/link";
import { getPromotedSeoLandingLinks, type SeoLandingPlacement } from "@/lib/db/seo";

const SECTION_COPY: Record<SeoLandingPlacement, { eyebrow: string; title: string; intro: string; limit: number }> = {
  footer: {
    eyebrow: "Popular searches",
    title: "Property searches",
    intro: "",
    limit: 8,
  },
  home: {
    eyebrow: "Search shortcuts",
    title: "Popular property searches",
    intro: "Curated guides connected to live Estate Brothers listings.",
    limit: 6,
  },
  "buy-sell": {
    eyebrow: "Search by intent",
    title: "Popular searches in DHA Lahore",
    intro: "Start from focused property pages instead of broad filters.",
    limit: 12,
  },
};

export async function PopularSeoLinks({ placement }: { placement: SeoLandingPlacement }) {
  const copy = SECTION_COPY[placement];
  const links = await getPromotedSeoLandingLinks(placement, copy.limit);
  if (!links.length) return null;

  if (placement === "footer") {
    return (
      <nav className="footer-seo-links" aria-label="Popular property searches">
        <span>{copy.title}</span>
        {links.map((link) => (
          <Link key={link.id} href={link.path}>
            {link.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <section className="seo-links-section">
      <div className="wrap">
        <header className="seo-links-head reveal">
          <div>
            <div className="eyebrow">{copy.eyebrow}</div>
            <h2>{copy.title}</h2>
          </div>
          {copy.intro ? <p>{copy.intro}</p> : null}
        </header>
        <div className="seo-link-grid">
          {links.map((link) => (
            <Link key={link.id} href={link.path} className="seo-link-card reveal">
              <strong>{link.label}</strong>
              {link.description ? <span>{link.description}</span> : <span>View current guidance and matching listings.</span>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
