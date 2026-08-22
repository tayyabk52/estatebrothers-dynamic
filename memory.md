# Project Memory & Architecture Log

**Project:** Estate Brothers (`estatebrothers.pk`)  
**Stack:** Next.js 16.x (App Router), React 19, Supabase (PostgreSQL), SSR / Dynamic IO Caching (`"use cache"`), Vitest.

---

## 1. Authentication & Security Architecture

### Why
Direct client-side authentication mutations to Supabase caused browser-level `ERR_QUIC_PROTOCOL_ERROR` (525) and CORS issues in modern browser environments.

### What Was Done
- **Server Action Boundaries:** All authentication mutations (e.g., `signInWithPassword`) are executed exclusively within Next.js Server Actions (`app/admin/login/actions.ts`).
- **Server-Side Authorization:** The Server Action authenticates via the server Supabase SSR client, validates admin privileges (`is_admin` RPC), sets session cookies, and handles redirects.
- **Proxy Validation:** The Next.js 16 route proxy (`proxy.ts`) uses `getClaims()` rather than network-heavy `getUser()` for efficient session validation.
- **Client Integration:** The login form uses React's `useActionState` to handle loading and error states without making direct client-to-Supabase network calls.

---

## 2. Next.js 16 Caching & Prerendering Architecture

### Why
To achieve sub-100ms TTFB while maintaining dynamic database backing from Supabase, the application leverages Next.js 16's Cache Components (`"use cache"`).

### What Was Done
- **`next.config.ts`:** Enabled `cacheComponents: true` at the top level.
- **Database Query Caching (`lib/db/*.ts`):**
  - All public read functions across `listings.ts`, `updates.ts`, `site.ts`, and `team.ts` use `'use cache'`, `cacheLife(...)`, and `cacheTag(...)`.
  - All admin functions remain uncached (session-dependent with cookies).
- **Prerendering Determinism Fix:**
  - Removed dynamic calls to `new Date()` / `NOW()` from within cached database queries and Server Components to avoid `next-prerender-current-time` bailout errors.
  - Created `<CurrentYear />` client component (`components/ui/CurrentYear.tsx`) for copyright dates in the footer.
- **Stale-While-Revalidate Invalidation:**
  - Admin mutation actions use `revalidateTag(tag, "max")` for modern stale-while-revalidate invalidation.
- **Webhook Backup Purge (`app/api/revalidate/route.ts`):**
  - Created a POST endpoint guarded by `SUPABASE_WEBHOOK_SECRET` to purge cache tags on direct database mutations.

---

## 3. SEO Hardening & Technical Safeguards (Phase 1)

### A. Slug History & Permanent 301/308 Redirect Architecture
- **Problem:** In headless CMS setups, changing a property or update title changes its slug, instantly causing 404 errors for indexed Google URLs and breaking backlinks.
- **Solution:**
  - Created `lib/db/redirects.ts` utilizing the `seo_redirects` database table with cached lookups (`getRedirectForPath`).
  - Admin update actions (`app/admin/listings/actions.ts`, `app/admin/updates/actions.ts`) automatically compare old vs. new paths and record 301 redirects when slugs change.
  - Built-in redirect chain collapsing (`A → B → C` automatically updates to `A → C` and `B → C`) and loop prevention.
  - Route handlers (`buy-sell/[listingType]/[slug]/page.tsx`, `updates/[slug]/page.tsx`) resolve redirects on 404 candidates using `permanentRedirect(targetPath)` (HTTP 308/301).

### B. State Model Separation (Publication vs. Business vs. Indexing)
- **Problem:** Tying business state (e.g., Sold) directly to deletion or unpublishing destroys search rankings and backlink equity. Tying `noindex` to 404s produces crawl errors.
- **Solution:**
  - **Publication Status (`status`):** `draft`, `review`, `published`, `archived`.
  - **Business Availability (`availability`):** `available`, `sold`, `under_offer`. Sold properties remain `published` and indexable with a clear visual `.status-sold` badge.
  - **Indexing Policy (`noindex`):** Pages with `noindex: true` render valid HTML with `<meta name="robots" content="noindex, follow">` rather than throwing false 404s.

### C. Strict Sitemap Filtering
- **Solution:** `app/sitemap.ts` strictly enforces `status === "published"` and `noindex === false`. Emits absolute URLs (`https://estatebrothers.pk/...`) and uses `generateSitemaps()` chunking at 45,000 URLs to adhere to Google Search Console size limits.

### D. Structured Data Modernization
- **Solution:**
  - Removed deprecated `SearchAction` from `buildWebSiteSchema()` (Sitelinks Search Box was removed globally by Google in Nov 2024). Retained `WebSite` for site name representation.
  - Aligned `RealEstateListing`, `Article`, `Organization`, `RealEstateAgent`, and `BreadcrumbList` schemas with visible on-page content.

### E. Visible Semantic HTML Breadcrumbs
- **Solution:** Added `<nav aria-label="Breadcrumb" className="breadcrumb-nav">` with styled `<ol className="breadcrumb-list">` to property and update pages, ensuring 1:1 parity with JSON-LD `BreadcrumbList` schemas.

### F. Automated SEO Regression Test Suite
- **Solution:** Created `tests/seo-regression.test.ts` powered by Vitest (`npm run test:seo`) with 18 automated tests verifying metadata builders, JSON-LD schemas, robots directives, canonical URL generation, and content quality validator scoring.

---

## 4. CMS SEO Safety & Content Governance (Phase 2)

