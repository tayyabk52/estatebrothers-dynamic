# Technical SEO Audit & Implementation Plan (Estate Brothers Next.js)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all content-agnostic technical SEO issues in the Next.js 16 App Router site so it is Google-safe for static demo launch while clearly separating what requires client-provided facts.

**Architecture:** Static-first Next.js App Router site; all public routes are SSR/statically rendered; structured data is injected server-side via `dangerouslySetInnerHTML` in page components; metadata is built via `lib/seo/metadata.ts` and `lib/seo/structured-data.ts`. No database or auth yet.

**Tech Stack:** Next.js 16 App Router, TypeScript, `next/image`, `next/og`, Schema.org JSON-LD, `MetadataRoute` API.

---

## Executive Verdict

| Question | Answer |
|----------|--------|
| **SEO-safe for static demo launch?** | YES — after Tasks 1–5 below. The infrastructure is solid: robots.txt blocks dashboard/API, admin layout has `noindex`, sitemap excludes admin, OG images are PNG (correct), canonical URLs are set per-page. |
| **Fully SEO optimized?** | NO — blocked by 4 code bugs, 2 unverified schema claims, 2 missing config items (verification tokens), and placeholder update body text visible to crawlers. |
| **Difference?** | "Safe" means Googlebot won't be misled or blocked. "Optimized" means every schema claim is verifiable, every structured data URL is real, every image is LCP-preloaded correctly, and every content-dependent placeholder has been replaced with real facts. |

---

## What Can Be Done Now (Content-Agnostic)

### Priority: Critical

| # | Issue | File | Why It Matters |
|---|-------|------|----------------|
| C1 | `preload` on `<Image>` is not a valid Next.js prop | `app/(marketing)/about/page.tsx:47` | Image is silently ignored as priority — CEO photo is a likely LCP candidate on About and will not be preloaded, causing measurable LCP regression. Google's Core Web Vitals affect ranking. |
| C2 | `buildPersonSchema` references `member.jobRole` which is not in `PersonForSchema` | `lib/seo/structured-data.ts` | TypeScript error; emitted JSON-LD has `jobTitle: undefined` (property is omitted), making the schema incomplete. Google's Rich Results Test would flag invalid/missing required properties. |
| C3 | `not-found.tsx` has no `noindex` directive | `app/not-found.tsx` | 404 pages should never be indexed per Google's Crawling & Indexing docs. If Googlebot follows a broken link, this page could appear in SERPs. |
| C4 | `buildUpdateItemListSchema` sets `url: SITE_URL/updates` for every item | `lib/seo/structured-data.ts` | All CreativeWork items claim the same URL. Google's structured data guidelines state that schema URLs must match the page where content appears. This creates misrepresentation — not a penalty risk but a trust/quality signal loss. |

### Priority: High

| # | Issue | File | Why It Matters |
|---|-------|------|----------------|
| H1 | `openingHours: "Mo-Su 00:00-23:59"` is unconfirmed 24/7 claim | `lib/seo/structured-data.ts` | Google's structured data quality guidelines explicitly warn against schema that misrepresents content. A claim of 24/7 availability that is false could trigger a manual action for spammy structured data. |
| H2 | `numberOfEmployees: { value: 30 }` is an unconfirmed number | `lib/seo/structured-data.ts` | Same policy risk. If the actual number differs, the schema is factually wrong. This is lower risk than hours but still a false claim in structured data. |
| H3 | Verification token slots not present in metadata | `app/layout.tsx` | Google Search Console cannot be verified at launch without a `<meta name="google-site-verification">` tag or DNS record. This delays indexing visibility and sitemap submission. |
| H4 | Sitemap `lastModified` for static routes is hardcoded to `"2026-05-15"` | `app/sitemap.ts` | Google's Sitemaps documentation notes that incorrect `lastmod` values are ignored or reduce crawler trust. Hardcoded dates go stale and misinform crawl scheduling. |

### Priority: Medium

