// SEO Quality and Content Completeness Validator Engine
// Aligned with Google Search Essentials, Spam Policies, and Title/Snippet standards.

export interface SeoCheck {
  id: string;
  label: string;
  passed: boolean;
  importance: "critical" | "high" | "recommended";
  hint?: string;
}

export interface SeoQualityReport {
  score: number; // 0 - 100
  grade: "excellent" | "good" | "needs_work" | "poor";
  checks: SeoCheck[];
  warnings: string[];
  serpTitle: string;
  serpSnippet: string;
  serpUrl: string;
}

export interface ListingSeoInput {
  title?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  summary?: string | null;
  description?: string | null;
  phase?: string | null;
  city?: string | null;
  size_label?: string | null;
  price_label?: string | null;
  price_numeric?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  listing_type_slug?: string | null;
  slug?: string | null;
  media_alt_text?: string | null;
  has_media?: boolean;
  availability?: string | null;
}

export interface UpdateSeoInput {
  title?: string | null;
  headline?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  summary?: string | null;
  body?: string | null;
  author_id?: string | null;
  tags?: string[] | null;
  slug?: string | null;
  media_alt?: string | null;
  has_media?: boolean;
}

const COMMON_BOILERPLATE_PATTERNS = [
  /prime location.*hot deal/i,
  /golden opportunity.*contact for more/i,
  /best property.*hurry up/i,
  /call now for best price/i,
  /contact us for more details/i,
];

/**
 * Detects low-value boilerplate phrases and keyword repetition in copy.
 */
export function detectBoilerplate(text?: string | null): string[] {
  if (!text) return [];
  const warnings: string[] = [];

  for (const pattern of COMMON_BOILERPLATE_PATTERNS) {
    if (pattern.test(text)) {
      warnings.push("Contains generic real-estate filler copy. Provide specific, unique property facts instead.");
      break;
    }
  }

  // Keyword repetition check (e.g. repeating DHA 5+ times in a short block)
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const frequencies: Record<string, number> = {};
  for (const word of words) {
    frequencies[word] = (frequencies[word] || 0) + 1;
  }

  for (const [word, count] of Object.entries(frequencies)) {
    if (count >= 5 && words.length < 80 && !["and", "the", "for", "with", "this"].includes(word)) {
      warnings.push(`Potential keyword repetition: The word "${word}" appears ${count} times in a short description.`);
      break;
    }
  }

  return warnings;
}

/**
 * Evaluates the SEO quality and factual completeness of a property listing.
 */
export function calculateListingSeoQuality(input: ListingSeoInput): SeoQualityReport {
  const checks: SeoCheck[] = [];
  const warnings: string[] = [];

  const title = (input.title || "").trim();
  const metaTitle = (input.meta_title || "").trim();
  const metaDescription = (input.meta_description || "").trim();
  const summary = (input.summary || "").trim();
  const description = (input.description || "").trim();
  const combinedDescription = `${summary} ${description}`.trim();
  const phase = (input.phase || "").trim();
  const city = (input.city || "Lahore").trim();
  const size = (input.size_label || "").trim();
  const type = input.listing_type_slug || "plot";
  const slug = (input.slug || "").trim();

  // 1. Meta Title (Optimal: 45-65 chars)
  const effectiveTitle = metaTitle || (title ? `${title} | Estate Brothers` : "Estate Brothers Property");
  const isMetaTitleOptimal = effectiveTitle.length >= 35 && effectiveTitle.length <= 70;
  checks.push({
    id: "meta_title",
    label: "Meta Title is concise & descriptive (35–70 characters)",
    passed: isMetaTitleOptimal,
    importance: "critical",
    hint: effectiveTitle.length > 70 ? "Title will be truncated on Google." : "Too short to be descriptive.",
  });

  // 2. Meta Description (Optimal: 120-160 chars)
  const effectiveSnippet = metaDescription || (
    combinedDescription
      ? combinedDescription.slice(0, 155)
      : `${size} ${type} for sale in ${phase}, ${city}. Contact Estate Brothers for verified property details.`
  );
  const isSnippetOptimal = effectiveSnippet.length >= 100 && effectiveSnippet.length <= 180;
  checks.push({
    id: "meta_description",
    label: "Meta Description is informative (100–180 characters)",
    passed: isSnippetOptimal,
    importance: "critical",
    hint: effectiveSnippet.length > 180 ? "Description exceeds 180 characters and will be truncated." : "Add more specific details about the property.",
  });

  // 3. Factual Location Context
  const hasLocation = phase.length > 0 && city.length > 0;
  checks.push({
    id: "location_facts",
    label: "Factual Location Context (Phase and City specified)",
    passed: hasLocation,
    importance: "high",
    hint: "Location context is crucial for local search indexing.",
  });

  // 4. Property Specifics (Size + Price)
  const hasSpecs = size.length > 0 && ((input.price_numeric != null && input.price_numeric > 0) || (input.price_label && input.price_label !== "On Call"));
  checks.push({
    id: "property_specs",
    label: "Property Specs & Pricing details provided",
    passed: Boolean(hasSpecs),
    importance: "high",
    hint: "Properties with transparent pricing and exact size rank better and qualify for Offer schema.",
  });

  // 5. Unique Property Body Description (Non-thin)
  const hasRichDescription = combinedDescription.length >= 80;
  checks.push({
    id: "unique_description",
    label: "Unique description provided (at least 80 characters)",
    passed: hasRichDescription,
    importance: "high",
    hint: "Thin property descriptions risk being classified as low-value by Google.",
  });

  // 6. Media & Alt Text
  const hasMedia = Boolean(input.has_media);
  const hasAlt = Boolean(input.media_alt_text && input.media_alt_text.trim().length > 0);
  checks.push({
    id: "media_alt",
    label: "Images uploaded with descriptive Alt text",
    passed: hasMedia && hasAlt,
    importance: "recommended",
    hint: "Descriptive alt text helps Google Image Search index your property photos.",
  });

  // 7. Clean URL Slug
  const isSlugValid = slug.length > 0 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  checks.push({
    id: "url_slug",
    label: "Clean, human-readable URL slug",
    passed: isSlugValid,
    importance: "high",
    hint: "Avoid special characters or overly long keyword strings.",
  });

  // Boilerplate detection
  const boilerplateWarnings = detectBoilerplate(combinedDescription);
  warnings.push(...boilerplateWarnings);

  // Score calculation
  const totalChecks = checks.length;
  const passedChecks = checks.filter((c) => c.passed).length;
  const rawScore = Math.round((passedChecks / totalChecks) * 100);
  const score = Math.max(10, Math.min(100, rawScore - (boilerplateWarnings.length > 0 ? 15 : 0)));

  let grade: SeoQualityReport["grade"] = "poor";
  if (score >= 85) grade = "excellent";
  else if (score >= 70) grade = "good";
  else if (score >= 50) grade = "needs_work";

  const serpUrl = `https://www.estatebrothers.pk/buy-sell/${type}/${slug || "property-slug"}`;

  return {
    score,
    grade,
    checks,
    warnings,
    serpTitle: effectiveTitle,
    serpSnippet: effectiveSnippet,
    serpUrl,
  };
}

