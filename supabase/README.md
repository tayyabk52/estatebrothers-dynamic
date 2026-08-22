# Estate Brothers Supabase Schema

The first migration, `migrations/20260517_media_aware_seo_schema.sql`, creates a media-aware content model for the public SEO site and future admin dashboard.

## Media Model

- `media_assets` is the source of truth for uploaded files, YouTube/Facebook embeds, external media, thumbnails, captions, dimensions, and video duration.
- `listing_media` attaches media to `real_estate_listings`.
- `update_media` attaches media to `updates`.
- `is_og_candidate` is only valid for image media; a trigger rejects non-image OG candidates.
- `og_image` fields on listings, updates, team members, SEO pages, and site settings should point to a real image URL. Do not use YouTube/Facebook embed URLs as OG images.

## Storage Buckets

The migration creates these public buckets:

- `listing-media`
- `update-media`
- `site-assets`

Recommended paths:

```text
listing-media/{listing_id}/images/{filename}
listing-media/{listing_id}/videos/{filename}
listing-media/{listing_id}/documents/{filename}

update-media/{update_id}/images/{filename}
update-media/{update_id}/videos/{filename}

site-assets/brand/{filename}
site-assets/og/{filename}
```

Draft rows are hidden from public database reads with RLS. Because the buckets are public for CDN-friendly delivery, the application must not render draft media URLs on public pages.

## SEO Rules

- Current public pages (`/`, `/about`, `/contact`, and other static marketing routes) use `pages`, `page_sections`, and `page_blocks` for editable SEO-safe content.
- Contact/general FAQs use `faqs`, which can feed FAQPage JSON-LD when attached to a published page.
- Office/branch content uses `office_locations`, which can feed LocalBusiness/location content once client facts are confirmed.
- Team cards and future member profile pages use `team_members`; `has_profile_page = true` requires canonical path and metadata.
- Public listing pages should query only `status = 'published'`, `noindex = false`, and `published_at <= now()`.
- `/buy-sell/[listingType]/[slug]` maps to `real_estate_listings.listing_type_slug + slug`.
- `/updates/[slug]` maps to published `updates` rows. Published updates require body copy, author, metadata, `published_at`, and `has_detail_page = true` so Article/NewsArticle JSON-LD has a real canonical URL.
- `/updates` should list published updates and link to their `canonical_path`.
- Competitive real estate landing pages use `seo_landing_pages` for area/category pages such as `/areas/dha-lahore` or `/buy-sell/plots-for-sale-dha-lahore`.
- Random filtered/search URLs should be controlled by `seo_url_rules`; only curated landing pages should be indexable.
- JSON-LD for listings should use primary/gallery image media, numeric price fields, address fields, coordinates, and contact person data.
- JSON-LD for updates should use `article_schema_type`, `headline` or `title`, author, date fields, hero/OG image media, and `canonical_path`.
- LocalBusiness JSON-LD should use `site_settings` for NAP, socials, coordinates, service areas, map URL, and confirmed opening hours.

## Page Content Model

- `pages` stores route-level SEO metadata and the main page copy.
- `page_sections` stores ordered sections such as homepage hero, about proof, offices, team, services, and contact intro.
- `page_blocks` stores repeatable cards/items inside sections, such as stats, service pillars, credibility cards, contact methods, or CTA links.
- Specific future modules can still be split into dedicated tables later if client data proves they need stricter structure.

## Verification Notes

- Storage video limits, transformations, and CDN behavior require verification in the Supabase Dashboard before allowing large uploaded videos.
- First admin user must be inserted via SQL editor, migration seed, or a trusted backend using the service role key.
- `search_document` columns are indexed but intentionally plain `tsvector` columns. Populate them from the admin application or add a later trigger migration after final searchable fields are confirmed.