| # | Issue | File | Why It Matters |
|---|-------|------|----------------|
| M1 | Update `body` text contains placeholder copy: `"This post format can later be connected..."` | `data/updates.ts` | This text is passed to `buildUpdateItemListSchema` and rendered in the DOM. Google's page quality guidelines penalise "thin content" and content that looks unfinished. |
| M2 | About page "CredibilityPosts" section subheading reads as template text | `app/(marketing)/about/page.tsx:186–190` | Visible text: *"This section is prepared as an editable media feed..."* — crawlable, obviously placeholder, poor quality signal. |

---

## What Must Wait for Client Facts

| Item | Reason |
|------|--------|
| Google/Bing verification tokens | Must be obtained from Google Search Console / Bing Webmaster Tools — cannot be guessed |
| `openingHours` correction | Must confirm actual business hours from client (replace or remove until confirmed) |
| `numberOfEmployees` | Must confirm from client or remove |
| `sameAs` URLs (Google Business Profile, LinkedIn, YouTube) | Client must provide real profile URLs |
| Real update body text | Client must supply actual announcements, market notes, MOU details |
| Real credibility post content | Client must supply partnership images and event descriptions |
| `hasMap` Google Maps URL | Should be the verified Google Business Profile map link |
| Team member photos beyond CEO | Client must supply headshots for schema `image` fields |
| `foundingDate: "2014"` confirmation | Verify with client that 2014 is accurate |
| Service area confirmation | "Lahore, Karachi, Islamabad" in schema — confirm client actually serves all three |

---

## Route-by-Route SEO State

| Route | Title Pattern | Indexable | Schema | Notes |
|-------|--------------|-----------|--------|-------|
| `/` | "Estate Brothers" | ✅ | Organization + RealEstateAgent + WebSite | Good. Hero uses `fetchPriority="high"` + `loading="eager"` correctly. |
| `/about` | "About \| Estate Brothers" | ✅ | Person (CEO) | CEO image `preload` prop broken — fix Task 1. |
| `/buy-sell` | "Buy/Sell \| Estate Brothers" | ✅ | ItemList | Good. Listings are real data. |
| `/buy-sell/[type]/[slug]` | "[Title] \| Estate Brothers" | ✅ | RealEstateListing + BreadcrumbList | Good. `offers` is conditional on `priceNumeric` — "On Call" listings correctly omit price. |
| `/updates` | "Updates \| Estate Brothers" | ✅ | ItemList (CreativeWork) | URL fix needed (Task 4). Body placeholder text needed (Task 6). |
| `/contact` | "Contact \| Estate Brothers" | ✅ | FAQPage | Good. FAQ answers are substantive. |
| `/dashboard` | "Admin Dashboard" | ❌ noindex | None | `(admin)/layout.tsx` has `robots: { index: false, follow: false }` — correct. robots.txt also blocks it. |

---

## File Map (Files Modified in This Plan)

| File | Tasks |
|------|-------|
| `app/(marketing)/about/page.tsx` | Task 1 |
| `lib/seo/structured-data.ts` | Tasks 2, 4, 5 |
| `app/not-found.tsx` | Task 3 |
| `app/layout.tsx` | Task 7 |
| `app/sitemap.ts` | Task 8 |
| `data/updates.ts` | Task 6 |

---

## Task 1: Fix CEO Image Preload on About Page

**Files:**
- Modify: `app/(marketing)/about/page.tsx:47`

- [ ] **Step 1: Replace invalid `preload` prop with `priority`**

In `app/(marketing)/about/page.tsx`, find the CEO `<Image>` component (line ~47) and replace:

```tsx
// BEFORE (invalid prop — silently ignored by Next.js):
<Image
  src="/images/team/ceo-tajamal-hussain.jpg"
  alt="Tajamal Hussain at the Estate Brothers office"
  width={600}
  height={700}
  preload
  sizes="(max-width:768px) 100vw, 600px"
  placeholder="blur"
  blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
/>

// AFTER (correct — triggers rel="preload" in Next.js output):
<Image
  src="/images/team/ceo-tajamal-hussain.jpg"
  alt="Tajamal Hussain at the Estate Brothers office"
  width={600}
  height={700}
  priority
  sizes="(max-width:768px) 100vw, 600px"
  placeholder="blur"
  blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
/>
```

- [ ] **Step 2: Verify fix**

