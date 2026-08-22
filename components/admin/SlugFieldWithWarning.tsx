"use client";

import { useState } from "react";

interface Props {
  initialSlug?: string | null;
  basePath: string; // e.g. "/buy-sell/house" or "/updates"
  required?: boolean;
}

export function SlugFieldWithWarning({ initialSlug = "", basePath, required = false }: Props) {
  const [slug, setSlug] = useState(initialSlug || "");
  const hasChanged = Boolean(initialSlug && slug.trim() && slug.trim() !== initialSlug);

  const cleanSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  return (
    <div className="slug-field-container">
      <label className="admin-field">
        URL Slug {required && "*"}
        <div className="slug-input-wrapper">
          <span className="slug-prefix">estatebrothers.pk{basePath}/</span>
          <input
            type="text"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(cleanSlug(e.target.value))}
            placeholder="e.g. 5-marla-modern-house-dha-phase-6"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required={required}
            className="slug-input"
          />
        </div>
      </label>

      {hasChanged && (
        <div className="slug-warning-banner">
          <div className="slug-warning-icon">⚠️</div>
          <div className="slug-warning-text">
            <strong>Permanent 301 Redirect will be created:</strong>
            <p>
              The old URL <code>{basePath}/{initialSlug}</code> will be permanently redirected to <code>{basePath}/{slug}</code> upon saving.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
