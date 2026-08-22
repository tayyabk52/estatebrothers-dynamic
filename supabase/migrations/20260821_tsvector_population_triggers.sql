-- Migration: tsvector population triggers for full-text search
-- Populates search_document on INSERT and UPDATE for:
--   real_estate_listings, updates, pages, team_members, seo_landing_pages
--
-- Weights:
--   A = highest   (title, slug)
--   B = high      (meta_title, summary, phase, city, project, block, listing_type_slug)
--   C = medium    (meta_description, description/body, headline, tags)
--   D = lowest    (keywords)

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. real_estate_listings
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.update_listing_search_document()
returns trigger
language plpgsql
as $$
begin
  new.search_document :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.slug, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.meta_title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.listing_type_slug, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.phase, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.city, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.project, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.block, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.neighborhood, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.size_label, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.price_label, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.meta_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.summary, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.listing_status, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.keywords, ' '), '')), 'D');
  return new;
end;
$$;

drop trigger if exists listings_update_search_document on public.real_estate_listings;
create trigger listings_update_search_document
before insert or update on public.real_estate_listings
for each row execute function public.update_listing_search_document();

-- Backfill existing rows immediately
update public.real_estate_listings set updated_at = updated_at;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. updates (blog posts / announcements)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.update_updates_search_document()
returns trigger
language plpgsql
as $$
begin
  new.search_document :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.slug, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.headline, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.meta_title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.article_section, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.summary, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.meta_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.body, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.keywords, ' '), '')), 'D');
  return new;
end;
$$;

drop trigger if exists updates_update_search_document on public.updates;
create trigger updates_update_search_document
before insert or update on public.updates
for each row execute function public.update_updates_search_document();

-- Backfill existing rows
update public.updates set updated_at = updated_at;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. pages (CMS pages)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.update_pages_search_document()
returns trigger
language plpgsql
as $$
begin
  new.search_document :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.meta_title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.heading, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.intro, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.body, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.meta_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.keywords, ' '), '')), 'D');
  return new;
end;
$$;

drop trigger if exists pages_update_search_document on public.pages;
create trigger pages_update_search_document
before insert or update on public.pages
for each row execute function public.update_pages_search_document();

-- Backfill existing rows
update public.pages set updated_at = updated_at;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. team_members
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.update_team_member_search_document()
returns trigger
language plpgsql
as $$
begin
  new.search_document :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.slug, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.job_title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.meta_title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.bio, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.profile_summary, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.meta_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.keywords, ' '), '')), 'D');
  return new;
end;
$$;

drop trigger if exists team_members_update_search_document on public.team_members;
create trigger team_members_update_search_document
before insert or update on public.team_members
for each row execute function public.update_team_member_search_document();

-- Backfill existing rows
update public.team_members set updated_at = updated_at;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. seo_landing_pages
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.update_seo_landing_page_search_document()
returns trigger
language plpgsql
as $$
begin
  new.search_document :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.slug, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.heading, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.meta_title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.city, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.phase, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.neighborhood, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.listing_type_slug, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.intro, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.body, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.meta_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.keywords, ' '), '')), 'D');
  return new;
end;
$$;

drop trigger if exists seo_landing_pages_update_search_document on public.seo_landing_pages;
create trigger seo_landing_pages_update_search_document
before insert or update on public.seo_landing_pages
for each row execute function public.update_seo_landing_page_search_document();

-- Backfill existing rows
update public.seo_landing_pages set updated_at = updated_at;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Ensure GIN indexes are present (idempotent — creates only if missing)
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists idx_listings_search_document
  on public.real_estate_listings using gin (search_document);

create index if not exists idx_updates_search_document
  on public.updates using gin (search_document);

create index if not exists idx_pages_search_document
  on public.pages using gin (search_document);

create index if not exists idx_team_members_search_document
  on public.team_members using gin (search_document);

create index if not exists idx_seo_landing_pages_search_document
  on public.seo_landing_pages using gin (search_document);
