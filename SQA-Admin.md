A. Executive summary

Verdict: Not ready — important fixes required.

The admin dashboard is broadly functional and well protected at the authentication/RLS layer, but the audit found several confirmed admin-to-database mapping defects and media/admin UX gaps that should be fixed before client handoff.

No code, schema, storage policy, database data, or content was changed during this audit.

Critical findings:

- No P0 critical security/destructive-data issue was confirmed.
- P1 confirmed defects exist in listing admin and site settings:
  - Listing `availability` field is shown in create/edit forms but is not saved.
  - Listing `contact_person_id` field is shown in create/edit forms but is not saved.
  - Site settings action reads `linkedin`, `youtube`, and `price_range`, but the form does not expose those fields; saving can overwrite existing values with blanks/defaults.
- Several P2 issues affect admin media management, previews, cache precision, and manual QA confidence.

High-risk areas:

- Listing admin field mapping.
- Site settings hidden-field overwrite behavior.
- Media management removal/replacement UX.
- Authenticated browser QA not conclusively verified.
- Some public rendering still uses raw `next/image` for admin media instead of the safer media wrapper.

B. Page-by-page audit

| Route | Status | Supabase integration | Media status | SEO status | Issues |
| --- | --- | --- | --- | --- | --- |
| `/admin/login` | Working basic render | Uses Server Action `loginAdmin`; Supabase `signInWithPassword`; RPC `is_admin` | N/A | `robots: noindex` inherited | Login is inside `/admin` layout shell; visual/authenticated browser QA not conclusively verified |
| `/admin` | Working read-only dashboard | Reads `real_estate_listings`, `updates`, `team_members`, `office_locations` | N/A | N/A | Counts only total/published/draft; review/archived omitted |
| `/admin/listings` | Working list | `getAllListingsAdmin()` reads `real_estate_listings` | Does not show media presence | Shows status/live link | Working |
| `/admin/listings/new` | Partially wired | Inserts `real_estate_listings`; inserts `listing_media` | Upload works through `listing-media` bucket | Requires meta description before publish | `availability` and `contact_person_id` inputs not saved |
| `/admin/listings/[id]/edit` | Partially wired | Updates `real_estate_listings`; inserts new `listing_media`; deletes listing | Existing media is not listed/removable; new uploads append only | Redirect recorded on slug/path change | `availability` and `contact_person_id` not saved; SEO widget media state can be wrong |
| `/admin/updates` | Working list | `getAllUpdatesAdmin()` reads `updates` | Does not show media presence | Shows status/live link | Working |
| `/admin/updates/new` | Mostly wired | Inserts `updates`, `update_links`, `update_media` | Upload works through `update-media` | Requires body/meta/author before publish | No current media preview/removal relevant on create; keywords column not exposed |
| `/admin/updates/[id]/edit` | Mostly wired | Updates `updates`; deletes/reinserts links; appends media | Existing media not displayed/removable | Redirect recorded on slug/path change | Media management is append-only; update keywords column not exposed |
| `/admin/team` | Working list | Reads `team_members` | Does not show image thumbnails | N/A | Working |
| `/admin/team/new` | Mostly wired | Inserts `team_members`; optional media asset | Upload/external image works | Meta fields saved | Profile-page fields in schema are not exposed |
| `/admin/team/[id]/edit` | Mostly wired | Updates/deletes `team_members` | Existing image URL preserved but no image preview/removal | Meta fields saved | Cannot manage `has_profile_page`, `profile_body`, `profile_summary`, `canonical_path`, OG image |
| `/admin/offices` | Working list | Reads `office_locations` | Does not show image thumbnails | N/A | Working |
| `/admin/offices/new` | Mostly wired | Inserts `office_locations`; optional media asset | Upload/external image works | N/A | Working, but no graceful server-action error UI |
| `/admin/offices/[id]/edit` | Mostly wired | Updates/deletes `office_locations` | Existing image preserved via hidden field; no remove control | N/A | Cannot remove existing image intentionally |
| `/admin/pages` | Working list | Reads `pages` | Does not show media | Shows status/noindex | Working |
| `/admin/pages/new` | Mostly wired | Inserts `pages` | External hero URL creates media asset | Meta required before publish | No upload UI on base `PageForm`; `og_media_id` not managed |
| `/admin/pages/[id]/edit` | Powerful but partial | Updates `pages`, `page_sections`, `page_blocks` | Section/block uploads work; existing media preserved | Page meta/noindex saved | No route-change redirect; no media removal; `og_media_id` unused/unmanaged |
| `/admin/seo-landing-pages` | Working list | Reads `seo_landing_pages`; computes matches from published listings | Shows no thumbnails | Shows noindex/indexable/public links | Working |
| `/admin/seo-landing-pages/new` | Mostly wired | Inserts `seo_landing_pages`; optional hero/OG media | Upload/external media works via `site-assets` | Strong publish/indexable validation | Good, but errors throw rather than inline UI |
| `/admin/seo-landing-pages/[id]/edit` | Mostly wired | Updates/deletes `seo_landing_pages`; redirects on path change | Hero/OG preview, preserve, remove logic present | Noindex/sitemap/promoted links correctly wired | Best-integrated admin area |
| `/admin/site` | Partially wired | Upserts singleton `site_settings` | URL-only logo/default OG fields | Global SEO/NAP saved | Hidden overwrite risk: `linkedin`, `youtube`, `price_range` action fields not present in form |

