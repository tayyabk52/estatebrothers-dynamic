import Image from "next/image";
import Link from "next/link";
import { PartnersCarousel } from "@/components/ui/PartnersCarousel";
import { PropertyRow } from "@/components/ui/PropertyRow";
import { Testimonial } from "@/components/ui/Testimonial";
import { featuredProperties, heroStats } from "@/data/listings";
import { buildMetadata } from "@/lib/seo/metadata";
import "@/styles/home.css";

export const metadata = buildMetadata({
  title: "Estate Brothers",
  description:
    "Buy, sell, and invest in property across Lahore with Estate Brothers — trusted real estate advisors in DHA Phase 6.",
  canonicalPath: "/",
  image: "/images/properties/hero-estatebrothers.webp",
});

function Hero() {
  return (
    <section className="hero">
      <div className="hero-stage">
        <div
          className="hero-img"
          style={{ backgroundImage: "url(/images/properties/hero-estatebrothers.webp)" }}
        />
        <div className="hero-content">
          <div className="eyebrow-w">
            <span>Estate Brothers · Real estate and investment services</span>
          </div>
          <h1>
            Estate Brothers
            <br />
            real estate,
            <br />
            <span className="serif-i">built on</span> trust.
          </h1>
          <div className="hero-side">
            <p className="lede">
              Buy, sell, and invest with a professional property team in Lahore. From DHA listings
              to secure investment opportunities, Estate Brothers keeps every decision clear,
              practical, and client-focused.
            </p>
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

      <div className="hero-strip">
        {heroStats.map((stat) => (
          <div className="cell" key={stat.l}>
            <div className="n">
              {stat.n}
              {stat.unit && <span className="unit">{stat.unit}</span>}
            </div>
            <div className="l">{stat.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Featured() {
  return (
    <section className="section" id="listings">
      <div className="wrap">
        <header className="section-hd reveal">
          <div className="label">
            <div className="eyebrow">Currently representing</div>
            <div className="mono section-date">Updated · Mar 14, 2026</div>
          </div>
          <div className="title">
            <h2>
              Four residences,
              <br />
              each one <span className="serif-i">walked</span> twice.
            </h2>
          </div>
          <div className="aux">
            <Link href="/buy-sell">View Buy/Sell →</Link>
          </div>
        </header>
        <div className="property-list">
          {featuredProperties.map((property) => (
            <PropertyRow key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Narrative() {
  return (
    <section className="narrative" id="about">
      <div className="wrap">
        <div className="col-l reveal">
          <div className="img">
            <Image
              src="/images/team/ceo-tajamal-hussain.jpg"
              alt="Tajamal Hussain, Chief Executive Officer of Estate Brothers"
              width={600}
              height={700}
              loading="lazy"
            />
            <span className="ph">CEO - Tajamal Hussain, Estate Brothers</span>
          </div>
        </div>
        <div className="col-r reveal">
          <div className="eyebrow">Leadership · 10+ years of experience</div>
          <h2>
            Built on trust, expertise, and results.{" "}
            <span className="serif-i">Led by Tajamal Hussain.</span>
          </h2>
          <p>
            With over a decade of hands-on experience in real estate, Tajamal Hussain has built a
            strong reputation for integrity, market knowledge, and client-focused service. Estate
            Brothers helps clients make confident property decisions through transparent guidance
            and trusted opportunities.
          </p>
          <p className="narrative-meta">
            From a single vision to a growing real estate network, Estate Brothers now operates
            from 44-A Main DHA Office Phase 6 Lahore with 4 branches, 30+ professional team members,
            and support available 24/7.
          </p>
          <div className="signature">
            <div className="avatars">
              <div className="avatar avatar-one" />
              <div className="avatar avatar-two" />
            </div>
            <div className="who">
              <span className="name">Tajamal Hussain</span>
              <span className="role">Chief Executive Officer</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <PartnersCarousel />
      <Featured />
      <Narrative />
      <Testimonial />
    </>
  );
}
