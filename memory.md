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

---

## 8. Production SEO / Database Hardening Pass (2026-08-22)

### Issues Fixed
- Fixed the Next 16 production build blocker for admin pages by marking the admin layout as request-time work behind Suspense boundaries.
- Fixed duplicate `<title>` output by making `buildMetadata()` return absolute route titles instead of allowing the root layout title template to append `| Estate Brothers` twice.
- Replaced the file-convention sitemap with an explicit `app/sitemap.xml/route.ts` XML route because the project also needs dynamic SEO routes and `/sitemap.xml` must always return XML.
- Added permanent redirects for legacy plural listing URLs:
  - `/buy-sell/plots/:slug` -> `/buy-sell/plot/:slug`
  - `/buy-sell/houses/:slug` -> `/buy-sell/house/:slug`
- Added a scoped `/seo/[slug]` SEO landing route backed by `seo_landing_pages`; only `/seo/*` landing rows are eligible for the sitemap.
- Expanded webhook cache invalidation for media, listing media, update media/links, SEO landing pages, SEO page overrides, redirects, and URL rules.
- Fixed listing structured data so sold listings emit `https://schema.org/SoldOut` instead of always `InStock`.
- Fixed article structured data fallback author type so Estate Brothers-authored content is represented as an Organization, while named people remain Person authors.
- Added plot-level OG/thumbnail normalization so plot detail metadata can use listing media when available.
- Kept published noindex detail/page content accessible to crawlers while excluding it from collections and the sitemap, so Google can actually read the noindex directive.

### Supabase Changes
- Created and applied migration `supabase/migrations/20260822_production_seo_hardening.sql` to live project `zucpsqjiaexxxobzwodd`.
- Migration changed public read RLS policies for `pages`, `real_estate_listings`, `updates`, and `seo_landing_pages` to allow published scheduled-live rows regardless of `noindex`.
- Tightened admin RLS policies to the `authenticated` role and revoked `anon` execute permission from `public.is_admin()`.
- Set safe `search_path = ''` on trigger/helper functions flagged by Supabase security checks.
- Removed duplicate `idx_*_search_document` GIN indexes, keeping the existing `*_search_idx` indexes.
- Added missing foreign-key indexes identified through live schema checks.
- Verified after migration:
  - no duplicate listing/update/page slugs in the checked live data;
  - no missing FK indexes from the custom FK-index audit query;
  - `is_admin()` executable by `authenticated`, not `anon`;
  - public read policies no longer filter on `noindex`.

### Validation Run
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd run test:seo` passed: 18/18.
- `npm.cmd run build` passed.
- `git diff --check` passed, with Windows CRLF warnings only.
- `npm.cmd run lint` is not available because `package.json` has no `lint` script.
- Local production HTTP checks on `localhost:3020` verified:
  - `/sitemap.xml` returns `200` XML with `<urlset>`;
  - `/` title is `Estate Brothers`, canonical `https://estatebrothers.pk`, robots `index, follow`;
  - `/buy-sell`, `/updates/test-article`, and a listing detail return canonical metadata, robots `index, follow`, and JSON-LD;
  - `/buy-sell/plots/dha-phase-6-1-kanal-possession-plot` returns `308` to the singular listing URL;
  - unknown root pages return `404` with `noindex`.

### Remaining Notes
- The live database currently has zero `seo_landing_pages` and zero `seo_pages` rows. The new `/seo/[slug]` route is ready, but root-level legacy landing URLs such as `/real-estate-lahore` still require either explicit `seo_redirects` rows or a deliberate route/mapping decision before domain cutover.
- The build still warns that custom Cache-Control headers for `/_next/static/:path*` can affect Next.js development behavior. It is non-fatal, but should be reviewed before final Vercel deployment.
- The build logs a non-fatal `useSearchParams()` client-rendering bailout from generated/dependency code; no direct app source usage was found with `rg`.
- Supabase Auth leaked-password protection is still a dashboard configuration item and was not changed by SQL.
- Vercel project settings, production environment variables, domain ownership, DNS, `www` -> apex redirect, and Search Console submission still need external configuration before replacing the old static `estatebrothers.pk` site.

