"use client";
import Image from "next/image";
import { partners } from "@/data/partners";

export function PartnersCarousel() {
  const carouselItems = [...partners, ...partners];

  return (
    <section className="partners-section reveal" aria-labelledby="partners-title">
      <div className="partners-head wrap">
        <div>
          <div className="eyebrow">Trusted network</div>
          <h2 id="partners-title">Our Partners</h2>
        </div>
        <p>
          A growing network of trusted property, development, and investment partners supporting
          confident real estate decisions.
        </p>
      </div>

      <div className="partners-rail" aria-label="Estate Brothers partner logos">
        <div className="partners-track">
          {carouselItems.map((partner, index) => (
            <div className="partner-card" key={`${partner.name}-${index}`}>
              <Image
                src={partner.image}
                alt={partner.name}
                width={120}
                height={60}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
