"use client";
import { useEffect, useState } from "react";
import { testimonials, stats } from "@/data/listings";

export function Testimonial() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % testimonials.length);
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  const testimonial = testimonials[index];

  return (
    <section className="testimonial">
      <div className="wrap">
        <div className="nums">
          {testimonials.map((item, itemIndex) => (
            <button
              type="button"
              key={item.name}
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
            <div className="av" />
            <div className="who">
              <span className="name">{testimonial.name}</span>
              <span className="role">{testimonial.role}</span>
            </div>
          </div>
        </div>
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
      </div>
    </section>
  );
}
