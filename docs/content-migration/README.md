# Static site content migration

Source: `https://www.estatebrothers.pk/`  
Target CMS: Supabase project `zucpsqjiaexxxobzwodd`  
Migration date: 2026-09-05

## Applied content

- Replaced seven demo listings with the 15 plots published on the original site.
- Preserved original prices, payment schedules, terms, source URLs, and 24 May 2026 source dates.
- Added redirects from the original plural listing paths to the dynamic singular listing paths.
- Added the original company registrations, memberships, and awards as nine published updates.
- Replaced demo homepage, About, Contact, project, office, testimonial-label, and SEO-landing copy.
- Added the 11 named original team members and matched all portraits by name and source filename.
- Added the original main-office photo, 13 gallery images, four project covers, eight available partner logos, and retained the nine original award images already uploaded.
- Kept all 15 listings image-free because their original detail pages do not publish property images.

## Media integrity

`original-media-manifest.json` records the source URL, byte size, and SHA-256 digest for each of the 38 downloaded source images. The files are retained under `original-media/`. Supabase `media_assets` rows include the MIME type, byte size, width, height, descriptive alt text, and stable Storage path.

The original site does not expose a Partner 05 image; that demo partner block was archived rather than displaying an invented logo.

## Recovery and audit files

- `.content-migration-backup/before-2026-09-05.json` is the ignored pre-change database snapshot.
- `content-replacement.sql` is the main executed transaction.
- `content-follow-up.sql`, `media-relationships.sql`, and `media-dimensions.sql` record the executed follow-up changes.
- `static-site-inventory.json` and `static-listings.json` contain the captured source audit.

The temporary authenticated Edge Function used to bridge the local Supabase TLS failure was redeployed as an inert HTTP 410 response after upload completion.
