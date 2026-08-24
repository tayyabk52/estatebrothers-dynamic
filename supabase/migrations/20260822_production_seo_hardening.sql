-- Production SEO hardening pass.
-- Keeps published noindex detail pages crawlable, tightens admin-only policies,
-- fixes function search_path warnings, removes duplicate search indexes, and
-- adds indexes for foreign-key columns used by joins and admin reads.

alter policy "public can read published pages" on public.pages
  using (
    status = 'published'::public.content_status
    and published_at <= now()
  );

alter policy "public can read published listings" on public.real_estate_listings
  using (
    status = 'published'::public.content_status
    and published_at <= now()
  );

alter policy "public can read published updates" on public.updates
  using (
    status = 'published'::public.content_status
    and published_at <= now()
    and has_detail_page = true
  );

alter policy "public can read published seo landing pages" on public.seo_landing_pages
  using (
    status = 'published'::public.content_status
    and published_at <= now()
  );

alter policy "public can read indexable seo pages" on public.seo_pages
  using (true);

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and policyname like 'admins can manage%'
  loop
    execute format(
      'alter policy %I on %I.%I to authenticated',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end;
$$;

revoke execute on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

alter function public.set_updated_at() set search_path = '';
alter function public.validate_og_media_candidate() set search_path = '';
alter function public.update_listing_search_document() set search_path = '';
alter function public.update_updates_search_document() set search_path = '';
alter function public.update_pages_search_document() set search_path = '';
alter function public.update_team_member_search_document() set search_path = '';
alter function public.update_seo_landing_page_search_document() set search_path = '';

drop index if exists public.idx_pages_search_document;
drop index if exists public.idx_listings_search_document;
drop index if exists public.idx_updates_search_document;
drop index if exists public.idx_team_members_search_document;
drop index if exists public.idx_seo_landing_pages_search_document;

create index if not exists content_authors_image_media_id_idx on public.content_authors (image_media_id);
create index if not exists office_locations_image_media_id_idx on public.office_locations (image_media_id);
create index if not exists page_blocks_media_id_idx on public.page_blocks (media_id);
create index if not exists page_sections_media_id_idx on public.page_sections (media_id);
create index if not exists pages_hero_media_id_idx on public.pages (hero_media_id);
create index if not exists pages_og_media_id_idx on public.pages (og_media_id);
create index if not exists real_estate_listings_contact_person_id_idx on public.real_estate_listings (contact_person_id);
create index if not exists real_estate_listings_og_media_id_idx on public.real_estate_listings (og_media_id);
create index if not exists real_estate_listings_thumbnail_media_id_idx on public.real_estate_listings (thumbnail_media_id);
create index if not exists seo_landing_pages_hero_media_id_idx on public.seo_landing_pages (hero_media_id);
create index if not exists seo_landing_pages_listing_type_slug_idx on public.seo_landing_pages (listing_type_slug);
create index if not exists seo_landing_pages_og_media_id_idx on public.seo_landing_pages (og_media_id);
create index if not exists seo_pages_og_media_id_idx on public.seo_pages (og_media_id);
create index if not exists site_settings_default_og_media_id_idx on public.site_settings (default_og_media_id);
create index if not exists site_settings_logo_media_id_idx on public.site_settings (logo_media_id);
create index if not exists team_members_image_media_id_idx on public.team_members (image_media_id);
create index if not exists team_members_og_media_id_idx on public.team_members (og_media_id);
create index if not exists update_links_update_id_idx on public.update_links (update_id);
create index if not exists updates_author_id_idx on public.updates (author_id);
create index if not exists updates_og_media_id_idx on public.updates (og_media_id);
create index if not exists updates_thumbnail_media_id_idx on public.updates (thumbnail_media_id);