---

## 9. Admin-Managed SEO Landing Pages Pass (2026-08-22)

### Issues Fixed
- Implemented clean top-level SEO landing page routing through `app/(marketing)/[slug]/page.tsx`.
- Added reserved-route protection so SEO landing rows cannot claim core paths such as `/admin`, `/api`, `/buy-sell`, `/updates`, `/sitemap.xml`, `/robots.txt`, or `/seo`.
- Updated `/sitemap.xml` generation so only clean, published, indexable SEO landing pages are included.
- Kept the earlier `/seo/[slug]` route available as a scoped fallback/internal route, but clean production SEO pages should use one-segment canonical paths such as `/dha-lahore-plots-for-sale`.

### Admin / Supabase Changes
- Added admin CRUD for `seo_landing_pages`:
  - `app/admin/seo-landing-pages/page.tsx`
  - `app/admin/seo-landing-pages/new/page.tsx`
  - `app/admin/seo-landing-pages/[id]/edit/page.tsx`
  - `app/admin/seo-landing-pages/SeoLandingPageForm.tsx`
  - `app/admin/seo-landing-pages/actions.ts`
- Added `lib/db/seo-admin.ts` for admin-only SEO landing page reads.
- Added `lib/seo/landing-routes.ts` for clean canonical path normalization and reserved-route checks.
- Added an admin navigation item for SEO landing pages.
- SEO landing page actions now:
  - upload hero/OG image files to the Supabase `site-assets` bucket through the existing `media_assets` pipeline;
  - support external hero/OG image URLs as `media_assets`;
  - validate publish readiness before allowing indexable published pages;
  - create a 301 redirect when an existing page canonical path changes;
  - revalidate SEO landing, sitemap, and admin paths.

### Migrations Applied
- Created and applied `supabase/migrations/20260822_seo_landing_admin_storage_limits.sql`.
  - `site-assets`: 5 MB limit, image MIME types only.
  - `listing-media` / `update-media`: 15 MB limit, image/video/PDF MIME types.
- Created and applied `supabase/migrations/20260822_allow_published_noindex_seo_landing_pages.sql`.
  - Replaced the old constraint that blocked `published + noindex`.
  - Published SEO landing pages now require `published_at`, while `noindex` can be used for live review before indexing.

### Seeded Example
- Inserted a review-safe example SEO landing page into live Supabase:
  - URL: `/dha-lahore-plots-for-sale`
  - Status: `published`
  - Indexing: `noindex = true`
  - Filters: `listing_type_slug = plot`, `city = Lahore`
  - Media: linked through `media_assets` using external `https://estatebrothers.pk/og-default.jpg`
- This page is visible on the website for review, has canonical/noindex metadata and JSON-LD, and is intentionally excluded from sitemap until noindex is turned off.

