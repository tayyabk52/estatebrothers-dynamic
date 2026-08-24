# Pages Editor Technical Guide

## Purpose

The Pages editor manages public CMS pages through Supabase tables:

- `pages`
- `page_sections`
- `page_blocks`
- `media_assets`

The About page uses the same CMS model as other editable pages, but it has special section renderers for richer layouts.

## Page fields

- Route path: the public URL, such as `/about`.
- Page key: internal stable key, such as `about`.
- Title: short admin/public page label.
- Main heading: the main H1 or page hero heading.
- Intro text: short page introduction.
- Body note: optional page-level note.
- Hero image: primary page image.
- Status: controls whether the page can be publicly served.
- noindex: tells search engines not to index the page.
- Meta title: browser/search title.
- Meta description: search snippet candidate.
- OG image URL: social preview image.
- Keywords: internal metadata support, not a place for keyword stuffing.

## Section fields

- Section type: controls public layout.
- Eyebrow: small label above the heading.
- Heading: section H2.
- Intro / subheading: supporting section text.
- Body: fallback text or section description.
- Upload image / Image URL: optional section media.
- Status: only published sections render publicly.
- Sort order: lower numbers appear first.

## Block fields

Blocks are the cards, rows, stats, or story items inside a section.

Common fields:

- Block key: stable internal key.
- Title: visible title or stat value.
- Body: visible description.
- Media: optional image/video/document.
- Status: only published blocks render publicly.
- Sort order: lower numbers appear first.

## About-specific section keys

- `about-proof`: proof stat strip.
- `awards-recognition`: award/certificate cards.
- `services`: service pillar grid.
- `team-stories`: team story/video cards.
- `operating-model`: numbered operating rows.
- `branches-support`: final branch/support panel.

## Technical behavior

Public renderers read published sections/blocks from Supabase. Unknown section types still render through a generic fallback, so adding a new section type will not crash the public page.

Server Actions require admin authorization before creating or updating page content.

Cache invalidation should revalidate `all-pages`, `page-/about`, `/about`, `/sitemap.xml`, and `/admin/pages`.
