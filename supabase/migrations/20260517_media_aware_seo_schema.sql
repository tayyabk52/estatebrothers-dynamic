-- Estate Brothers media-aware SEO schema.
-- Phase 1: business settings, team members, listing types, real estate listings.
-- Phase 2: updates/posts, authors, links.
-- Phase 3: global SEO pages, redirects, verification metadata.
-- Media is centralized so listings and updates can share uploaded files and embeds.

create extension if not exists pgcrypto;

do $$
begin
  create type public.content_status as enum ('draft', 'review', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.admin_role as enum ('owner', 'editor', 'viewer');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.link_kind as enum ('internal', 'external');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.update_type as enum ('announcement', 'facebook', 'event', 'market', 'company');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.article_schema_type as enum ('Article', 'NewsArticle', 'BlogPosting');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.seo_landing_page_type as enum ('area', 'listing_category');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.seo_url_rule_kind as enum ('index', 'noindex', 'canonical');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.media_source_type as enum ('upload', 'youtube', 'facebook', 'external');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.media_type as enum ('image', 'video', 'document', 'embed');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role public.admin_role not null default 'editor',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and active = true
      and role in ('owner', 'editor')
  );
$$;

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),

  source_type public.media_source_type not null,
  media_type public.media_type not null,

  storage_bucket text,
  storage_path text,
  public_url text,

  external_url text,
  embed_url text,
  provider text,

  title text,
  alt_text text,
  caption text,
  thumbnail_url text,

  mime_type text,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  width int check (width is null or width > 0),
  height int check (height is null or height > 0),
  duration_seconds int check (duration_seconds is null or duration_seconds >= 0),

  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    (source_type = 'upload' and storage_bucket is not null and storage_path is not null)
    or
    (source_type <> 'upload' and external_url is not null)
  )
);

create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  singleton_key boolean not null default true unique check (singleton_key = true),

  business_name text not null default 'Estate Brothers',
  legal_name text,
  tagline text,
  business_description text,
  phone text,
  whatsapp text,
  email text,

  address_line_1 text,
  address_line_2 text,
  city text,
  region text,
  postal_code text,
  country_code char(2) not null default 'PK',
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  map_url text,

  price_range text default 'PKR',
  opening_hours jsonb not null default '[]'::jsonb,
  service_areas text[] not null default array[]::text[],
  knows_about text[] not null default array[]::text[],
  social_links jsonb not null default '{}'::jsonb,

  logo_url text,
  logo_media_id uuid references public.media_assets(id) on delete set null,
  default_og_image text,
  default_og_media_id uuid references public.media_assets(id) on delete set null,

  default_meta_title text,
  default_meta_description text check (
    default_meta_description is null or char_length(default_meta_description) <= 180
  ),
  google_site_verification text,
  bing_site_verification text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique check (page_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  route_path text not null unique,

  title text not null,
  heading text,
  intro text,
  body text,

  hero_media_id uuid references public.media_assets(id) on delete set null,
  og_image text,
  og_media_id uuid references public.media_assets(id) on delete set null,

  meta_title text not null,
  meta_description text not null check (char_length(meta_description) <= 180),
  keywords text[] not null default array[]::text[],

  status public.content_status not null default 'draft',
  published_at timestamptz,
  noindex boolean not null default false,
  sort_order int not null default 0,

  search_document tsvector,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    status <> 'published'
    or (published_at is not null and route_path is not null and meta_title is not null)
  )
);

create trigger pages_set_updated_at
before update on public.pages
for each row execute function public.set_updated_at();

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  section_key text not null check (section_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  eyebrow text,
  heading text,
  subheading text,
  body text,
  media_id uuid references public.media_assets(id) on delete set null,
  settings jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (page_id, section_key)
);

create trigger page_sections_set_updated_at
before update on public.page_sections
for each row execute function public.set_updated_at();