C. Field mapping audit — incorrect/suspicious/missing mappings

Confirmed defects:

| Field | UI location | DB column intended | Finding |
| --- | --- | --- | --- |
| `availability` | Listing create/edit | `real_estate_listings.availability` | Input exists but create/update actions never write it |
| `contact_person_id` | Listing create/edit | `real_estate_listings.contact_person_id` | Input exists but create/update actions never write it |
| `linkedin` | Site settings action | `site_settings.social_links.linkedin` | Action reads it, form does not expose it; save can blank it |
| `youtube` | Site settings action | `site_settings.social_links.youtube` | Action reads it, form does not expose it; save can blank it |
| `price_range` | Site settings action/schema | `site_settings.price_range` | Action reads it, form does not expose it; save forces default `PKR` |
| Listing media state in SEO widget | Listing edit | `listing_media` relationship | Widget checks only `thumbnail_url`/`og_image`, not relation media |
| Update/page/listing keywords | Several schemas | `keywords` | Listings do not expose keywords; updates use `tags` but not `keywords` |
| Page `og_media_id` | Pages schema | `pages.og_media_id` | FK exists but admin/public path uses `og_image` URL instead |
| Team profile fields | Team schema | `has_profile_page`, `profile_body`, `profile_summary`, `canonical_path` | DB supports them; admin does not manage them |

Working mappings verified:

- SEO landing page fields map cleanly: slug, canonical path, title, heading, intro, body, filters, listing type, city, phase, neighborhood, listing status, meta title, meta description, keywords, status, noindex, publish date, public-placement flags, hero media, OG media.
- Updates core article fields map correctly: title, slug, summary, body, author, article schema type, article section, status, featured, noindex, tags, links, media append.
- Page sections/blocks map to their respective tables and preserve existing media IDs.
- Team/offices basic profile/contact/address/status fields map correctly.

D. Supabase integration findings

Live Supabase project verified:

- Project: `estatebrother`
- Project ref: `zucpsqjiaexxxobzwodd`
- Database: PostgreSQL 17.6

Live row counts:

| Table | Rows |
| --- | ---: |
| `admin_users` | 2 |
| `real_estate_listings` | 7 |
| `listing_media` | 8 |
| `updates` | 5 |
| `update_links` | 4 |
| `update_media` | 4 |
| `team_members` | 9 |
| `office_locations` | 2 |
| `pages` | 3 |
| `page_sections` | 8 |
| `page_blocks` | 25 |
| `seo_landing_pages` | 1 |
| `site_settings` | 1 |
| `media_assets` | 20 |

Live anomaly checks passed:

- Duplicate listing slugs: 0
- Duplicate update slugs: 0
- Duplicate page routes: 0
- Duplicate SEO landing canonical paths: 0
- Listing media orphans: 0
- Update media orphans: 0
- SEO landing missing media references: 0
- Published listings missing meta descriptions: 0
- Published updates missing author/body/meta: 0
- Indexable SEO landing pages with short body: 0

RLS/security:

- RLS is enabled on admin-managed public tables.
- Admin policies use `is_admin()`.
- `is_admin()` is `SECURITY DEFINER`, stable, `search_path=public`, and returns true only for active `owner` or `editor`.
- Storage policies restrict upload/update/delete to admins for managed buckets.
- Public read policies exist for published content/media.

E. Media pipeline findings

Buckets verified:

