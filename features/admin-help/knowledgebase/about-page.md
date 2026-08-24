# About Page Admin Guide

## Purpose

The About page is a trust page. It should help visitors understand who Estate Brothers is, where the office operates, what proof supports the business, and how the team works.

For SEO, this page should not be filled with random keywords. It should show real, useful information that a client would want before trusting a real estate agency.

## Current production-intent sections

### Proof stats

Use this for short trust numbers such as years in business, office location, team size, and support culture.

Fields:

- Block title: the short number or label, for example `10+`, `44-A`, `30+`, `24/7`.
- Body: what the number means, for example `Years in real estate`.
- Sort order: controls display order.
- Status: only `published` appears on the public page.

SEO rule: Only publish numbers that are true and client-approved. If `30+` or `24/7` changes, update it immediately.

### Awards and recognition

Use this for certificates, registrations, memberships, awards, and partner recognitions.

Fields:

- Award / certificate title: the exact visible name, for example `Company registration certificate`.
- Visible description: a plain explanation of what the proof means.
- Category label: short label shown over the image, for example `REGISTRATION`, `MEMBERSHIP`, `AWARD`.
- Issuer / source: who issued it, for example `Estate Brothers`, `Rafi Group`, `Al Kabir Group`.
- Media: upload the real certificate/award image.
- Alt text: describe the image, for example `Company registration certificate for Estate Brothers`.
- Status: only `published` appears publicly.

SEO rule: The page should show the same claims to users that are included in structured data. Do not add awards that cannot be shown visually or explained clearly.

### Service pillars

Use this to explain what Estate Brothers actually does.

Current pillars:

- Property Services
- Investment Services
- Client Representation

Fields:

- Title: service name.
- Body: one useful sentence explaining the service.
- Sort order: controls order.

SEO rule: Keep each service specific. Avoid generic lines like `best property deals`.

### Team stories

Use this for team videos, leadership notes, or role-based explanations. It can render without real videos, but video SEO only applies after a real video URL and thumbnail are attached.

Fields:

- Story title: visible story name.
- Visible summary: what the story explains.
- Story code / duration: short code or duration, for example `TH` or `02:40`.
- Person or team: who the story belongs to.
- Video URL / embed URL: only add when the real video is ready.
- Media: thumbnail or poster image.
- Advanced JSON: optional technical fields such as `storyCode`, `duration`, `durationIso`, `uploadDate`, `role`.

SEO rule: Do not add VideoObject structured data unless there is a real video URL.

### Operating model

Use this to explain how Estate Brothers works with clients.

Fields:

- Title: internal label for admin clarity.
- Body: the visible operating point.
- Sort order: controls numbering.

SEO rule: This section should build confidence by explaining process, checks, documentation, and communication.

### Branch support panel

Use this for final office/support confidence messaging.

Fields:

- Heading: main branch/support headline.
- Blocks: short visible support lines.

SEO rule: Keep office claims accurate and consistent with the office/location data.

## What not to publish

- Test offices or fake locations.
- Unverified awards.
- Keyword-stuffed text.
- Claims like `No. 1` unless documented.
- Videos without real URLs if expecting video SEO.
- Images with empty or vague alt text.

## Admin workflow

1. Edit the page heading and meta fields first.
2. Edit each section separately.
3. Edit each block separately.
4. Keep unfinished content as `draft` or `review`.
5. Use `published` only when the content is true, complete, and client-approved.
6. Check the public About page after saving.