### Validation Run
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd run test:seo` passed: 18/18.
- `npm.cmd run build` passed.
- `git diff --check` passed with Windows CRLF warnings only.
- Local production HTTP checks on `localhost:3020` verified:
  - `/sitemap.xml` returns `200` XML and excludes `/dha-lahore-plots-for-sale` because the page is noindex.
  - `/robots.txt` returns `200` and blocks `/admin/`, `/dashboard`, and `/api/`.
  - `/dha-lahore-plots-for-sale` returns `200` with title, canonical URL, noindex robots metadata, and JSON-LD.
  - `/definitely-not-real-page` returns `404`.

### Remaining Notes
- Admin-created SEO landing page uploads now use Supabase Storage correctly, but the seeded example uses an external media asset because no browser/admin upload was performed during seeding.
- Before production indexing, the client/admin should review each SEO landing page, confirm the content is genuinely useful, confirm matching listings are relevant, then turn off `noindex`.
- Vercel environment variables, deployment, domain cutover, DNS, and Search Console submission remain external operational steps.

---

## 10. SEO Landing Discovery and Listing UI Pass (2026-08-22)

### Issues Fixed
- Fixed the SEO landing page listing display problem: matching listings were counted correctly, but the page used under-styled `.property-list`/`.detail-link` markup, so the listings were not presented clearly.
- Added a dedicated reusable `SeoLandingListings` component that renders visible cards with title, location, price, details, contact, and detail links.
- Updated both clean SEO landing pages and the legacy `/seo/[slug]` fallback route to use the same visible listing-card UI.

### Public Discovery Strategy Implemented
- Added admin-controlled public placement fields to `seo_landing_pages`:
  - `show_in_footer`
  - `show_on_home`
  - `show_on_buy_sell`
  - `public_link_label`
  - `public_link_description`
- Added cached public SEO link retrieval through `getPromotedSeoLandingLinks()`.
- Added public popular-search placements:
  - footer popular searches
  - homepage popular searches
  - Buy/Sell popular searches
- Public discovery blocks only show SEO landing pages that are `published` and `noindex = false`.

### Supabase Changes
- Created and applied migration `supabase/migrations/20260822_seo_landing_public_discovery.sql` to live project `zucpsqjiaexxxobzwodd`.
- Added partial indexes for footer, homepage, and Buy/Sell promoted SEO links.
- Updated the seeded `/dha-lahore-plots-for-sale` row with public placement labels and flags while keeping `noindex = true`, so it is ready to appear after review when noindex is disabled.

### Validation Run
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd run test:seo` passed: 18/18.
- `npm.cmd run build` passed.
- `git diff --check` passed with Windows CRLF warnings only.
- Local production HTTP checks on `localhost:3020` verified:
  - `/dha-lahore-plots-for-sale` returns `200`.
  - The page contains visible `seo-listing-card` markup, `Matching listings`, canonical metadata, and JSON-LD.
  - The page currently rendered 8 matching listing cards from live Supabase data.
  - `/sitemap.xml` excludes `/dha-lahore-plots-for-sale` because the page is still noindex.
  - Homepage and Buy/Sell public popular-search sections do not show the seeded page while it remains noindex.

### Remaining Notes
- To make a reviewed SEO landing page visible in footer/home/Buy-Sell popular searches, keep its placement flags on and turn `noindex` off in admin.
- The seeded page is publicly viewable by direct URL for review, but is intentionally not promoted or submitted to Google until noindex is disabled.

---

## 11. Admin GUI Revamp Pass (2026-08-22)

### Design Source
- Used the local Open Design prototype at `C:\Users\hp\AppData\Roaming\Open Design\namespaces\release-stable-win\data\projects\d0c3161c-e181-413c-b731-ce4910552eb1\estate-brothers-admin.html`.
- Preserved its core visual direction: warm editorial background, dark sticky sidebar, compact topbar, elevated surface cards, refined tables, pill badges, responsive mobile navigation, and accessible focus states.

### Issues Fixed / Changes Made
- Added reusable client shell `components/admin/AdminShellChrome.tsx`.
- Reworked `app/admin/layout.tsx` to use the new shell while preserving Next 16 `cacheComponents` Suspense/request-time behavior.
- Updated `components/ui/AdminLogoutButton.tsx` so logout still uses the existing server action but fits the new sidebar layout.
- Added a comprehensive admin CSS revamp in `styles/admin.css` that restyles existing classes instead of rewriting every admin page.
- Existing admin pages, forms, tables, server actions, auth guard, and CRUD route structure were preserved.