| Bucket | Public | Size limit | MIME types |
| --- | --- | ---: | --- |
| `listing-media` | true | 15 MB | jpg/png/webp/avif/mp4/webm/pdf |
| `update-media` | true | 15 MB | jpg/png/webp/avif/mp4/webm/pdf |
| `site-assets` | true | 5 MB | jpg/png/webp/avif/svg |

Working:

- Upload helper writes to Supabase Storage, then creates `media_assets`.
- Listing uploads create `listing_media`.
- Update uploads create `update_media`.
- SEO landing hero/OG upload links directly to `seo_landing_pages.hero_media_id` / `og_media_id`.
- Page section/block uploads preserve existing media IDs.
- Live DB has no media relationship orphans.

Issues:

- P2: Upload success followed by `media_assets` insert failure can leave orphaned storage objects.
- P2: Most server actions throw raw errors; admins do not get inline recovery messages.
- P2: Listing/update existing media is not displayed as a manageable list in edit forms.
- P2: Listing/update media cannot be removed/reordered/reassigned from admin.
- P2: External media URLs are trusted server-side without robust URL validation.
- P2: Multiple listing media rows can be marked primary/OG candidate; no uniqueness enforcement was verified.
- P2: Updates public components still use raw `next/image`; current DB URLs are allowed, but arbitrary future external URLs can break rendering unless wrapped safely.

F. SEO integration findings

Working:

- Admin layout sets `robots: noindex, nofollow`.
- `robots.txt` disallows `/admin/`, `/dashboard`, and `/api/`.
- Metadata builder uses absolute production canonical URLs.
- Root title avoids duplicate `Estate Brothers | Estate Brothers`.
- Listing/update/SEO landing slug changes record redirects.
- SEO landing noindex pages remain accessible but are excluded from sitemap/promoted links.
- SEO landing public placement only reads `status='published'` and `noindex=false`.
- Sitemap excludes noindex SEO landing pages.
- Structured data covers Organization, RealEstateAgent, WebSite, RealEstateListing, Article, BreadcrumbList, ItemList.
- Sold listing availability maps to `https://schema.org/SoldOut`.

Issues/risks:

- P1/P2: Listing `availability` not saved, so sold/under-offer state cannot reliably drive visible labels or schema.
- P2: Page route changes do not create redirects.
- P2: Listing/update/page create/update actions do not explicitly revalidate `/sitemap.xml`; cache tags may cover it indirectly, but this is not as clear as SEO landing.
- P2: SEO Quality Widget can report incorrect media status for listings because it ignores `listing_media`.
- P3: Schema has `seo_pages` and `seo_url_rules`, but no admin UI for them was found.
- P3: Some source text appears mojibake-corrupted for arrows/bullets, e.g. `â†’`, `Â·`; this is UI polish/encoding debt.

G. Authentication/security findings

Working:

- Login mutation is a Server Action.
- Login validates credentials, signs in via Supabase SSR client, calls `is_admin`, signs out non-admin users.
- Proxy uses `getClaims()` and redirects unauthenticated `/admin/*` to `/admin/login`.
- Proxy checks `is_admin()` for authenticated admin routes.
- Server Actions for mutations call `assertAdmin()`.
- AI generator calls `requireAdmin()`.
- Logout is a Server Action.

Risks:

- P2: Some admin pages rely on proxy/layout rather than direct page-level `requireAdmin()`; mutations are protected, but page access consistency should be tightened.
- Manual verification required: non-admin authenticated browser behavior and logout UX.

H. Cache invalidation findings

Working:

- Listings: `all-listings`, listing tag, `/admin/listings`, `/buy-sell`.
- Updates: `updates`, update tag, `/admin/updates`, `/updates`.
- Pages: `all-pages`, page tag, route path, `/admin/pages`.
- Team: `team`, `/`, `/about`, `/admin/team`.
- Offices: `offices`, `/about`, `/contact`, `/admin/offices`.
- SEO landing: strong coverage including old/new paths, sitemap, home, buy/sell, admin list.
- Revalidate API maps table names to cache tags and requires `SUPABASE_WEBHOOK_SECRET`.

Issues:

- P2: Listing/update/page mutations do not explicitly revalidate `/sitemap.xml`.
- P2: Listing delete does not revalidate the deleted detail path.
- P2: Update update action does not revalidate the new detail path directly after edit; it relies on tags/collection paths.
- P2: Page route changes do not revalidate old route or record redirect.

I. Responsive/admin UI findings

