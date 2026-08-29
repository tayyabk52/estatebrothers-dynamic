-- Production hardening for homepage content management.
-- Links featured-listing CMS blocks to real published inventory and tightens
-- gallery administration without changing public read access.

alter table public.page_blocks
  add column if not exists listing_id uuid null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'page_blocks_listing_id_fkey'
      and conrelid = 'public.page_blocks'::regclass
  ) then
    alter table public.page_blocks
      add constraint page_blocks_listing_id_fkey
      foreign key (listing_id)
      references public.real_estate_listings(id)
      on delete set null;
  end if;
end
$$;

create index if not exists page_blocks_listing_id_idx
  on public.page_blocks (listing_id)
  where listing_id is not null;

create unique index if not exists page_blocks_section_listing_unique_idx
  on public.page_blocks (section_id, listing_id)
  where listing_id is not null;

create index if not exists page_block_media_media_id_idx
  on public.page_block_media (media_id);

-- Backfill only URL matches that resolve to one canonical listing route.
update public.page_blocks as block
set listing_id = listing.id
from public.page_sections as section,
     public.real_estate_listings as listing
where block.section_id = section.id
  and section.section_key = 'featured-listings'
  and block.listing_id is null
  and block.link_url = '/buy-sell/' || listing.listing_type_slug || '/' || listing.slug;

drop policy if exists "admins can manage page block media" on public.page_block_media;
create policy "admins can manage page block media"
on public.page_block_media
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

-- Stable initial homepage order. Future order remains admin-controlled.
update public.page_sections as section
set sort_order = ordering.sort_order
from public.pages as page,
  (values
    ('hero-stats', 5),
    ('partners', 10),
    ('featured-projects', 20),
    ('featured-listings', 30),
    ('leadership', 40),
    ('life-gallery', 50),
    ('awards-recognition', 60),
    ('team-stories', 70),
    ('testimonials', 80),
    ('testimonial-stats', 90)
  ) as ordering(section_key, sort_order)
where section.page_id = page.id
  and page.route_path = '/'
  and section.section_key = ordering.section_key;