### Validation Run
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd run test:seo` passed: 18/18.
- `npm.cmd run build` passed after moving the request-time marker outside the client shell Suspense boundary.
- `git diff --check` passed with Windows CRLF warnings only.
- Local production smoke checks on `localhost:3021` verified:
  - `/admin/login` returns `200` and includes the revamped login classes.
  - unauthenticated `/admin` returns `307` to `/admin/login`.

### Remaining Notes
- No `lint` script exists in `package.json`.
- Build still has the known non-fatal Next warnings about custom `/_next/static` Cache-Control headers and a generated/dependency `useSearchParams()` bailout.
- Browser visual QA while authenticated is still recommended before final client handoff, especially on dense edit forms.

### Follow-up Fix
- After browser review showed desktop admin rendering mobile header text and sidebar initials beside labels, hardened `AdminShellChrome` and `styles/admin.css`.
- Replaced the ambiguous `admin-shell-collapsed` class with explicit `is-expanded` / `is-collapsed` shell state.
- Added final desktop/mobile guard rules so:
  - desktop hides `.admin-mobile-bar` and `.admin-mobile-sheet`;
  - expanded desktop sidebars hide `.admin-nav-initial`;
  - collapsed desktop sidebars hide labels and show initials;
  - mobile re-enables the mobile bar/sheet under the breakpoint.
- Validation after fix: `npx.cmd tsc --noEmit`, `npm.cmd run build`, `npm.cmd run test:seo`, and `git diff --check` passed.

### SEO Landing Form Fix
- Removed `encType="multipart/form-data"` from `SeoLandingPageForm`; React/Next Server Action forms set encoding automatically and warn when `encType` or `method` is manually specified.
- Reworked `SeoLandingPageForm` to match the rest of the admin edit-page structure:
  - outer `admin-page`;
  - `admin-page-header`;
  - `admin-meta-bar`;
  - repeated `admin-form-section` blocks;
  - sticky `admin-form-actions`;
  - consistent `admin-field-row` spacing.
- Added `.admin-media-preview` styling for uploaded/external hero and OG image previews.
- Validation after fix: no remaining `encType=` or `method=` in admin/components; `npx.cmd tsc --noEmit`, `npm.cmd run test:seo`, `npm.cmd run build`, and `git diff --check` passed.

### SEO Landing Listing Card Link Fix
- Updated `components/seo/SeoLandingListings.tsx` so each matching listing card is a full-card `<Link>` to the correct listing detail route, instead of only linking the small `View details` text.
- Cleaned listing card formatting:
  - proper `Plot` / `House` label casing;
  - fixed separator text to `·`;
  - kept semantic `<article>` and `<dl>` content inside the linked card;
  - added accessible `aria-label` per card.
- Updated `styles/buySell.css` so hover/focus applies to the full card and removed the fragile `:has()` selector in favor of `.seo-listing-facts > div`.
- Validation after fix: `npx.cmd tsc --noEmit`, `npm.cmd run test:seo`, `npm.cmd run build`, and `git diff --check` passed.

### SEO Landing Listing Table Fix
- Replaced the SEO landing matching-listing card grid with a table-style layout using the same `inventory-table` visual language as the main Buy/Sell page.
- Each row now includes linked listing title and linked `View details` action to `/buy-sell/{type}/{slug}`.
- Added responsive mobile table-card behavior through `data-label` cells, while keeping crawlable server-rendered table markup for SEO.
- Local production HTML check verified `/dha-lahore-plots-for-sale` emits `seo-listing-table`, no longer emits `seo-listing-grid`, and includes listing detail hrefs.
- Validation after fix: `npx.cmd tsc --noEmit`, `npm.cmd run test:seo`, `npm.cmd run build`, and `git diff --check` passed.

### SEO Landing Listing Responsive Styling Fix
- Reworked `components/seo/SeoLandingListings.tsx` back to semantic table markup with a hidden `<caption>`, real column headers, and crawlable listing/detail links.
- Updated `styles/buySell.css` so SEO landing listings reuse the same Buy/Sell `inventory-table` and `inventory-table-wrap` styling.
- Removed the card/container-query fallback after review; the SEO landing listings now remain tabular like Buy/Sell.
- Added Buy/Sell-style responsive column rules so less important columns are hidden at smaller breakpoints instead of changing the layout into cards.
- Verification after fix:
  - `npx.cmd tsc --noEmit` passed.
  - `npm.cmd run test:seo` passed: 18/18.
  - `npm.cmd run build` passed.
  - `git diff --check` passed with Windows CRLF warnings only.
  - Built server output contains `inventory-table-wrap`, `seo-listing-table`, `Matching property listings`, and listing detail links.
- Runtime `next start` smoke check was not run because the local shell policy blocked background server start commands in this turn.

### Admin/Public Media Linkage Fix
- Audited the real Supabase schema/data for SEO landing pages and media assets before changing code.
- Verified the published SEO landing page `dha-lahore-plots-for-sale` has `hero_media_id=2f201de8-e2d0-4310-b8d1-807a0fa562e7` linked to a published `media_assets` row in the `site-assets` Supabase storage bucket.
- Fixed the public SEO landing routes at `app/(marketing)/[slug]/page.tsx` and `app/(marketing)/seo/[slug]/page.tsx` so `hero_media` is now rendered visibly in the hero section with the stored alt text/caption.
- Added `components/ui/SafeMediaImage.tsx` and `lib/media/images.ts` so admin-managed local, Supabase storage, and production-domain images can use `next/image`, while arbitrary external URLs safely fall back to a normal `<img>` instead of breaking rendering.
- Updated `app/admin/seo-landing-pages/SeoLandingPageForm.tsx` and actions so current hero/OG images preview correctly, long media URLs are contained in the layout, existing media is preserved unless explicitly removed, and editors can remove current hero/OG media.
- Updated listing normalization and plot detail rendering so listing gallery/media from Supabase appears on detail pages when available.
- Added empty-data placeholder static params for dynamic listing/update routes so the production build remains valid even when Supabase currently has no indexable rows for those routes.
- No database migration was required for this specific media-linkage fix; the required `hero_media_id`/`og_media_id` relationships already existed.
- Validation after fix: `npx.cmd tsc --noEmit` passed, `npm.cmd run test:seo` passed, `npm.cmd run build` passed, and `git diff --check` passed with Windows CRLF warnings only.
- Remaining follow-up: authenticated browser QA should verify SEO landing hero upload/replace/remove flows end-to-end from the admin UI before final client handoff.

### Admin SQA Fix Pass
- Implemented the high-priority admin SQA fixes from `SQA-Admin.md` without changing the working SEO landing-page architecture.
- Fixed listing admin persistence:
  - `availability` now saves on create/update independently from publication `status`;
  - `contact_person_id` now saves on create/update, with empty values normalized to `null`.
- Fixed site settings hidden-overwrite risk:
  - added dashboard fields for `price_range`, `linkedin`, and `youtube`;
  - `saveSiteSettings` now preserves existing social keys if fields are omitted.
- Added existing media management for listing and update edit pages:
  - admin loaders now fetch `listing_media/update_media` with `media_assets`;
  - existing media is displayed in `ExistingMediaManager`;
  - editors can update title, alt text, sort order, primary/featured, gallery, and OG flags;
  - removal detaches only the relation, not the underlying storage object/media asset.
- Improved SEO/media correctness:
  - listing/update SEO widget initial state now counts relational media;
  - public update feed/detail images now use `SafeMediaImage`.
- Improved production/cache behavior:
  - page route changes now create 301 redirects from old route to new route;
  - listing/update/page/site setting mutations explicitly revalidate `/sitemap.xml`;
  - storage uploads now clean up the just-uploaded object if `media_assets` insertion fails;
  - `/admin/login` renders without authenticated admin shell chrome.
- Updated `SQA-Admin.md` with a 2026-08-23 implementation progress log and exact remaining open/deferred issues.
- Validation after fix:
  - `npx.cmd tsc --noEmit` passed;
  - `npm.cmd run test:seo` passed 20/20;
  - `npm.cmd run build` passed;
  - `git diff --check` passed with Windows CRLF warnings only.
- Remaining known issues:
  - ADM-009 inline `useActionState` error UX remains a separate admin-wide refactor;
  - ADM-013 team profile fields remain deferred until a public team-profile route/product decision exists;
  - ADM-014 page `og_media_id` media-model alignment remains deferred because existing `og_image` URL SEO behavior is functional;
  - authenticated browser QA is still required for media management, listing save/reload, site settings save, and login shell rendering before client handoff.

### ADM-013 SEO Team Profile Implementation
- Implemented ADM-013 as a real admin-managed SEO profile feature rather than just exposing unused fields.
- Added public `/team/[slug]` route backed by Supabase `team_members`.
- Admin team edit now manages profile-page fields:
  - `has_profile_page`;
  - generated `canonical_path`;
  - `profile_summary`;
  - `profile_body`;
  - `keywords`;
  - `meta_title`;
  - `meta_description`;
  - image alt text through linked `media_assets.alt_text`;
  - OG image upload/URL.
- Added indexability quality gate:
  - published + profile page requires job title, image, alt text, summary, full body, meta description, keywords, and canonical path;
  - incomplete profiles can be saved but are not valid indexable profile pages.
- Added SEO output:
  - dynamic metadata/canonical/OG image;
  - `ProfilePage` JSON-LD with `Person` main entity;
  - breadcrumb JSON-LD;
  - sitemap inclusion only for complete published profile pages.
- Added internal links from About team cards, listing contact panel, and Buy/Sell contact popovers when a team profile is eligible.
- Added 301 redirect recording when a team profile canonical path changes.
- Added `team-profile-{slug}` revalidation and explicit profile/About/Buy-Sell/sitemap revalidation on team mutations.
- Updated `SQA-Admin.md` with the ADM-013 completion log.
- Validation after implementation:
  - `npx.cmd tsc --noEmit` passed;
  - `npm.cmd run test:seo` passed 21/21;
  - `npm.cmd run build` passed and included `/team/[slug]` in the route table.
- Remaining QA:
  - authenticated browser save/reopen check for `/admin/team/40000000-0000-0000-0000-000000000001/edit`;
  - verify complete profiles render at `/team/{slug}`;
  - verify `/sitemap.xml` includes only complete published team profiles.

### Admin Help / Knowledgebase Assistant
- Added isolated `features/admin-help/` feature for admin guidance without disturbing existing SEO/admin flows.
- Added verified markdown guides for About page management, pages editor structure, SEO basics, media guidelines, listings, and updates.
- Added protected server action `askAdminHelp` that requires admin auth, selects relevant local guide docs, and uses Gemini server-side only.
- Default admin-help model is `gemini-3.7-flash`, configurable with `GEMINI_ADMIN_HELP_MODEL`; `GEMINI_API_KEY` remains server-only.
- Added production-safe fallback: if Gemini is missing or temporarily unavailable, admins still receive matching verified guide sources instead of raw API errors.
- Added `/admin/help`, admin nav `Help`, and a floating `?` drawer across authenticated admin pages.
- Added scoped styles in `styles/admin.css`.
- Validation:
  - `npx.cmd tsc --noEmit` passed;
  - `npm.cmd run test:seo` passed 21/21;
  - `npm.cmd run build` passed;
  - `git diff --check -- features/admin-help app/admin/help components/admin/AdminShellChrome.tsx app/admin/layout.tsx styles/admin.css` passed with CRLF warnings only;
  - Playwright production-build smoke test on `127.0.0.1:3001` passed login, `/admin/help`, guide cards, Help nav, floating drawer, and guide fallback answer.
- Runtime note: Gemini model API accepted `gemini-3.7-flash`, but validation call hit a temporary 503 high-demand response; fallback worked.
- Future admin sections should add verified markdown files under `features/admin-help/knowledgebase/` and register them in `ADMIN_HELP_DOCS`.