Working by code/static/runtime:

- Admin shell has desktop sidebar, collapsed mode, mobile bar/sheet.
- Active link logic uses `pathname`.
- Runtime smoke confirmed `/admin/login` returns 200 and contains login form.
- Runtime smoke confirmed unauthenticated `/admin` returns 307.

Not conclusively verified:

- Authenticated admin dashboard visual QA.
- Collapsed sidebar behavior in a real browser.
- Mobile drawer interactions.
- Media previews inside authenticated edit forms.
- Browser console hydration warnings.

Potential UI issues:

- Login route appears inside admin layout shell because `/admin/layout.tsx` wraps all admin routes including login.
- Several labels contain mojibake symbols.
- Listing/update edit forms do not show existing media inventory, which can mislead admins.

J. Automated validation results

Commands run:

| Command | Result |
| --- | --- |
| `npx.cmd tsc --noEmit` | Passed |
| `npm.cmd run test:seo` | Passed, 20/20 |
| `git diff --check` | Passed with CRLF warnings only |
| `npm.cmd run build` | Passed |

Build warnings:

- Custom Cache-Control header warning for `/_next/static/:path*`.
- Four `useSearchParams()` client-side-rendering bailout warnings from ignored frames.

Package scripts:

- `dev`
- `build`
- `start`
- `test:seo`

No lint script exists.

Runtime checks:

| Check | Result |
| --- | --- |
| `http://localhost:3000/admin/login` | 200, login form present |
| `http://localhost:3000/admin` unauthenticated | 307 redirect behavior |

K. Manual QA still required

Not conclusively verified:

- Authenticated login with real admin account.
- Non-admin authenticated redirect behavior.
- Logout from authenticated admin shell.
- Create/edit/delete flows in browser for all entities.
- Media upload, preview, replace, remove behavior through actual browser forms.
- AI generator with real `GEMINI_API_KEY`.
- SEO widget recalculation in browser after AI-generated DOM population.
- Mobile admin drawer and collapsed sidebar visual behavior.
- Browser console errors/hydration warnings on authenticated pages.
- Actual Vercel deployment runtime behavior.

L. Prioritized defect register

| ID | Severity | Area | Route/File | Problem | Evidence | User impact | Recommended fix |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ADM-001 | P1 | Listings | `app/admin/listings/actions.ts` | `availability` field is displayed but never saved | Form has `name="availability"`; create/update payloads omit it | Sold/reserved/under-offer state cannot be managed reliably; schema/labels can be wrong | Save `availability` in create/update |
| ADM-002 | P1 | Listings | `app/admin/listings/actions.ts` | `contact_person_id` field is displayed but never saved | Form has `name="contact_person_id"`; payloads omit it | Listings fall back to default agent; wrong contact shown publicly | Save `contact_person_id` in create/update |
| ADM-003 | P1 | Site settings | `app/admin/site/actions.ts`, `app/admin/site/page.tsx` | Action reads `linkedin`, `youtube`, `price_range`; form does not expose them | Form lacks inputs; action writes blanks/default | Existing social/price data can be lost on save | Add fields or preserve existing values |
| ADM-004 | P2 | Listing media | `app/admin/listings/[id]/edit/page.tsx` | Existing listing media is not displayed/manageable | Edit form only includes upload component | Admin cannot remove/reorder/confirm images | Add media management list |
| ADM-005 | P2 | Update media | `app/admin/updates/[id]/edit/page.tsx` | Existing update media is not displayed/manageable | Edit form only appends new media | Admin cannot remove/change featured/OG media | Add media management list |
| ADM-006 | P2 | SEO widget | `components/admin/SeoQualityWidget.tsx`, listing edit page | Listing media score can be wrong | Initial data checks only `thumbnail_url`/`og_image`, not `listing_media` | Misleading SEO score | Load relation media or pass actual media state |
| ADM-007 | P2 | Pages SEO | `app/admin/pages/actions.ts` | Page route changes do not create redirects | Update path writes new `route_path`; no `recordRedirect` | Old URLs can 404 after route change | Record redirect from old route |
| ADM-008 | P2 | Media upload | `lib/admin/media.ts` | Storage upload can succeed while DB insert fails | Upload occurs before media row insert | Orphan storage files possible | Add cleanup or transactional compensation |
| ADM-009 | P2 | Error UX | Admin Server Actions | Raw thrown errors instead of inline state | Actions throw `Error(...)` | Admin sees generic error boundary | Use action state/error messages |
| ADM-010 | P2 | Public update images | `components/pages/UpdatesClient.tsx`, update detail | Uses raw `next/image` for admin media | `<Image src={update.media.url}>`; arbitrary externals possible | Future external URLs may break rendering | Use `SafeMediaImage` |
| ADM-011 | P2 | Admin auth UX | `/admin/login` | Login appears under admin layout shell | `/admin/layout.tsx` wraps all admin routes | Confusing login UI/navigation | Split login layout or conditionally hide shell |
| ADM-012 | P2 | Cache/SEO | Listing/update/page actions | Sitemap not explicitly revalidated | Actions omit `revalidatePath("/sitemap.xml")` | Sitemap may be stale depending cache behavior | Add explicit sitemap revalidation |
| ADM-013 | P3 | Team | `TeamForm`, schema | Profile-page fields not manageable | Schema has profile fields; form lacks them | Unused future functionality | Add or remove/ignore intentionally |
| ADM-014 | P3 | Pages | `pages.og_media_id` | FK exists but admin/public uses URL field | Admin has `og_image`, no media FK control | Inconsistent media model | Align pages with media asset model |
| ADM-015 | P3 | Encoding/UI | Multiple files | Mojibake symbols in UI text | `â†’`, `Â·` seen in source/output | Unpolished admin/public labels | Normalize file encoding/text |

