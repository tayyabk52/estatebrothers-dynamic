"use client";
import { SafeMediaImage } from "@/components/ui/SafeMediaImage";

interface Partner {
  name: string;
  image: string;
  alt?: string;
}

export function PartnersCarousel({
  eyebrow = "Trusted network",
  heading = "Our Partners",
  intro,
  partners,
}: {
  eyebrow?: string | null;
  heading?: string | null;
  intro?: string | null;
  partners: Partner[];
}) {
  if (partners.length === 0) return null;
  const carouselItems = [...partners, ...partners];

  return (
    <section className="partners-section reveal" aria-labelledby="partners-title" style={{ minHeight: "220px" }}>
      <div className="partners-head wrap">
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h2 id="partners-title">{heading || "Our Partners"}</h2>
        </div>
        {intro && <p>{intro}</p>}
      </div>

      <div className="partners-rail" aria-label="Estate Brothers partner logos">
        <div className="partners-track">
          {carouselItems.map((partner, index) => (
            <div className="partner-card" key={`${partner.name}-${index}`}>
              <SafeMediaImage
                src={partner.image}
                alt={partner.alt ?? partner.name}
                width={120}
                height={60}
                sizes="(max-width:640px) 156px, 214px"
                style={{ width: "auto", height: "auto" }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