create table public.page_blocks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.page_sections(id) on delete cascade,
  block_key text check (block_key is null or block_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text,
  body text,
  media_id uuid references public.media_assets(id) on delete set null,
  icon_name text,
  link_label text,
  link_url text,
  link_kind public.link_kind,
  attributes jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger page_blocks_set_updated_at
before update on public.page_blocks
for each row execute function public.set_updated_at();

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.pages(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger faqs_set_updated_at
before update on public.faqs
for each row execute function public.set_updated_at();

create table public.office_locations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  status_label text,
  detail text,
  phone text,
  email text,
  address_line_1 text,
  address_line_2 text,
  city text,
  region text,
  postal_code text,
  country_code char(2) not null default 'PK',
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  map_url text,
  image_media_id uuid references public.media_assets(id) on delete set null,
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger office_locations_set_updated_at
before update on public.office_locations
for each row execute function public.set_updated_at();

create table public.listing_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  label text not null,
  description text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger listing_types_set_updated_at
before update on public.listing_types
for each row execute function public.set_updated_at();

insert into public.listing_types (slug, label, sort_order)
values ('plot', 'Plots', 10), ('house', 'Houses', 20)
on conflict (slug) do nothing;

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  job_title text,
  phone text,
  whatsapp text,
  email text,
  image_url text,
  image_media_id uuid references public.media_assets(id) on delete set null,
  profile_summary text,
  profile_body text,
  bio text,
  canonical_path text unique,
  has_profile_page boolean not null default false,
  public_profile boolean not null default false,
  status public.content_status not null default 'draft',

  meta_title text,
  meta_description text check (meta_description is null or char_length(meta_description) <= 180),
  og_image text,
  og_media_id uuid references public.media_assets(id) on delete set null,
  keywords text[] not null default array[]::text[],
  sort_order int not null default 0,

  search_document tsvector,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    has_profile_page = false
    or (canonical_path is not null and meta_title is not null and meta_description is not null)
  )
);

create trigger team_members_set_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

create table public.real_estate_listings (
  id uuid primary key default gen_random_uuid(),

  listing_type_slug text not null references public.listing_types(slug),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  canonical_path text not null unique,

  title text not null,
  summary text,
  description text,
  listing_status text,
  availability text not null default 'available',

  price_label text not null default 'On Call',
  price_numeric numeric(14, 2),
  price_currency char(3) not null default 'PKR',

  city text,
  phase text,
  project text,
  block text,
  neighborhood text,
  address_line text,
  region text default 'Punjab',
  postal_code text,
  country_code char(2) not null default 'PK',
  latitude numeric(10, 7),
  longitude numeric(10, 7),

  size_label text,
  area_value numeric(12, 2),
  area_unit text,
  bedrooms int check (bedrooms is null or bedrooms >= 0),
  bathrooms int check (bathrooms is null or bathrooms >= 0),
  garage_capacity int check (garage_capacity is null or garage_capacity >= 0),

  contact_person_id uuid references public.team_members(id) on delete set null,
  thumbnail_url text,
  thumbnail_media_id uuid references public.media_assets(id) on delete set null,
  og_image text,
  og_media_id uuid references public.media_assets(id) on delete set null,
  video_url text,

  features jsonb not null default '{}'::jsonb,
  attributes jsonb not null default '{}'::jsonb,

  meta_title text,
  meta_description text check (meta_description is null or char_length(meta_description) <= 180),
  keywords text[] not null default array[]::text[],

  status public.content_status not null default 'draft',
  published_at timestamptz,
  noindex boolean not null default false,
  sort_order int not null default 0,

  search_document tsvector,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    status <> 'published'
    or (published_at is not null and meta_title is not null and meta_description is not null)
  )
);

create trigger real_estate_listings_set_updated_at
before update on public.real_estate_listings
for each row execute function public.set_updated_at();

create table public.listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.real_estate_listings(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete cascade,

  sort_order int not null default 0,
  is_primary boolean not null default false,
  is_gallery_item boolean not null default true,
  is_og_candidate boolean not null default false,

  created_at timestamptz not null default now(),

  unique (listing_id, media_id)
);

create table public.content_authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text,
  email text,
  image_url text,
  image_media_id uuid references public.media_assets(id) on delete set null,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger content_authors_set_updated_at
before update on public.content_authors
for each row execute function public.set_updated_at();

