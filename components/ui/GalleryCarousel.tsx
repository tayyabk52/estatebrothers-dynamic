"use client";
import { useState } from "react";
import { SafeMediaImage } from "@/components/ui/SafeMediaImage";

interface GalleryCarouselProps {
  gallery: string[];
  title: string;
  listingId: string;
}

export function GalleryCarousel({ gallery, title, listingId }: GalleryCarouselProps) {
  const [activeImage, setActiveImage] = useState(0);
  const activeGalleryImage = gallery[activeImage] || gallery[0];

  return (
    <section className="detail-gallery">
      <div className="wrap">
        <div className="gallery-mobile">
          <div className="gallery-mobile-main">
            <SafeMediaImage
              src={activeGalleryImage}
              alt={`${title} selected view`}
              width={900}
              height={600}
              preload
              sizes="(max-width:768px) 100vw, 900px"
            />
          </div>
          <div className="gallery-thumbs" aria-label="Listing image thumbnails">
            {gallery.map((image, index) => (
              <button
                key={`${listingId}-thumb-${index}`}
                type="button"
                className={activeImage === index ? "active" : ""}
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1}`}
              >
                <SafeMediaImage src={image} alt="" width={120} height={80} sizes="120px" />
              </button>
            ))}
          </div>
        </div>

        <div className="gallery-grid">
          {gallery.map((image, index) => (
            <div className="gallery-image" key={`${listingId}-${index}`}>
              <SafeMediaImage
                src={image}
                alt={`${title} view ${index + 1}`}
                width={600}
                height={400}
                loading="lazy"
                sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 600px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