M. Verified working functionality

- Supabase MCP access works.
- Live schema and RLS policies were read successfully.
- Admin-managed storage buckets exist and are public with size/MIME restrictions.
- Admin mutation Server Actions are protected with `assertAdmin()` except login/logout as expected.
- Login Server Action follows server-side auth pattern.
- `is_admin()` is correctly limited to active owner/editor roles.
- SEO landing admin-to-public pipeline is the strongest area:
  - media FKs;
  - noindex;
  - canonical path;
  - clean route;
  - fallback route;
  - sitemap exclusion;
  - promoted links;
  - listing matching.
- Live database has no duplicate slugs/paths detected.
- Live database has no media relationship orphans detected.
- Build/type/tests pass.
- Unauthenticated admin redirect works.

N. Final readiness verdict

Not ready — important fixes required.

Reason:

The dashboard is structurally solid and secure enough to continue development, but it is not ready for final client handoff because confirmed P1 field-mapping defects would cause admins to believe they changed listing availability/contact ownership when the database was not updated. The site settings form also has a real hidden-overwrite risk. These are production administration correctness issues, not cosmetic problems.

After fixing the P1 defects and the main P2 media-management/QA gaps, it can move to authenticated browser QA and then client handoff.

O. Implementation progress log — 2026-08-23 admin SQA fix pass

This section records the fixes implemented after the audit above. It does not rewrite the original audit evidence; it marks what has changed since that snapshot.

