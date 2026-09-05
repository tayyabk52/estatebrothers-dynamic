"use client";

import { useEffect, useState } from "react";
import { SafeMediaImage } from "@/components/ui/SafeMediaImage";
import type { HomeStat, HomeTestimonial } from "@/lib/db/home-content";

export function Testimonial({
  testimonials,
  stats,
  eyebrow,
  heading,
  intro,
}: {
  testimonials: HomeTestimonial[];
  stats: HomeStat[];
  eyebrow?: string | null;
  heading?: string | null;
  intro?: string | null;
}) {
  const [index, setIndex] = useState(0);
  const hasTestimonials = testimonials.length > 0;

  useEffect(() => {
    if (!hasTestimonials) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % testimonials.length);
    }, 8000);
    return () => window.clearInterval(id);
  }, [hasTestimonials, testimonials.length]);

  if (!hasTestimonials && stats.length === 0) return null;

  const testimonial = testimonials[index] ?? testimonials[0];

  return (
    <section className="testimonial">
      <div className="wrap">
        {(eyebrow || heading || intro) && (
          <header className="testimonial-head">
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            {heading && <h2>{heading}</h2>}
            {intro && <p>{intro}</p>}
          </header>
        )}
        {hasTestimonials && (
          <>
            <div className="nums">
              {testimonials.map((item, itemIndex) => (
                <button
                  type="button"
                  key={`${item.name}-${itemIndex}`}
                  className={`num-btn${itemIndex === index ? " active" : ""}`}
                  onClick={() => setIndex(itemIndex)}
                >
                  <span className="marker" aria-hidden="true">{itemIndex === index ? "●" : "○"}</span> 0{itemIndex + 1}
                </button>
              ))}
            </div>
            <div className="quote reveal">
              <blockquote key={index}>
                <span className="mark">&quot;</span>
                {testimonial.quote}
              </blockquote>
              <div className="attr">
                <div className="av">
                  {testimonial.imageUrl && (
                    <SafeMediaImage src={testimonial.imageUrl} alt={testimonial.name} width={40} height={40} loading="lazy" />
                  )}
                </div>
                <div className="who">
                  <span className="name">{testimonial.name}</span>
                  {testimonial.role && <span className="role">{testimonial.role}</span>}
                </div>
              </div>
            </div>
          </>
        )}

        {stats.length > 0 && (
          <div className="stats reveal">
            {stats.map((stat) => (
              <div className="stat" key={stat.l}>
                <div className="n">
                  {stat.n}
                  {stat.unit && <span className="unit">{stat.unit}</span>}
                </div>
                <div className="l">{stat.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
