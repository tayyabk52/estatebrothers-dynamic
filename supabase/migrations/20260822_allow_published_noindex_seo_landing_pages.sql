-- Allow admins to publish SEO landing pages for live review while keeping them noindex.
-- Production-indexable pages are still controlled by the noindex flag and sitemap filters.

alter table public.seo_landing_pages
drop constraint if exists seo_landing_pages_check;

alter table public.seo_landing_pages
add constraint seo_landing_pages_published_requires_published_at
check (
  status <> 'published'::public.content_status
  or published_at is not null
);
