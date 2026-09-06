"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SafeMediaImage } from "@/components/ui/SafeMediaImage";
import type { HomeFeaturedProject } from "@/lib/db/home-content";

export function HomeProjectCard({ project, index }: { project: HomeFeaturedProject; index: number }) {
  const images = useMemo(() => {
    if (project.gallery.length) return project.gallery;
    return project.imageUrl ? [{ id: project.id, imageUrl: project.imageUrl, alt: project.alt }] : [];
  }, [project]);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % images.length);
    }, 3200 + index * 450);
    return () => window.clearInterval(id);
  }, [images.length, index]);

  const image = images[activeImage] ?? images[0];

  return (
    <article className="project-card reveal">
      <div className="project-media">
        {image ? (
          <SafeMediaImage
            key={image.imageUrl}
            src={image.imageUrl}
            alt={image.alt || project.alt}
            width={720}
            height={520}
            loading="lazy"
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 56vw, 28vw"
          />
        ) : (
          <span className="project-placeholder" aria-hidden="true">EB</span>
        )}
        <div className="project-count mono">
          {String(activeImage + 1).padStart(2, "0")} / {String(Math.max(images.length, 1)).padStart(2, "0")}
        </div>
      </div>
      <div className="project-copy">
        <div>
          <span className="project-location">{project.location}</span>
          <h3>{project.title}</h3>
        </div>
        <p>{project.description}</p>
        <div className="project-footer">
          <span className="mono">{project.label}</span>
          <Link href={project.href}>{project.title} properties</Link>
        </div>
      </div>
    </article>
  );
}
