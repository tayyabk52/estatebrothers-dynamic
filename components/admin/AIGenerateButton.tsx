"use client";

import { useState } from "react";
import { generateListingSEOData, type AIListingFacts } from "@/lib/ai/actions";

export function AIGenerateButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      // 1. Gather facts from the DOM
      const getValue = (name: string) => {
        const el = document.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLSelectElement;
        return el ? el.value : "";
      };

      const facts: AIListingFacts = {
        listing_type_slug: getValue("listing_type_slug"),
        phase: getValue("phase"),
        city: getValue("city"),
        block: getValue("block"),
        project: getValue("project"),
        size_label: getValue("size_label"),
        price_label: getValue("price_label"),
        bedrooms: getValue("bedrooms"),
        bathrooms: getValue("bathrooms"),
      };

      // 2. Call the server action
      const { data, error: actionError } = await generateListingSEOData(facts);

      if (actionError) {
        throw new Error(actionError);
      }

      if (data) {
        // 3. Populate the fields
        const setValue = (name: string, value: string) => {
          const el = document.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement;
          if (el) {
            el.value = value;
            // Dispatch input event so any listeners (like SeoQualityWidget) pick up the change
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
          }
        };

        setValue("title", data.title);
        setValue("summary", data.summary);
        setValue("description", data.description);
        setValue("meta_title", data.meta_title);
        setValue("meta_description", data.meta_description);

        // Optionally try to update the slug if it's empty or we are on the 'new' page
        const slugEl = document.querySelector(`[name="slug"]`) as HTMLInputElement;
        if (slugEl && !slugEl.value && document.location.pathname.includes('/new')) {
           const generatedSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
           slugEl.value = generatedSlug;
           slugEl.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="ai-generate-wrapper" style={{ marginBottom: "1.5rem", padding: "1rem", background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem", color: "#2563eb" }}>✨ AI Content Generator</h3>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Fill in the location, size, and price fields above, then click generate to automatically write high-quality SEO copy.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          type="button"
          className="admin-btn"
          style={{ background: "#2563eb", color: "white", border: "none" }}
        >
          {isGenerating ? "Generating..." : "✨ Auto-Fill with AI"}
        </button>
      </div>
      {error && (
        <div style={{ marginTop: "0.75rem", color: "#dc2626", fontSize: "0.875rem" }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
