"use client";

import { useEffect, useRef, useState } from "react";
import { SafeMediaImage } from "@/components/ui/SafeMediaImage";

export function OfficeImageField({
  currentSrc,
  alt,
}: {
  currentSrc?: string | null;
  alt: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedName, setSelectedName] = useState("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewSrc) URL.revokeObjectURL(previewSrc);
    };
  }, [previewSrc]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreviewSrc((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return file ? URL.createObjectURL(file) : null;
    });
    setSelectedName(file?.name ?? "");
  }

  const displayedImage = previewSrc ?? currentSrc;

  return (
    <div className="admin-office-image-field">
      {displayedImage ? (
        <div className="admin-media-preview">
          {previewSrc ? (
            <img src={previewSrc} alt={`${alt} upload preview`} width={420} height={280} />
          ) : (
            <SafeMediaImage
              src={displayedImage}
              alt={alt}
              width={420}
              height={280}
              sizes="420px"
            />
          )}
          <p>{selectedName || "Current office image"}</p>
        </div>
      ) : null}

      <div className="admin-file-picker">
        <input
          ref={inputRef}
          className="admin-file-picker-input"
          id="office-image-upload"
          type="file"
          name="office_image"
          accept="image/*"
          onChange={handleChange}
        />
        <button
          type="button"
          className="admin-btn admin-btn-ghost"
          onClick={() => inputRef.current?.click()}
        >
          Choose image
        </button>
        <span className="admin-file-picker-name" aria-live="polite">
          {selectedName || (currentSrc ? "No replacement selected" : "No image selected")}
        </span>
      </div>
      <p className="admin-field-help">Choose a file to preview it here, then save the office to upload it.</p>
    </div>
  );
}