Run: `npx next build` and inspect the HTML output of `/about` — the CEO image `<link>` should appear as `<link rel="preload" as="image" ...>` in the `<head>`.

Alternatively, load `/about` in Chrome DevTools → Network tab, filter by "Img" — the CEO photo should have `Priority: High`.

- [ ] **Step 3: Commit**

```bash
git add "app/(marketing)/about/page.tsx"
git commit -m "fix: replace invalid preload prop with priority on About CEO image"
```

---

## Task 2: Fix `buildPersonSchema` TypeScript Bug

**Files:**
- Modify: `lib/seo/structured-data.ts`

The function uses `member.jobRole` which is not a property in `PersonForSchema`. The correct properties are `member.jobTitle` and `member.role`.

- [ ] **Step 1: Fix the property reference**

In `lib/seo/structured-data.ts`, find `buildPersonSchema` and change:

```ts
// BEFORE (jobRole does not exist in PersonForSchema — always undefined):
jobTitle: member.jobRole ?? member.role,

// AFTER:
jobTitle: member.jobTitle ?? member.role,
```

- [ ] **Step 2: Verify the schema output**

Add a temporary `console.log(JSON.stringify(buildPersonSchema({ name: "Test", role: "CEO" })))` in any test or REPL, confirm `jobTitle` is `"CEO"`.

Or run: `npx tsc --noEmit` and confirm no TypeScript errors in `lib/seo/structured-data.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/seo/structured-data.ts
git commit -m "fix: correct buildPersonSchema to use member.jobTitle ?? member.role"
```

---

## Task 3: Add `noindex` to 404 Page

**Files:**
- Modify: `app/not-found.tsx`

- [ ] **Step 1: Add metadata export with noindex**

Replace the entire `app/not-found.tsx` with:

```tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="wrap">
        <div className="eyebrow">404</div>
        <h1>Page not found.</h1>
        <p>The page you are looking for does not exist or has been moved.</p>
        <Link href="/">Back to home →</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run `npx next build && npx next start`, visit `/anything-that-doesnt-exist`, view page source. Confirm `<meta name="robots" content="noindex,nofollow">` appears in `<head>`.

- [ ] **Step 3: Commit**

```bash
git add app/not-found.tsx
git commit -m "fix: add noindex metadata to 404 not-found page"
```

---

## Task 4: Fix `buildUpdateItemListSchema` Duplicate URLs

**Files:**
- Modify: `lib/seo/structured-data.ts`

**Problem:** Every `CreativeWork` item has `url: SITE_URL/updates` (identical). Google's structured data guidelines require that schema URLs match the actual page where content lives. Since individual update articles don't have dedicated routes yet, we have two valid options:

**Option A (Recommended — honest):** Use `url: ${SITE_URL}/updates#${update.slug}` — indicates the item is on the `/updates` page, differentiated by anchor. This is honest because the page does exist and the anchor is meaningful for navigation (even if not yet wired to `id` attributes on cards). **Add the matching `id` to each update card element** at the same time.

**Option B (Conservative):** Remove the `url` field entirely from each `CreativeWork`. Schema.org allows `CreativeWork` without `url`.

This plan uses Option A because it's more specific and forward-compatible with anchor navigation.

- [ ] **Step 1: Update `buildUpdateItemListSchema` to use slug anchors**

In `lib/seo/structured-data.ts`, replace the `buildUpdateItemListSchema` function:

```ts
export function buildUpdateItemListSchema(updates: UpdateForSchema[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: updates.map((update, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: update.title,
        description: update.summary ?? update.body,
        datePublished: update.publishedAt,
        dateModified: update.updatedAt ?? update.publishedAt,
        url: `${SITE_URL}/updates#${update.slug}`,
      },
    })),
  };
}
```

- [ ] **Step 2: Add matching `id` attributes to update cards in the Updates component**

Find the component that renders individual update cards (likely `components/pages/UpdatesClient.tsx` or similar). On each card's root element, add `id={update.slug}`. This makes the anchor URLs real:

```tsx
// In UpdatesClient.tsx or wherever update cards are rendered:
<article id={update.slug} className="update-card" key={update.id}>
  {/* existing card content */}
