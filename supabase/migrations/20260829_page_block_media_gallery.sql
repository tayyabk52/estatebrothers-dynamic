create table if not exists public.page_block_media (
  id uuid primary key default gen_random_uuid(),
  page_block_id uuid not null references public.page_blocks(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete cascade,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  caption text,
  created_at timestamp with time zone not null default now(),
  unique (page_block_id, media_id)
);

create index if not exists page_block_media_block_sort_idx
on public.page_block_media (page_block_id, sort_order);

create unique index if not exists page_block_media_one_primary_idx
on public.page_block_media (page_block_id)
where is_primary;

alter table public.page_block_media enable row level security;

drop policy if exists "public can read media for published page blocks" on public.page_block_media;
create policy "public can read media for published page blocks"
on public.page_block_media for select
using (
  exists (
    select 1
    from public.page_blocks blocks
    join public.page_sections sections on sections.id = blocks.section_id
    join public.pages pages on pages.id = sections.page_id
    join public.media_assets media on media.id = page_block_media.media_id
    where blocks.id = page_block_media.page_block_id
      and blocks.status = 'published'
      and sections.status = 'published'
      and pages.status = 'published'
      and media.status = 'published'
  )
);

drop policy if exists "admins can manage page block media" on public.page_block_media;
create policy "admins can manage page block media"
on public.page_block_media for all
using (public.is_admin())
with check (public.is_admin());
