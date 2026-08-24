# Estate Brothers Admin Dashboard — UI/UX Handoff

## Purpose and scope

This document describes the existing Estate Brothers admin dashboard as implemented. It is a protected content-management dashboard for the public real-estate website. Use it as the source of truth for redesigning the dashboard UI and its information architecture; do not infer additional workflow or data fields without product approval.

The dashboard is desktop-first today, but a redesign should make every table and form usable on a narrow viewport through responsive cards, progressive disclosure, and sticky save actions.

## Global shell

### Access and sign-in

- Route: `/admin/login`
- Fields: email, password.
- States: default, submitting (`Signing in…`), invalid credentials, unavailable auth service, not-approved account.
- Authentication is handled by a server action. Only users approved in `admin_users` as active owners/editors can access `/admin` routes.

### Main application frame

- Fixed/left sidebar brand: `Estate Brothers` + `Admin`.
- Primary navigation: Dashboard, Listings, Updates, Team, Offices, Pages, Site settings.
- Footer actions: `View site` and `Sign out`.
- Admin metadata must remain `noindex`.
- Shared list conventions:
  - Content statuses: `draft`, `review`, `published`, `archived`.
  - Statuses are represented as colored badges.
  - Empty states explain that no records exist and provide the relevant create CTA.
  - Edit views show a back link; destructive actions require confirmation.

## Dashboard

### `/admin`

**Purpose:** A lightweight content overview, not analytics.

**Cards (four):**

| Card | Data shown | Primary actions |
| --- | --- | --- |
| Listings | total, published, draft counts | View all; Add listing |
| Updates | total, published, draft counts | View all; Add update |
| Team members | total, published, draft counts | View all |
| Offices | total, published, draft counts | View all; Add office |

**Supporting message:** Admin access is verified for active owner/editor accounts.

**Data source:** counts `status` values from `real_estate_listings`, `updates`, `team_members`, and `office_locations`.

## Listings

### `/admin/listings` — listing index

**Header:** title, total-record count, `+ Add listing`.

**Table columns:**

1. Title with URL slug below it.
2. Type (`plot` or `house`).
3. Phase and city.
4. Price label.
5. Publication status.
6. Last updated date.
7. Actions: Edit; View live only when published.

### `/admin/listings/new` and `/admin/listings/[id]/edit` — listing editor

**Edit-only context:** record ID, slug, canonical path; View live for published records; Delete listing.

**Form sections and fields:**

| Section | Fields | Notes for design |
| --- | --- | --- |
| Core | Listing type, publication status, availability status, title, slug | Type is a select on create and visually read-only on edit. Slug change must show a persistent 301 redirect warning. |
| Location | Phase, city, block, project | Group into an address/location cluster. |
| Size & price | Size label, area value, area unit, price label, numeric PKR price, listing subtitle/badge | `price_label` is customer-facing; numeric price feeds structured data. |
| House details | Bedrooms, bathrooms | Explicitly optional for plots. |
| Contact & description | Contact person, summary, description | Contact person is selected from team members. |
| SEO metadata | Meta title, meta description | Character guidance: title max 70, description max 180. |
| SEO quality | Score, grade, SERP preview, checklist, boilerplate warnings | Live UI that reacts to form field changes. |
| Media & photos | Multiple uploads, media title, alt text, primary thumbnail toggle, OG-image toggle, external/video URL | Supports images, videos, and PDFs. |

**AI assistance:** `Auto-Fill with AI` reads the listing facts currently entered and fills title, summary, description, meta title, and meta description. It is assistive only; an editor reviews and saves the output.

**Public output:**

- Listed on `/buy-sell` when published and indexable.
- Detail URL: `/buy-sell/{listing_type_slug}/{slug}`.
- Houses can display a gallery, property facts, contact panel, location, features, and sold state.
- Plots display a compact facts table and notes.
- Published record changes can create a permanent redirect when the canonical URL changes.

**Important current implementation note:** The UI exposes `availability` and `contact_person_id`, but the present create/update server actions do not persist either field. The create action also does not persist `noindex`; the edit page exposes it. Treat these as current product/data-contract gaps to resolve before relying on them in a redesign.

## Updates

### `/admin/updates` — update/article index

**Header:** title, total-record count, `+ Add update`.

**Table columns:** title plus slug, update type, publication status, published date, updated date, Edit, and View live for published records.