/**
 * Evaluates the SEO quality and factual completeness of a blog post or market update.
 */
export function calculateUpdateSeoQuality(input: UpdateSeoInput): SeoQualityReport {
  const checks: SeoCheck[] = [];
  const warnings: string[] = [];

  const title = (input.title || "").trim();
  const metaTitle = (input.meta_title || "").trim();
  const metaDescription = (input.meta_description || "").trim();
  const summary = (input.summary || "").trim();
  const body = (input.body || "").trim();
  const slug = (input.slug || "").trim();

  // 1. Title
  const effectiveTitle = metaTitle || (title ? `${title} | Estate Brothers` : "Market Update | Estate Brothers");
  const isMetaTitleOptimal = effectiveTitle.length >= 35 && effectiveTitle.length <= 70;
  checks.push({
    id: "meta_title",
    label: "Article Title is concise & descriptive (35–70 characters)",
    passed: isMetaTitleOptimal,
    importance: "critical",
  });

  // 2. Meta Description / Summary
  const effectiveSnippet = metaDescription || (summary ? summary.slice(0, 155) : body.slice(0, 155));
  const isSnippetOptimal = effectiveSnippet.length >= 100 && effectiveSnippet.length <= 180;
  checks.push({
    id: "meta_description",
    label: "Meta Description preview is optimal (100–180 characters)",
    passed: isSnippetOptimal,
    importance: "critical",
  });

  // 3. Body Length (People-first in-depth content)
  const isBodySubstantial = body.length >= 250;
  checks.push({
    id: "body_length",
    label: "In-depth article body (at least 250 characters)",
    passed: isBodySubstantial,
    importance: "high",
    hint: "Short, thin updates rarely rank well in Google Search or Discover.",
  });

  // 4. Author Assignment (E-E-A-T)
  const hasAuthor = Boolean(input.author_id);
  checks.push({
    id: "author_assignment",
    label: "Author assigned for Experience & Authority (E-E-A-T)",
    passed: hasAuthor,
    importance: "high",
    hint: "Google's helpful content guidelines emphasize clear authorship.",
  });

  // 5. Featured Image & Alt
  const hasMedia = Boolean(input.has_media || input.media_alt);
  checks.push({
    id: "media_alt",
    label: "Featured image with descriptive Alt text",
    passed: hasMedia,
    importance: "recommended",
  });

  // 6. Clean Slug
  const isSlugValid = slug.length > 0 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  checks.push({
    id: "url_slug",
    label: "Clean URL slug",
    passed: isSlugValid,
    importance: "high",
  });

  const totalChecks = checks.length;
  const passedChecks = checks.filter((c) => c.passed).length;
  const score = Math.round((passedChecks / totalChecks) * 100);

  let grade: SeoQualityReport["grade"] = "poor";
  if (score >= 85) grade = "excellent";
  else if (score >= 70) grade = "good";
  else if (score >= 50) grade = "needs_work";

  const serpUrl = `https://www.estatebrothers.pk/updates/${slug || "article-slug"}`;

  return {
    score,
    grade,
    checks,
    warnings,
    serpTitle: effectiveTitle,
    serpSnippet: effectiveSnippet,
    serpUrl,
  };
}