| Issue | Status after fix pass | Files changed | Verification |
| --- | --- | --- | --- |
| ADM-001 | Fixed. Listing create/update now saves `availability` independently from publication `status`. | `app/admin/listings/actions.ts` | `npx.cmd tsc --noEmit`, `npm.cmd run test:seo`, `npm.cmd run build`, `git diff --check` passed. |
| ADM-002 | Fixed. Listing create/update now saves `contact_person_id`; empty selection is normalized to `null`. | `app/admin/listings/actions.ts` | Same validation passed. Browser re-edit QA still recommended. |
| ADM-003 | Fixed. Site settings now exposes `price_range`, `linkedin`, and `youtube`, and the save action preserves existing social keys if a field is not submitted. | `app/admin/site/page.tsx`, `app/admin/site/actions.ts` | Same validation passed. |
| ADM-004 | Fixed for core management. Listing edit now loads existing `listing_media → media_assets`, shows attached media, allows title/alt/sort/gallery/primary/OG updates, and allows relation-only removal. | `lib/db/listings.ts`, `app/admin/listings/[id]/edit/page.tsx`, `app/admin/listings/actions.ts`, `components/admin/ExistingMediaManager.tsx`, `styles/admin.css` | Same validation passed. Authenticated browser media QA still recommended. |
| ADM-005 | Fixed for core management. Update edit now loads existing `update_media → media_assets`, shows attached media, allows title/alt/sort/featured/OG updates, and allows relation-only removal. | `lib/db/updates.ts`, `app/admin/updates/[id]/edit/page.tsx`, `app/admin/updates/actions.ts`, `components/admin/ExistingMediaManager.tsx`, `styles/admin.css` | Same validation passed. Authenticated browser media QA still recommended. |
| ADM-006 | Fixed. Listing/update SEO widget initial media state now accounts for existing relational media instead of only legacy URL fields. | `app/admin/listings/[id]/edit/page.tsx`, `app/admin/updates/[id]/edit/page.tsx` | Same validation passed. |
| ADM-007 | Fixed. Page route changes now create a 301 redirect from the old route to the new route and revalidate the old/new page caches. | `app/admin/pages/actions.ts` | Same validation passed. |
| ADM-008 | Fixed. Uploaded storage objects are now best-effort removed if the subsequent `media_assets` insert fails. | `lib/admin/media.ts` | Same validation passed. |
| ADM-010 | Fixed. Public updates feed and update detail now render admin-managed media through `SafeMediaImage`. | `components/pages/UpdatesClient.tsx`, `app/(marketing)/updates/[slug]/page.tsx` | Same validation passed. |
| ADM-011 | Fixed. `/admin/login` is now rendered without the authenticated admin shell chrome. | `components/admin/AdminShellChrome.tsx` | Same validation passed. Browser login QA still recommended. |
| ADM-012 | Fixed for affected admin mutations. Listing, update, page, page-section, page-block, and site-settings changes now explicitly revalidate `/sitemap.xml` where metadata/indexable content can change. | `app/admin/listings/actions.ts`, `app/admin/updates/actions.ts`, `app/admin/pages/actions.ts`, `app/admin/site/actions.ts` | Same validation passed. |
| ADM-009 | Still open. Broad conversion of admin Server Actions to inline `useActionState` error handling was not included in this pass because it affects nearly every admin form and should be done as a separate UX-safe refactor. | Admin Server Actions | Not blocking the data correctness fixes, but still recommended before final client handoff. |
| ADM-013 | Still intentionally deferred. Team profile fields remain a product decision because no verified public team-profile route was established in this fix pass. | Team admin/public profile system | Not a blocker for current public pages. |
| ADM-014 | Still intentionally deferred. Page `og_media_id` alignment remains a media-model cleanup item; existing public page OG URL behavior was not changed to avoid SEO regression. | Pages metadata/media model | Not a blocker while existing `og_image` URL behavior remains functional. |
| ADM-015 | Partially addressed. Focused scan of edited/admin files did not find remaining mojibake matches after this pass; unrelated historical text was not broadly rewritten. | Edited admin/public files | Focused `rg` scan returned no matches; full-site copy QA still recommended. |

Validation results for this fix pass:

- `npx.cmd tsc --noEmit` passed.
- `npm.cmd run test:seo` passed: 20/20 tests.
- `npm.cmd run build` passed.
- `git diff --check` passed with Windows CRLF warnings only.

Remaining verification required:

- Authenticated browser QA for listing/update media management, site settings save, listing availability/contact save/reload, and login shell rendering.
- Production/Vercel runtime QA.
- Separate ADM-009 inline form-error UX refactor if the client needs polished inline validation instead of error-boundary behavior.

P. ADM-013 implementation log — 2026-08-23 SEO team profile pass

ADM-013 is now implemented as an end-to-end admin-managed SEO profile feature instead of a deferred schema gap.

What changed:

- Added public `/team/[slug]` profile pages for complete published team profiles.
- Wired existing Supabase `team_members` profile fields into admin:
  - `has_profile_page`;
  - `canonical_path`;
  - `profile_summary`;
  - `profile_body`;
  - `keywords`;
  - `meta_title`;
  - `meta_description`;
  - profile image alt text through linked `media_assets.alt_text`;
  - `og_image` / `og_media_id`.
- Added a production quality gate: a profile can only be published as an indexable SEO profile if it has job title, image, alt text, summary, full body, meta description, keywords, and canonical path.
- Added slug/canonical handling:
  - canonical path is generated as `/team/{slug}`;
  - old profile paths record a 301 redirect when the slug/path changes.
- Added public SEO output:
  - dynamic metadata;
  - canonical URL;
  - Open Graph image;
  - `ProfilePage` JSON-LD with `Person` main entity;
  - breadcrumb JSON-LD.
- Added public discovery:
  - About team cards link to complete profile pages;
  - listing detail contact panels link to assigned team profiles;
  - Buy/Sell contact popovers link to assigned team profiles.