### `/admin/updates/new` and `/admin/updates/[id]/edit` — update editor

**Edit-only context:** record ID, View live if published, Delete update.

**Form sections and fields:**

| Section | Fields | Notes for design |
| --- | --- | --- |
| Core | Update type, publication status, title, slug, article headline, source, featured toggle, author, article schema type, article section, tags | Types: announcement, Facebook, event, market note, company. Schema types: Article, NewsArticle, BlogPosting. |
| Content | Summary, full body | Summary is used in feed cards and snippets; body is the article detail content. |
| SEO metadata | Meta title, meta description | Same 70/180 guidance as listings. |
| SEO quality | Score, grade, SERP preview, checklist | Publishing requires body, author, and meta description. |
| Links & media | One or more link label/URL/kind rows; uploads; media title; alt text; featured-media and OG toggles; external media URL/title/thumbnail | Link kinds are internal or external. Media supports images, videos, PDFs, YouTube, Facebook, and external images. |

**Public output:**

- Listed in `/updates` when published, indexable, and `has_detail_page` is true.
- Detail URL: `/updates/{slug}`.
- A featured update is given prominence in the public feed.
- Detail pages render article and breadcrumb structured data.
- Changing a canonical URL records a permanent redirect.

## Team

### `/admin/team` — team member index

**Table columns:** name, job title, phone, publication status, sort order, Edit.

### `/admin/team/new` and `/admin/team/[id]/edit` — member editor

| Section | Fields |
| --- | --- |
| Profile | Name, slug, job title, sort order, phone, WhatsApp, email, bio |
| Profile image | Image upload, image URL |
| Publishing | Publication status, `Show publicly on About page` toggle |
| SEO | Meta title, meta description |

**Public output:** Published records with `public_profile = true` appear on `/about`; their name, role, contact details, and image can also be used as listing contacts and Person structured data.

## Offices

### `/admin/offices` — office index

**Table columns:** name, city, status label, publication status, sort order, Edit.

### `/admin/offices/new` and `/admin/offices/[id]/edit` — office editor

| Section | Fields |
| --- | --- |
| Office | Name, slug, status label, sort order, detail |
| Contact | Phone, email |
| Address & map | Address lines 1/2, city, region, postal code, country, latitude, longitude, Google Maps URL |
| Office image | Image upload, image URL |
| Publishing | Publication status |

**Public output:** Published offices appear on `/about` and `/contact`.

## Pages

### `/admin/pages` — CMS page index

**Table columns:** title, route path, status, noindex flag, last updated date, Edit.

**Create route:** `/admin/pages/new`.

**Base page fields:** route path, page key, title, heading, intro, body, hero image URL, status, noindex, meta title, meta description, OG image URL, keywords, publication date.

### `/admin/pages/[id]/edit` — page content workspace

This is the most complex CMS screen. It is a two-column editing workspace:

- **Main column:** page settings followed by independently saved content-section and block editors.
- **Side summary:** route, status, published-section count, block count, SEO readiness, View live, All pages.

**Page settings accordions:**

1. Page identity — route, title, heading, intro, body.
2. Hero image — current image, replacement URL.
3. SEO & publishing — status, noindex, publication date, metadata, OG image, keywords.

**Section editor fields:** eyebrow, heading, subheading, body, status, sort order, image upload/URL.

**Block editor data models:**

| Section key | Block fields as seen by editor | Public use |
| --- | --- | --- |
| `hero-stats`, `testimonial-stats` | Number, unit, label, status, sort order | Homepage statistic strips. |
| `partners` | Logo image, partner name, logo alt text, status, sort order | Homepage partner carousel. |
| `testimonials` | Client name, role/context, quote, image, status, sort order | Homepage rotating testimonial area. |
| Any other section | Title, body, optional link label/URL/kind, icon name, media, attributes JSON, status, sort order | Generic reusable CMS content. |

**Public consumers:**

- `/` reads the home page plus its hero stats, featured-listings copy, partners, testimonials, testimonial stats, and leadership content.
- `/about`, `/contact`, and any future route resolve their page record by `route_path`.
- Only published page/section/block records are rendered publicly; noindex pages are intentionally excluded from public query results and sitemap inclusion.

## Site settings

### `/admin/site`

**Purpose:** One global singleton record; there is no index or create flow.

