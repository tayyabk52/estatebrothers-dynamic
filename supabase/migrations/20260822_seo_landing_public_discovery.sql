-- Admin-controlled discovery for curated SEO landing pages.
-- These flags decide where an already-indexable SEO page can be linked publicly.

alter table public.seo_landing_pages
add column if not exists show_in_footer boolean not null default false,
add column if not exists show_on_home boolean not null default false,
add column if not exists show_on_buy_sell boolean not null default false,
add column if not exists public_link_label text,
add column if not exists public_link_description text;

create index if not exists seo_landing_pages_footer_links_idx
on public.seo_landing_pages (sort_order asc, updated_at desc)
where status = 'published' and noindex = false and show_in_footer = true;

create index if not exists seo_landing_pages_home_links_idx
on public.seo_landing_pages (sort_order asc, updated_at desc)
where status = 'published' and noindex = false and show_on_home = true;

create index if not exists seo_landing_pages_buy_sell_links_idx
on public.seo_landing_pages (sort_order asc, updated_at desc)
where status = 'published' and noindex = false and show_on_buy_sell = true;