</article>
```

- [ ] **Step 3: Verify**

Visit `/updates` in browser. In URL bar, navigate to `/updates#estate-brothers-team-expansion-dha-lahore`. The page should scroll to that card. This confirms the anchor is real.

Paste the `/updates` page URL into Google's Rich Results Test. Confirm ItemList schema is valid (no URL mismatch warnings).

- [ ] **Step 4: Commit**

```bash
git add lib/seo/structured-data.ts
git commit -m "fix: use slug anchors in updateItemListSchema instead of identical /updates URL"
```

---

## Task 5: Guard Unverified Schema Claims (Hours + Employees)

**Files:**
- Modify: `lib/seo/structured-data.ts`

**Problem:** Two facts in `buildRealEstateAgentSchema` are unconfirmed by the client:
- `openingHours: "Mo-Su 00:00-23:59"` (claims 24/7)
- `numberOfEmployees: { value: 30 }`

Google's Structured Data Quality Guidelines: schema must not misrepresent the actual content or facts of the business. Incorrect hours are a known cause of LocalBusiness structured data manual actions.

**Strategy:** Replace both with safe, honest placeholders that don't make false claims. Remove `openingHours` entirely (omitting it is valid) and remove `numberOfEmployees` (it is optional). Add `// TODO: confirm with client` comments to make them easy to restore when verified.

- [ ] **Step 1: Remove unverified fields from `buildRealEstateAgentSchema`**

In `lib/seo/structured-data.ts`, find `buildRealEstateAgentSchema` and remove these two fields:

```ts
// REMOVE these two blocks entirely:
openingHours: "Mo-Su 00:00-23:59",
openingHoursSpecification: [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
],
numberOfEmployees: { "@type": "QuantitativeValue", value: 30 },
```

Add a comment block above the function to document what needs to be restored:

```ts
// TODO (client facts needed):
// - openingHours: confirm actual business hours before restoring
//   Format: "Mo-Fr 09:00-18:00" or array of OpeningHoursSpecification
// - numberOfEmployees: confirm exact count from client before restoring
//   Format: { "@type": "QuantitativeValue", value: <confirmed_number> }
export function buildRealEstateAgentSchema() {
```

- [ ] **Step 2: Verify schema is still valid without those fields**

Paste `https://estatebrothers.pk` (or localhost) into Google's Rich Results Test. The RealEstateAgent schema should show as valid — those are optional fields and their absence does not break the schema.

- [ ] **Step 3: Commit**

```bash
git add lib/seo/structured-data.ts
git commit -m "fix: remove unconfirmed openingHours and numberOfEmployees claims from schema"
```

---

## Task 6: Replace Placeholder Body Text in Updates Data

**Files:**
- Modify: `data/updates.ts`

**Problem:** The `body` field of `update-002` (and possibly others) contains internal developer commentary that is crawlable:
> *"This post format can later be connected to published property updates from the admin panel, including thumbnails, videos, and listing links."*

This is thin/placeholder content visible to Google. Per Google's Helpful Content guidelines, pages with content that is "primarily created to rank in search engines" or looks unfinished are scored lower.

**Strategy:** Replace with honest, on-topic copy that describes what the update is actually about. Do not fabricate facts — write copy that is accurate to the demo context (inventory refresh) without developer meta-commentary.

- [ ] **Step 1: Replace placeholder body text in `data/updates.ts`**

Find `update-002` in `data/updates.ts` and replace the `body` field:

```ts
// BEFORE:
body: "This post format can later be connected to published property updates from the admin panel, including thumbnails, videos, and listing links.",

// AFTER (honest, on-topic, no placeholder language):
body: "The current inventory includes a selection of DHA Lahore properties across multiple phases — plots, houses, and commercial files — structured for easy comparison by size, phase, status, and contact person. Reach out to the sales desk for current availability and pricing.",
```

- [ ] **Step 2: Scan remaining updates for other placeholder `body` entries**

Read all entries in `data/updates.ts` and check each `body` field for:
- References to "admin panel", "phase 2", "can later be", "placeholder", "format", "editable feed"
- Replace any found with honest descriptive copy matching the update `title` and `summary`

- [ ] **Step 3: Commit**