- Added sitemap support:
  - only complete, published, profile-enabled team pages enter `/sitemap.xml`;
  - incomplete profiles are excluded.
- Added webhook/cache support:
  - `team-profile-{slug}` tag revalidation;
  - profile, team, About, Buy/Sell, and sitemap paths revalidated after team admin mutations.
- Added admin list visibility:
  - `/admin/team` now shows whether a profile page is enabled and links to the profile.

Files substantially changed:

- `app/admin/team/TeamForm.tsx`
- `app/admin/team/actions.ts`
- `app/admin/team/page.tsx`
- `app/(marketing)/team/[slug]/page.tsx`
- `lib/db/team.ts`
- `lib/seo/structured-data.ts`
- `app/sitemap.xml/route.ts`
- `app/api/revalidate/route.ts`
- `app/(marketing)/about/page.tsx`
- `app/(marketing)/buy-sell/[listingType]/[slug]/page.tsx`
- `components/pages/BuySellClient.tsx`
- `styles/about.css`
- `tests/seo-regression.test.ts`

Validation results:

- `npx.cmd tsc --noEmit` passed after implementation.
- `npm.cmd run test:seo` passed after adding ProfilePage schema coverage: 21/21 tests.
- `npm.cmd run build` passed and showed `/team/[slug]` in the production route table.

Remaining QA:

- Authenticated browser QA should save and reopen `http://localhost:3000/admin/team/40000000-0000-0000-0000-000000000001/edit`.
- Browser QA should verify a complete published profile appears at `/team/{slug}`, includes the visible profile content, emits metadata/JSON-LD, and is included in `/sitemap.xml`.
- Browser QA should verify incomplete profile pages are not indexable and do not enter the sitemap.

Q. Admin Help / Knowledgebase Assistant implementation log — 2026-08-23

Implemented a self-contained admin help feature so non-technical admins can ask how to use admin forms while the source material remains verified, technical, and expandable.

What changed:

- Added isolated feature directory `features/admin-help/`.
- Added verified markdown knowledgebase files:
  - `about-page.md`;
  - `pages-editor.md`;
  - `seo-basics.md`;
  - `media-guidelines.md`;
  - `listings.md`;
  - `updates.md`.
- Added knowledgebase selection logic in `features/admin-help/server/knowledgebase.ts`.
- Added protected server action `askAdminHelp` in `features/admin-help/server/actions.ts`.
- The server action calls `requireAdmin()` before answering, so the assistant is only usable by authenticated admins.
- Gemini is called server-side only through `@google/genai`; API keys are not exposed to the browser.
- Default model is `gemini-3.7-flash`, with production override support through `GEMINI_ADMIN_HELP_MODEL`.
- If `GEMINI_API_KEY` is missing or Gemini is temporarily unavailable, the assistant falls back to verified local guide excerpts instead of exposing raw API errors.
- Added full `/admin/help` page with guide inventory and assistant form.
- Added floating `?` admin help drawer available across authenticated admin pages.
- Added `Help` to the admin navigation.
- Added scoped admin-help styles to `styles/admin.css` without changing public SEO pages or existing admin save flows.

SEO/admin quality intent:

- The guide source explicitly warns admins not to publish keyword-stuffed or unverifiable claims.
- About-page guide explains proof stats, awards/recognitions, service pillars, team stories/videos, operating model, media alt text, and visible proof requirements.
- AI answers are constrained to the verified local project knowledgebase for project-specific answers.
- Technical source excerpts remain visible to admins through the “Technical source used” disclosure.

Validation results:

