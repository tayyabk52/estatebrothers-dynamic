# Media Guidelines

## Purpose

Media should support trust and usability. For Estate Brothers, media includes listing images, office images, team photos, certificates, awards, thumbnails, and videos.

## Storage

Production media should be uploaded to Supabase Storage and linked through `media_assets`.

Do not rely permanently on old static-site hashed asset URLs because the static site will be replaced.

## Image fields

- Title: internal/media title.
- Alt text: describes the image for accessibility and search.
- Caption: optional visible explanation.
- Public URL: the URL used by the website.
- Status: published media can be shown publicly.

## Good alt text

Alt text should describe what the image shows.

Examples:

- `Main DHA Office exterior for Estate Brothers`
- `Rafi Group recognition award for Estate Brothers`
- `Company registration certificate for Estate Brothers`

## Bad alt text

- `image`
- `award`
- `best property dealer`
- empty text for important images

## Videos

For video SEO, a story should have:

- title
- description
- thumbnail
- video URL or embed URL
- upload date if available
- duration if available

Without a real video URL, the site may show a story card but should not emit VideoObject structured data.
