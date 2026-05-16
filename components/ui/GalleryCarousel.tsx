"use client";
import Image from "next/image";
import { useState } from "react";

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
            <Image
              src={activeGalleryImage}
              alt={`${title} selected view`}
              width={900}
              height={600}
              priority
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
                <Image src={image} alt="" width={120} height={80} />
              </button>
            ))}
          </div>
        </div>

        <div className="gallery-grid">
          {gallery.map((image, index) => (
            <div className="gallery-image" key={`${listingId}-${index}`}>
              <Image
                src={image}
                alt={`${title} view ${index + 1}`}
                width={600}
                height={400}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