- Official Gemini model/API check confirmed `gemini-3.7-flash` is accepted by the API, but the live call returned temporary 503 high-demand during this pass.
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd run test:seo` passed: 21/21 tests.
- `npm.cmd run build` passed.
- `git diff --check -- features/admin-help app/admin/help components/admin/AdminShellChrome.tsx app/admin/layout.tsx styles/admin.css` passed with Windows CRLF warnings only.
- Playwright smoke test against production build on `127.0.0.1:3001` passed:
  - logged into admin;
  - opened `/admin/help`;
  - confirmed six guide cards render;
  - confirmed Help nav link exists;
  - confirmed floating help button appears;
  - opened the drawer on the About page editor;
  - submitted “What is the awards section for?”;
  - confirmed verified guide fallback answer rendered.

Remaining notes:

- Gemini returned a temporary high-demand 503 during validation; the production fallback worked as intended.
- Admin help is currently an answer-only assistant. It does not edit records, submit forms, or mutate Supabase data.
- Future sections should add new verified markdown guides under `features/admin-help/knowledgebase/` and register them in `ADMIN_HELP_DOCS`.
- No database migration was required for this feature.

R. Homepage CMS production-hardening implementation and verification — 2026-08-30

Resolved defects and production changes:

- Featured Projects and Featured Listings are now independent CMS sections rendered together in database `sort_order`; one no longer silently replaces the other.
- Added a real `page_blocks.listing_id` relationship. Homepage listing blocks select a published/indexable inventory row by UUID, and public title, canonical route, type, price, availability, location, attributes, and default media come from that row.
- Backfilled the existing DHA Phase 6 block to listing `60000000-0000-0000-0000-000000000001`.
- Added project multi-image gallery upload, alt/title/sort/primary editing, relation removal, and compensating cleanup for partial upload/database failures.
- Added explicit section/block deletion. The root homepage is protected: route `/`, key `home`, published state, and indexability are server-enforced, and root deletion is unavailable.
- Added a shared section contract. Admin only exposes fields/media controls used by each public section; server validation re-reads the database section type instead of trusting hidden form values.
- Existing media is preserved unless explicitly removed/replaced. New uploads are image-only, alt text is editable, and unattached assets are cleaned up after a failed owning mutation.
- Wired project galleries/links, award references, story/video links, gallery links, section copy, and testimonial copy into public output. Removed silent public item caps; project cards retain a bounded four-image preview while admin retains the full gallery.
- Routed homepage CMS imagery through `SafeMediaImage` for local, Supabase, production-domain, and arbitrary browser-safe external URLs.
- Missing/unpublished root now produces a real 404 and fail-closed noindex metadata. About/contact also return real 404s when unavailable and follow CMS noindex state.
- Sitemap keeps `/`, `/buy-sell`, and `/updates`, while About/Contact are included only when their CMS rows are published/indexable.
- Upgraded Next.js `16.2.6` to official security release `16.3.3`; the production audit moved from three high-severity findings to zero vulnerabilities.

Database migration and live readback:

- Applied `20260829_homepage_content_production_hardening.sql` as live migration `20260829103833_homepage_content_production_hardening` on project `zucpsqjiaexxxobzwodd`.
- Verified nullable UUID `listing_id`, `ON DELETE SET NULL` FK, listing lookup/uniqueness indexes, `page_block_media.media_id` index, authenticated gallery mutation policy, anonymous `is_admin()` denial, authenticated/service-role grants, listing backfill, and homepage order 5/10/20/30/40/50/60/70/80/90.

Validation:

- `npx.cmd tsc --noEmit`: passed.
- `npm.cmd run test:seo`: passed, 24/24.
- `npm.cmd run build`: passed on Next.js 16.3.3; 58 static/PPR routes generated.
- `npm.cmd audit --omit=dev`: passed, zero vulnerabilities.
- `git diff --check`: passed; Windows line-ending notices only.
- Production-build Playwright verified 200 homepage, production canonical, index/follow, one H1, no missing alt/broken images/nested forms/application console errors, four projects, four gallery thumbnails, and the linked DHA listing route.
- Authenticated Playwright verified the selected listing UUID, gallery edit/remove controls, section/block deletes, locked root identity, no root delete, no console errors, and no 390px horizontal overflow.
- `/sitemap.xml` returned XML containing root, About, Contact, and the canonical DHA listing; robots excluded admin/API; an unknown public path returned 404.

Remaining production items:

- P1 configuration: Supabase leaked-password protection is disabled. Enable it and rotate the current admin credential to a unique production password before client handoff. This blocks safe production administration until completed.
- P2 UX: ADM-009 inline Server Action error presentation remains open across several forms.
- P2 configuration: review the custom `/_next/static/:path*` Cache-Control rule before Vercel deployment; Next.js owns immutable static-asset caching.
- P3/content: three current project cards use the valid broad `/buy-sell` fallback because no narrower verified destination is stored. Assign factual relevant destinations when matching inventory or an eligible landing page exists.
- Expected: Gallery/events is draft and absent publicly. Homepage SEO links are absent because no landing page currently qualifies as published, indexable, and promoted on home; review/noindex content is correctly excluded.
- Accepted advisor warning: authenticated execution of SECURITY DEFINER `is_admin()` is intentional. It is unavailable to anon, current-user scoped through `auth.uid()`, required by server authorization, and uses a fixed `search_path`.