```bash
git add data/updates.ts
git commit -m "fix: replace placeholder developer commentary in updates body text"
```

---

## Task 7: Add Verification Token Slots to Root Metadata

**Files:**
- Modify: `app/layout.tsx`

**Problem:** Google Search Console and Bing Webmaster Tools verification requires a `<meta name="google-site-verification" content="...">` tag. There are no verification token placeholders in the metadata. This prevents GSC setup at launch.

**Strategy:** Add environment variable slots to the root layout metadata. Leave them empty in `.env` — they are no-ops when empty. Document in code what to fill in.

- [ ] **Step 1: Add `verification` field to root metadata in `app/layout.tsx`**

Find the `export const metadata: Metadata` block in `app/layout.tsx` and add the `verification` key:

```ts
export const metadata: Metadata = {
  metadataBase: new URL("https://estatebrothers.pk"),
  title: {
    default: "Estate Brothers",
    template: "%s | Estate Brothers",
  },
  description:
    "Buy, sell, and invest in property across Lahore, Karachi, and Islamabad with Estate Brothers - Pakistan's trusted real estate team.",
  alternates: { canonical: "https://estatebrothers.pk" },
  // Verification tokens: set env vars after obtaining from GSC / Bing Webmaster
  // NEXT_PUBLIC_GSC_VERIFICATION=<token from Google Search Console>
  // NEXT_PUBLIC_BING_VERIFICATION=<token from Bing Webmaster Tools>
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION ?? "",
    },
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};
```

- [ ] **Step 2: Add env var placeholders to `.env.local.example` (or create it)**

```bash
# Search Console & Webmaster Verification
# Obtain from: https://search.google.com/search-console
NEXT_PUBLIC_GSC_VERIFICATION=

# Obtain from: https://www.bing.com/webmasters
NEXT_PUBLIC_BING_VERIFICATION=
```

Create this file at the project root if it doesn't exist: `D:\estatebrothers-next\.env.local.example`

- [ ] **Step 3: Verify**

With env vars empty, build and check page source — no verification meta tags should appear (Next.js omits falsy values). Set `NEXT_PUBLIC_GSC_VERIFICATION=test-token-123` and rebuild — `<meta name="google-site-verification" content="test-token-123">` should appear in `<head>`.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx .env.local.example
git commit -m "feat: add GSC and Bing verification token slots via env vars"
```

---

## Task 8: Fix Hardcoded `lastModified` Dates in Sitemap

**Files:**
- Modify: `app/sitemap.ts`

**Problem:** Static routes have `lastModified: "2026-05-15"` hardcoded. These dates go stale immediately after deployment and cannot be trusted by Googlebot to schedule recrawls accurately.

**Strategy:** Use `new Date().toISOString()` for pages that don't have a meaningful content date, or use a build-time constant. For static routes that rarely change, `"monthly"` changeFrequency with a real last-updated date is correct. For this demo phase, using the build date is acceptable and honest.

- [ ] **Step 1: Replace hardcoded dates with build-time dates for static routes**

In `app/sitemap.ts`, at the top of the file add a constant, then update the static routes:

```ts
import type { MetadataRoute } from "next";
import { plotListings, houseListings } from "@/data/inventory";

const SITE_URL = "https://estatebrothers.pk";
// Build-time date — updated each deployment. For static content with infrequent changes.
const BUILD_DATE = new Date().toISOString();

function absoluteImage(path: string) {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: BUILD_DATE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/buy-sell`, lastModified: BUILD_DATE, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: BUILD_DATE, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/updates`, lastModified: BUILD_DATE, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: BUILD_DATE, changeFrequency: "monthly", priority: 0.6 },
  ];
  // ... rest of function unchanged
```

- [ ] **Step 2: Verify sitemap output**

Run `npx next build && npx next start`, visit `http://localhost:3000/sitemap.xml`. Confirm dates are ISO format (e.g., `2026-05-16T10:30:00.000Z`) and not the hardcoded `2026-05-15`.