### A. Real-Time SEO Quality & Content Completeness Engine (`lib/seo/validator.ts`)
- **Problem:** Non-technical admins might publish thin or generic listings without essential factual specs, or mass-produce repetitive boilerplate copy that violates Google's Scaled Content Abuse policies.
- **Solution:**
  - Built `calculateListingSeoQuality()` and `calculateUpdateSeoQuality()` evaluating factual completeness (phase, size, beds/baths, price, unique description, alt text) rather than arbitrary word counts.
  - Implemented `detectBoilerplate()` to detect low-value real-estate filler phrases ("hot deal, golden opportunity, contact now") and excessive keyword repetition.
  - Generates real-time scores (0–100) with grade classifications (`excellent`, `good`, `needs_work`, `poor`).

### B. Interactive Admin SEO Quality Widget (`components/admin/SeoQualityWidget.tsx`)
- **Solution:** Embedded live in `/admin/listings` and `/admin/updates` form editors.
  - **Live SERP Mockup:** Real-time simulation of Google Search desktop & mobile result cards (Title Link, URL breadcrumbs, Snippet text).
  - **Live Score Gauge:** Color-coded score badge (Green/Blue/Amber/Red).
  - **Interactive Quality Checklist:** Instant feedback on missing fields, unoptimized title lengths, or lacking descriptions.

### C. Slug-Change Warning & Redirect Safeguard (`components/admin/SlugFieldWithWarning.tsx`)
- **Problem:** Admins editing existing listings can inadvertently change URLs and break inbound traffic or indexed pages.
- **Solution:** Specialized interactive slug field that shows a persistent amber warning whenever an existing slug is modified, explicitly displaying the 301 permanent redirect that will be established upon saving.

### D. Image Alt-Text & OpenGraph Manager (`components/admin/MediaAltManager.tsx`)
- **Solution:** Streamlined media management requiring/suggesting descriptive image alt text with contextual property suggestions, plus dedicated toggles for Primary Hero Thumbnail and OpenGraph social sharing images.

### E. Safe Sold-Property Governance
- **Solution:** In the CMS, `status` (`Draft`/`Review`/`Published`/`Archived`) is strictly separated from `availability` (`Available`/`Sold`/`Under Offer`/`Reserved`). Guidance notes explain to admins that setting a property to "Sold" keeps it published and indexed with a "Sold" badge, preserving historical search rankings.

---

## 5. AI Assistant for SEO Content Generation (Phase 3)

### A. Gemini 3.6 Flash Integration (`lib/ai/actions.ts`)
- **Problem:** Writing high-quality, non-repetitive SEO property descriptions and metadata is time-consuming and leads to thin content or keyword stuffing when done manually at scale.
- **Solution:**
  - Integrated Google's latest `@google/genai` SDK using the `gemini-3.6-flash` model.
  - Built `generateListingSEOData` Server Action which takes raw property facts (Location, Size, Price, Beds, Baths) and generates strict JSON matching the required CMS fields.
  - Configured with a system prompt enforcing Pakistani real estate context (DHA Lahore), factual accuracy, and explicit bans on generic filler ("hot deal").

### B. Auto-Fill CMS Tooling (`components/admin/AIGenerateButton.tsx`)
- **Solution:**
  - Added a "✨ Auto-Fill with AI" button into the `/admin/listings/new` and `/admin/listings/[id]/edit` form components.
  - Implements a vanilla JavaScript DOM reader/writer to fetch current inputs, call the Server Action, and auto-populate the `title`, `summary`, `description`, `meta_title`, and `meta_description` textareas without requiring a full React client-component state refactor of the large admin forms.
  - Immediately dispatches standard DOM `input` events so the `SeoQualityWidget` instantly recalculates and displays the new 90+ "Excellent" score upon completion.

---

## 6. Full-Text Search (`tsvector` & GIN Indexes)

### Why
To enable sub-100ms full-text search across listings, updates, pages, and team members without relying on slow `ILIKE` pattern scans.

### What Was Done
- Created migration `supabase/migrations/20260821_tsvector_population_triggers.sql` adding `BEFORE INSERT OR UPDATE` triggers across all 5 content tables to automatically maintain the `search_document` tsvector column with weighted fields (A/B/C/D) and GIN indexes.

---

## 7. Summary of Key Files & Roles

| File Path | Role |
| :--- | :--- |
| `lib/ai/actions.ts` | Gemini 2.0 Flash integration for SEO content generation. |
| `components/admin/AIGenerateButton.tsx` | UI button to trigger AI auto-fill in CMS forms. |
| `lib/db/redirects.ts` | Cached dynamic redirect lookups & chain-collapsing redirect writer. |
| `lib/db/listings.ts` | Cached public listing queries with `'use cache'` and `cacheTag`. |
| `lib/db/updates.ts` | Cached public update/blog queries. |
| `lib/seo/metadata.ts` | Canonical metadata generator (titles, descriptions, OpenGraph, robots). |
| `lib/seo/structured-data.ts` | Google-compliant JSON-LD schema builder (Org, Agent, Article, Listing, Breadcrumbs). |
| `lib/seo/validator.ts` | Factual completeness scorer, boilerplate detector, and SERP snippet formatter. |
| `components/admin/SeoQualityWidget.tsx` | Live Google SERP preview, score gauge, and SEO checklist widget. |
| `components/admin/SlugFieldWithWarning.tsx` | Live slug field with 301 redirect preview & warning banner. |
| `components/admin/MediaAltManager.tsx` | Media manager with image alt-text guidance and OG candidate toggles. |
| `app/sitemap.ts` | Chunked XML sitemap generator (canonical, published, indexable only). |
| `app/robots.ts` | Crawl boundary rules (blocks `/admin/`, `/api/`, and AI scrapers like `GPTBot`). |
| `tests/seo-regression.test.ts` | Automated Vitest test suite preventing SEO regressions (`npm run test:seo`). |
| `proxy.ts` | Route protection & session claims validation for admin routes. |
