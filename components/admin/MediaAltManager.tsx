"use client";

import { useState } from "react";

interface Props {
  suggestedContext?: string; // e.g. "1 Kanal House in DHA Phase 6"
}

export function MediaAltManager({ suggestedContext = "property" }: Props) {
  const [altText, setAltText] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [isOg, setIsOg] = useState(false);

  const placeholder = `e.g. Front elevation view of ${suggestedContext}`;

  return (
    <div className="media-alt-manager">
      <label className="admin-field">
        Upload photos, videos, or floorplans
        <input type="file" name="listing_media" multiple accept="image/*,video/*,.pdf" />
      </label>

      <div className="admin-field-row">
        <label className="admin-field">
          Media Title (Internal label)
          <input type="text" name="media_title" placeholder="e.g. Living Room / Front View" />
        </label>
        <label className="admin-field">
          Image Alt Text (SEO & Accessibility) *
          <input
            type="text"
            name="media_alt_text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder={placeholder}
          />
          <span className="admin-field-hint">
            Describe the photo accurately for Google Image Search and screen readers.
          </span>
        </label>
      </div>

      <div className="admin-field-row">
        <label className="admin-field admin-field-check">
          <input
            type="checkbox"
            name="media_primary"
            value="true"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
          />
          Set as Primary Thumbnail (Hero photo)
        </label>
        <label className="admin-field admin-field-check">
          <input
            type="checkbox"
            name="media_og"
            value="true"
            checked={isOg}
            onChange={(e) => setIsOg(e.target.checked)}
          />
          Set as OpenGraph Social Preview Image (WhatsApp, Facebook, X)
        </label>
      </div>

      <label className="admin-field">
        YouTube / Video walkthrough URL
        <input type="url" name="external_media_url" placeholder="https://www.youtube.com/watch?v=..." />
      </label>
    </div>
  );
}