create table public.updates (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  canonical_path text not null unique,

  title text not null,
  headline text,
  summary text,
  body text,
  article_schema_type public.article_schema_type not null default 'Article',
  article_section text,
  update_type public.update_type not null default 'announcement',
  source text not null default 'website',
  author_id uuid references public.content_authors(id) on delete set null,

  featured boolean not null default false,
  tags text[] not null default array[]::text[],
  thumbnail_url text,
  thumbnail_media_id uuid references public.media_assets(id) on delete set null,
  thumbnail_alt text,
  og_image text,
  og_media_id uuid references public.media_assets(id) on delete set null,

  has_detail_page boolean not null default true,

  meta_title text,
  meta_description text check (meta_description is null or char_length(meta_description) <= 180),
  keywords text[] not null default array[]::text[],

  status public.content_status not null default 'draft',
  published_at timestamptz,
  modified_at timestamptz,
  noindex boolean not null default false,

  search_document tsvector,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    status <> 'published'
    or (
      published_at is not null
      and meta_title is not null
      and meta_description is not null
      and canonical_path is not null
      and has_detail_page = true
      and body is not null
      and author_id is not null
    )
  )
);

create trigger updates_set_updated_at
before update on public.updates
for each row execute function public.set_updated_at();

create table public.update_links (
  id uuid primary key default gen_random_uuid(),
  update_id uuid not null references public.updates(id) on delete cascade,
  label text not null,
  url text not null,
  kind public.link_kind not null default 'internal',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.update_media (
  id uuid primary key default gen_random_uuid(),
  update_id uuid not null references public.updates(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete cascade,

  sort_order int not null default 0,
  is_featured boolean not null default false,
  is_inline boolean not null default false,
  is_og_candidate boolean not null default false,

  created_at timestamptz not null default now(),

  unique (update_id, media_id)
);

create table public.seo_landing_pages (
  id uuid primary key default gen_random_uuid(),
  page_type public.seo_landing_page_type not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  canonical_path text not null unique,

  title text not null,
  heading text not null,
  intro text not null,
  body text,

  -- Defines the inventory slice for area/category pages without creating thin arbitrary filter URLs.
  listing_type_slug text references public.listing_types(slug),
  city text,
  phase text,
  neighborhood text,
  listing_status text,
  filters jsonb not null default '{}'::jsonb,

  hero_media_id uuid references public.media_assets(id) on delete set null,
  og_image text,
  og_media_id uuid references public.media_assets(id) on delete set null,

  meta_title text not null,
  meta_description text not null check (char_length(meta_description) <= 180),
  keywords text[] not null default array[]::text[],

  status public.content_status not null default 'draft',
  published_at timestamptz,
  noindex boolean not null default false,
  sort_order int not null default 0,

  search_document tsvector,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    status <> 'published'
    or (published_at is not null and noindex = false)
  )
);

create trigger seo_landing_pages_set_updated_at
before update on public.seo_landing_pages
for each row execute function public.set_updated_at();

create table public.seo_pages (
  id uuid primary key default gen_random_uuid(),
  route_path text not null unique,
  title text not null,
  meta_title text not null,
  meta_description text not null check (char_length(meta_description) <= 180),
  canonical_url text,
  og_image text,
  og_media_id uuid references public.media_assets(id) on delete set null,
  twitter_image text,
  keywords text[] not null default array[]::text[],
  noindex boolean not null default false,
  structured_data_overrides jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger seo_pages_set_updated_at
before update on public.seo_pages
for each row execute function public.set_updated_at();

create table public.seo_redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique,
  target_path text not null,
  status_code int not null default 301 check (status_code in (301, 302, 307, 308)),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.seo_url_rules (
  id uuid primary key default gen_random_uuid(),
  source_pattern text not null unique,
  rule_kind public.seo_url_rule_kind not null default 'noindex',
  canonical_path text,
  reason text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    rule_kind <> 'canonical'
    or canonical_path is not null
  )
);

create trigger seo_url_rules_set_updated_at
before update on public.seo_url_rules
for each row execute function public.set_updated_at();

create index media_assets_status_idx
on public.media_assets (status, media_type, source_type);

create index media_assets_storage_idx
on public.media_assets (storage_bucket, storage_path)
where source_type = 'upload';

create index pages_public_route_idx
on public.pages (route_path)
where status = 'published' and noindex = false;

create index pages_search_idx
on public.pages using gin (search_document);

create index page_sections_page_sort_idx
on public.page_sections (page_id, sort_order);

create index page_blocks_section_sort_idx
on public.page_blocks (section_id, sort_order);

create index faqs_page_sort_idx
on public.faqs (page_id, sort_order)
where status = 'published';

create index office_locations_public_sort_idx
on public.office_locations (sort_order)
where status = 'published';

create index team_members_public_route_idx
on public.team_members (canonical_path)
where status = 'published' and public_profile = true and has_profile_page = true;

create index team_members_search_idx
on public.team_members using gin (search_document);

create index listings_public_route_idx
on public.real_estate_listings (listing_type_slug, slug)
where status = 'published' and noindex = false;

create index listings_published_sort_idx
on public.real_estate_listings (published_at desc, sort_order asc)
where status = 'published' and noindex = false;

create index listings_search_idx
on public.real_estate_listings using gin (search_document);

create index listings_attributes_idx
on public.real_estate_listings using gin (attributes);

create index listing_media_listing_sort_idx
on public.listing_media (listing_id, sort_order);

create index listing_media_media_idx
on public.listing_media (media_id);

create index updates_public_idx
on public.updates (published_at desc)
where status = 'published' and noindex = false and has_detail_page = true;

create index updates_search_idx
on public.updates using gin (search_document);

create index updates_tags_idx
on public.updates using gin (tags);

create index update_media_update_sort_idx
on public.update_media (update_id, sort_order);

create index update_media_media_idx
on public.update_media (media_id);

create index seo_landing_pages_public_idx
on public.seo_landing_pages (page_type, published_at desc, sort_order asc)
where status = 'published' and noindex = false;

create index seo_landing_pages_route_idx
on public.seo_landing_pages (canonical_path)
where status = 'published' and noindex = false;

create index seo_landing_pages_search_idx
on public.seo_landing_pages using gin (search_document);

create or replace function public.validate_og_media_candidate()
returns trigger
language plpgsql
as $$
declare
  asset_type public.media_type;
begin
  if new.is_og_candidate is true then
    select media_type into asset_type
    from public.media_assets
    where id = new.media_id;

    if asset_type is distinct from 'image'::public.media_type then
      raise exception 'OG candidate media must be an image';
    end if;
  end if;

  return new;
end;
$$;

create trigger listing_media_validate_og_candidate
before insert or update on public.listing_media
for each row execute function public.validate_og_media_candidate();

create trigger update_media_validate_og_candidate
before insert or update on public.update_media
for each row execute function public.validate_og_media_candidate();

alter table public.admin_users enable row level security;
alter table public.media_assets enable row level security;
alter table public.site_settings enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.page_blocks enable row level security;
alter table public.faqs enable row level security;
alter table public.office_locations enable row level security;
alter table public.listing_types enable row level security;
alter table public.team_members enable row level security;
alter table public.real_estate_listings enable row level security;
alter table public.listing_media enable row level security;
alter table public.content_authors enable row level security;
alter table public.updates enable row level security;
alter table public.update_links enable row level security;
alter table public.update_media enable row level security;
alter table public.seo_landing_pages enable row level security;
alter table public.seo_pages enable row level security;
alter table public.seo_redirects enable row level security;
alter table public.seo_url_rules enable row level security;

create policy "admins can read admin users"
on public.admin_users for select
using (public.is_admin());

create policy "admins can manage admin users"
on public.admin_users for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published media assets"
on public.media_assets for select
using (status = 'published');

create policy "admins can manage media assets"
on public.media_assets for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read site settings"
on public.site_settings for select
using (true);

create policy "admins can manage site settings"
on public.site_settings for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published pages"
on public.pages for select
using (status = 'published' and noindex = false and published_at <= now());

create policy "admins can manage pages"
on public.pages for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published page sections"
on public.page_sections for select
using (
  status = 'published'
  and exists (
    select 1
    from public.pages pages
    where pages.id = page_sections.page_id
      and pages.status = 'published'
      and pages.noindex = false
      and pages.published_at <= now()
  )
);

create policy "admins can manage page sections"
on public.page_sections for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published page blocks"
on public.page_blocks for select
using (
  status = 'published'
  and exists (
    select 1
    from public.page_sections sections
    join public.pages pages on pages.id = sections.page_id
    where sections.id = page_blocks.section_id
      and sections.status = 'published'
      and pages.status = 'published'
      and pages.noindex = false
      and pages.published_at <= now()
  )
);

create policy "admins can manage page blocks"
on public.page_blocks for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published faqs"
on public.faqs for select
using (
  status = 'published'
  and (
    page_id is null
    or exists (
      select 1
      from public.pages pages
      where pages.id = faqs.page_id
        and pages.status = 'published'
        and pages.noindex = false
        and pages.published_at <= now()
    )
  )
);

create policy "admins can manage faqs"
on public.faqs for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published office locations"
on public.office_locations for select
using (status = 'published');

create policy "admins can manage office locations"
on public.office_locations for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read active listing types"
on public.listing_types for select
using (active = true);

create policy "admins can manage listing types"
on public.listing_types for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published team members"
on public.team_members for select
using (status = 'published' and public_profile = true);

create policy "admins can manage team members"
on public.team_members for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published listings"
on public.real_estate_listings for select
using (status = 'published' and noindex = false and published_at <= now());

create policy "admins can manage listings"
on public.real_estate_listings for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read media for published listings"
on public.listing_media for select
using (
  exists (
    select 1
    from public.real_estate_listings listings
    join public.media_assets media on media.id = listing_media.media_id
    where listings.id = listing_media.listing_id
      and listings.status = 'published'
      and listings.noindex = false
      and listings.published_at <= now()
      and media.status = 'published'
  )
);

create policy "admins can manage listing media"
on public.listing_media for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read authors"
on public.content_authors for select
using (true);

create policy "admins can manage authors"
on public.content_authors for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published updates"
on public.updates for select
using (status = 'published' and noindex = false and published_at <= now() and has_detail_page = true);

create policy "admins can manage updates"
on public.updates for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read links for published updates"
on public.update_links for select
using (
  exists (
    select 1
    from public.updates updates
    where updates.id = update_links.update_id
      and updates.status = 'published'
      and updates.noindex = false
      and updates.published_at <= now()
      and updates.has_detail_page = true
  )
);

create policy "admins can manage update links"
on public.update_links for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read media for published updates"
on public.update_media for select
using (
  exists (
    select 1
    from public.updates updates
    join public.media_assets media on media.id = update_media.media_id
    where updates.id = update_media.update_id
      and updates.status = 'published'
      and updates.noindex = false
      and updates.published_at <= now()
      and updates.has_detail_page = true
      and media.status = 'published'
  )
);

create policy "admins can manage update media"
on public.update_media for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published seo landing pages"
on public.seo_landing_pages for select
using (status = 'published' and noindex = false and published_at <= now());

create policy "admins can manage seo landing pages"
on public.seo_landing_pages for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read indexable seo pages"
on public.seo_pages for select
using (noindex = false);

create policy "admins can manage seo pages"
on public.seo_pages for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read active redirects"
on public.seo_redirects for select
using (active = true);

create policy "admins can manage redirects"
on public.seo_redirects for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read active seo url rules"
on public.seo_url_rules for select
using (active = true);

create policy "admins can manage seo url rules"
on public.seo_url_rules for all
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values
  ('listing-media', 'listing-media', true),
  ('update-media', 'update-media', true),
  ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "public can read listing media files"
on storage.objects for select
using (bucket_id = 'listing-media');

create policy "public can read update media files"
on storage.objects for select
using (bucket_id = 'update-media');

create policy "public can read site asset files"
on storage.objects for select
using (bucket_id = 'site-assets');

create policy "admins can upload listing media files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'listing-media' and public.is_admin());

create policy "admins can upload update media files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'update-media' and public.is_admin());

create policy "admins can upload site asset files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'site-assets' and public.is_admin());

create policy "admins can update managed media files"
on storage.objects for update
to authenticated
using (bucket_id in ('listing-media', 'update-media', 'site-assets') and public.is_admin())
with check (bucket_id in ('listing-media', 'update-media', 'site-assets') and public.is_admin());

create policy "admins can delete managed media files"
on storage.objects for delete
to authenticated
using (bucket_id in ('listing-media', 'update-media', 'site-assets') and public.is_admin());
