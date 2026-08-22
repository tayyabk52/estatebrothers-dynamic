"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { HomeStat, HomeTestimonial } from "@/lib/db/home-content";

export function Testimonial({
  testimonials,
  stats,
}: {
  testimonials: HomeTestimonial[];
  stats: HomeStat[];
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
    <section className="testimonial" style={{ minHeight: "450px" }}>
      <div className="wrap">
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
                  <span className="marker">{itemIndex === index ? "●" : "○"}</span> 0{itemIndex + 1}
                </button>
              ))}
            </div>
            <div className="quote reveal">
              <blockquote key={index}>
                <span className="mark">"</span>
                {testimonial.quote}
              </blockquote>
              <div className="attr">
                <div className="av">
                  {testimonial.imageUrl && (
                    <Image src={testimonial.imageUrl} alt={testimonial.name} width={40} height={40} loading="lazy" />
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