| Section | Fields |
| --- | --- |
| Business | Business name, legal name, tagline, business description |
| Contact | Phone, WhatsApp, email |
| Address & map | Address lines, city, region, postal code, country, latitude, longitude, Google Maps URL |
| SEO & socials | Default meta title, default meta description, default OG image URL, logo URL, service areas, knows-about topics, Facebook, Instagram, Google verification, Bing verification |

**Public consumers:** Footer, contact page, Organization/RealEstateAgent structured data, global brand copy, contact details, social links, and SEO-related defaults.

## Shared data model

All records have a UUID `id` and database-managed timestamps unless stated otherwise. This is an information-architecture summary, not a replacement for the Supabase schema.

```ts
type ContentStatus = "draft" | "review" | "published" | "archived";

type Listing = {
  id: string;
  listing_type_slug: "plot" | "house";
  slug: string;
  canonical_path: string;
  title: string;
  summary: string | null;
  description: string | null;
  listing_status: string | null;
  availability: "available" | "sold" | "under_offer" | "reserved" | null;
  price_label: string;
  price_numeric: number | null;
  city: string | null;
  phase: string | null;
  project: string | null;
  block: string | null;
  address_line: string | null;
  size_label: string | null;
  area_value: number | null;
  area_unit: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  contact_person_id: string | null;
  thumbnail_url: string | null;
  og_image: string | null;
  features: object;
  attributes: object;
  meta_title: string | null;
  meta_description: string | null;
  status: ContentStatus;
  published_at: string | null;
  noindex: boolean;
  sort_order: number;
};

type Update = {
  id: string;
  slug: string;
  canonical_path: string;
  title: string;
  headline: string | null;
  summary: string | null;
  body: string | null;
  update_type: "announcement" | "facebook" | "event" | "market" | "company";
  source: string;
  author_id: string | null;
  featured: boolean;
  tags: string[];
  article_schema_type: "Article" | "NewsArticle" | "BlogPosting";
  article_section: string | null;
  has_detail_page: boolean;
  meta_title: string | null;
  meta_description: string | null;
  status: ContentStatus;
  published_at: string | null;
  modified_at: string | null;
  noindex: boolean;
};

type TeamMember = {
  id: string; name: string; slug: string; job_title: string | null;
  phone: string | null; whatsapp: string | null; email: string | null;
  bio: string | null; image_media_id: string | null; image_url: string | null;
  public_profile: boolean; sort_order: number; status: ContentStatus;
  meta_title: string | null; meta_description: string | null;
};

type Office = {
  id: string; name: string; slug: string; status_label: string | null;
  detail: string | null; phone: string | null; email: string | null;
  address_line_1: string | null; address_line_2: string | null; city: string | null;
  region: string | null; postal_code: string | null; country_code: string | null;
  latitude: number | null; longitude: number | null; map_url: string | null;
  image_media_id: string | null; sort_order: number; status: ContentStatus;
};

type Page = {
  id: string; page_key: string; route_path: string; title: string;
  heading: string | null; intro: string | null; body: string | null;
  hero_media_id: string | null; og_image: string | null;
  meta_title: string | null; meta_description: string | null; keywords: string[];
  status: ContentStatus; published_at: string | null; noindex: boolean;
};
```

### Supporting related records

- `media_assets`: one canonical media record. Holds source type, media type, storage/external/embed URL, thumbnail, title, alt text, mime type, status, and optional dimensions/duration.
- `listing_media`: joins listing to media with sort order plus primary, gallery-item, and OG-candidate flags.
- `update_media`: joins update to media with sort order plus featured, inline, and OG-candidate flags.
- `update_links`: label, URL, link kind, sort order.
- `content_authors`: author name/profile data used by updates.
- `page_sections`: page child records with key, copy, media, status, and sort order.
- `page_blocks`: section child records with copy, media, link properties, icon name, JSON attributes, status, and sort order.

## Required design states and safeguards

1. Preserve publication state separately from listing availability. A sold property can remain public and indexable.
2. Make SEO warnings actionable, not blocking except for real publish requirements.
3. Show a clear, persistent URL-change warning before save; changed listing/update URLs generate a permanent redirect.
4. Keep media alt text and OG/primary choices close to upload selection.
5. Protect destructive actions with confirmation and communicate that deletion is irreversible.
6. Use visible status and noindex indicators in both lists and edit views.
7. Do not make AI changes automatic: show generated copy as editable form content before the editor saves.
8. In the Page workspace, retain independently saved page, section, and block scopes so accidental edits are contained.