- [ ] **Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "fix: use build-time date instead of hardcoded lastModified in sitemap"
```

---

## Post-Implementation Verification Checklist

Run these checks after deploying the above changes:

### Technical Verification
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npx next build` — zero build errors
- [ ] View `/about` in Chrome DevTools → Network → Img: CEO image has `Priority: High`
- [ ] View source of any URL (e.g., `/updates`) — `<meta name="robots" content="noindex">` absent (only on `/dashboard` and 404)
- [ ] View source of `/dashboard` — `<meta name="robots" content="noindex,nofollow">` present
- [ ] View source of a 404 URL — `<meta name="robots" content="noindex,nofollow">` present
- [ ] View `/sitemap.xml` — dates are ISO timestamps, no `/dashboard` URL present
- [ ] View `/robots.txt` — `Disallow: /dashboard` present, `Sitemap:` line present

### Schema Verification
- [ ] Run `https://estatebrothers.pk/about` through [Google Rich Results Test](https://search.google.com/test/rich-results) — Person schema shows `jobTitle: "Chief Executive Officer"`
- [ ] Run `https://estatebrothers.pk/updates` through Rich Results Test — ItemList shows distinct `url` values (with `#slug`)
- [ ] Run `https://estatebrothers.pk` through Rich Results Test — Organization and RealEstateAgent schemas valid, no `openingHours` or `numberOfEmployees` warnings

### Google Search Console (After Live Deploy)
- [ ] Add property in GSC for `https://estatebrothers.pk`
- [ ] Set `NEXT_PUBLIC_GSC_VERIFICATION` env var → redeploy → verify ownership in GSC
- [ ] Submit `https://estatebrothers.pk/sitemap.xml` in GSC → Sitemaps section
- [ ] Use URL Inspection tool on `/`, `/about`, `/buy-sell`, `/updates`, `/contact` — all should show as indexable
- [ ] Use URL Inspection on `/dashboard` — should show "URL is not on Google" or blocked by noindex

### PageSpeed / Core Web Vitals
- [ ] Run [PageSpeed Insights](https://pagespeed.web.dev/) on `/` and `/about`
- [ ] LCP on `/about` should improve after Task 1 fix (CEO image priority)
- [ ] Check for any `<link rel="preload">` appearing in page source for above-fold images

---

## Structured Data Decisions (Schema Type Reference)

| Schema Type | Status | Rationale |
|-------------|--------|-----------|
| `Organization` | ✅ Use | Core identity schema — always appropriate |
| `RealEstateAgent` + `LocalBusiness` | ✅ Use | Correct for a physical real estate office |
| `WebSite` | ✅ Use (without SearchAction) | Basic site schema; SearchAction omitted because `/buy-sell?q=` search is not implemented |
| `RealEstateListing` | ✅ Use | Schema.org supports it; price conditionally omitted for "On Call" — correct approach |
| `BreadcrumbList` | ✅ Use | On listing detail pages — valid and appears in SERP breadcrumb display |
| `FAQPage` | ✅ Use | On `/contact` — answers are substantive and real |
| `Person` | ✅ Use | CEO schema on `/about` — valid after Task 2 fix |
| `ItemList` | ✅ Use | On `/buy-sell` and `/updates` — valid container schema |
| `NewsArticle` | ❌ Avoid | Updates do not have individual detail pages — using `NewsArticle` would require a `@id` pointing to a real article URL that doesn't exist |
| `SearchAction` | ❌ Avoid | Not implemented in the site's URL scheme — including it would claim a capability the site doesn't have |

---

## Demo Copy Replacement Guide (For About Page Section Header)

The "CredibilityPosts" section in `/about` contains this visible text that reads as placeholder:

> *"This section is prepared as an editable media feed for MOU images, event posts, success stories, and future company updates."*

**Replace with honest, forward-ready copy that doesn't sound unfinished:**

```tsx
// BEFORE (app/(marketing)/about/page.tsx lines ~185–190):
<p>
  This section is prepared as an editable media feed for MOU images, event posts,
  success stories, and future company updates.
</p>

// AFTER:
<p>
  Selected posts from Estate Brothers&apos; network of property partnerships,
  field activity, and client milestones.
</p>
```

This is honest (it describes what MOU/credibility posts are), doesn't claim content that isn't there, and doesn't sound like developer scaffolding.

**This should be done in the same commit as Task 6** since both are copy quality fixes.
