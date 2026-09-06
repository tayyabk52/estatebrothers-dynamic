import { SafeMediaImage } from "@/components/ui/SafeMediaImage";
import Link from "next/link";

interface FeaturedProperty {
  id: string;
  image: string;
  imageAlt?: string;
  photoNote: string;
  place: string;
  name: string;
  desc: string;
  arch: string;
  priceLabel: string;
  plot: string;
  covered: number;
  beds: number;
  baths: number;
  tag: string;
  status: string;
}

export function PropertyRow({ property, href }: { property: FeaturedProperty; href?: string }) {
  return (
    <article className="property reveal" id={`p-${property.id}`}>
      <span className="idx">No. {property.id}</span>
      <div className="img">
        <SafeMediaImage
          src={property.image}
          alt={property.imageAlt ?? `${property.name} property listing`}
          width={600}
          height={400}
          loading="lazy"
          sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 640px"
        />
        <span className="ph">{property.photoNote}</span>
      </div>
      <div className="info">
        <span className="place">{property.place}</span>
        <h3 className="name">{href ? <Link href={href} className="property-title-link">{property.name}</Link> : property.name}</h3>
        <p className="desc">{property.desc}</p>
        <span className="mono property-arch">{property.arch}</span>
      </div>
      <div className="specs">
        <div className="price">{property.priceLabel}</div>
        <div className="row"><span>Plot</span><span>{property.plot}</span></div>
        <div className="row"><span>Covered</span><span>{property.covered.toLocaleString()} sf</span></div>
        <div className="row"><span>Bed</span><span>{property.beds}</span></div>
        <div className="row"><span>Bath</span><span>{property.baths}</span></div>
      </div>
      <span className={`tag tag-${property.tag}`}>{property.status}</span>
      <span className="arrow" aria-hidden="true">→</span>
    </article>
  );
}
