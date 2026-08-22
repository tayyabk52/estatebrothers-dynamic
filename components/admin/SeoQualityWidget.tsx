"use client";

import { useState, useEffect } from "react";
import {
  calculateListingSeoQuality,
  calculateUpdateSeoQuality,
  type SeoQualityReport,
  type ListingSeoInput,
  type UpdateSeoInput,
} from "@/lib/seo/validator";

interface Props {
  type: "listing" | "update";
  initialData: ListingSeoInput | UpdateSeoInput;
}

export function SeoQualityWidget({ type, initialData }: Props) {
  const [data, setData] = useState<ListingSeoInput | UpdateSeoInput>(initialData);
  const [report, setReport] = useState<SeoQualityReport>(() =>
    type === "listing"
      ? calculateListingSeoQuality(initialData as ListingSeoInput)
      : calculateUpdateSeoQuality(initialData as UpdateSeoInput)
  );

  // Listen to input changes in the parent form
  useEffect(() => {
    const handleFormChange = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (!target || !target.name) return;

      setData((prev) => {
        const next = { ...prev, [target.name]: target.value };
        const newReport =
          type === "listing"
            ? calculateListingSeoQuality(next as ListingSeoInput)
            : calculateUpdateSeoQuality(next as UpdateSeoInput);
        setReport(newReport);
        return next;
      });
    };

    const form = document.querySelector("form.admin-form");
    if (form) {
      form.addEventListener("input", handleFormChange);
      form.addEventListener("change", handleFormChange);
      return () => {
        form.removeEventListener("input", handleFormChange);
        form.removeEventListener("change", handleFormChange);
      };
    }
  }, [type]);

  const gradeColors = {
    excellent: "#16a34a",
    good: "#2563eb",
    needs_work: "#d97706",
    poor: "#dc2626",
  };

  const gradeLabels = {
    excellent: "Excellent",
    good: "Good",
    needs_work: "Needs Work",
    poor: "Action Required",
  };

  return (
    <div className="admin-form-section seo-widget-section">
      <div className="seo-widget-header">
        <div>
          <h2>Search Engine Optimization (SEO)</h2>
          <p className="admin-field-hint">
            Live preview of how this {type === "listing" ? "property" : "update"} will appear in Google Search and its content quality score.
          </p>
        </div>
        <div className="seo-score-badge" style={{ backgroundColor: gradeColors[report.grade] }}>
          <span className="seo-score-number">{report.score}</span>
          <span className="seo-score-grade">{gradeLabels[report.grade]}</span>
        </div>
      </div>

      {/* Live Google Search Mockup */}
      <div className="serp-preview-box">
        <div className="serp-preview-header">
          <span className="serp-google-icon">G</span>
          <div className="serp-url-trail">
            <span className="serp-site-name">Estate Brothers</span>
            <span className="serp-url-path">{report.serpUrl}</span>
          </div>
        </div>
        <div className="serp-title-link">{report.serpTitle}</div>
        <div className="serp-snippet-text">{report.serpSnippet}</div>
      </div>

      {/* Quality Warning Banners */}
      {report.warnings.length > 0 && (
        <div className="seo-warning-banner">
          <strong>⚠️ Content Quality Alerts:</strong>
          <ul>
            {report.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Checklist */}
      <div className="seo-checks-list">
        <h3>Content & SEO Quality Checklist</h3>
        <div className="seo-checks-grid">
          {report.checks.map((check) => (
            <div key={check.id} className={`seo-check-item ${check.passed ? "passed" : "failed"}`}>
              <span className="seo-check-icon">{check.passed ? "✓" : "✕"}</span>
              <div className="seo-check-content">
                <div className="seo-check-label">{check.label}</div>
                {!check.passed && check.hint && (
                  <div className="seo-check-hint">{check.hint}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
