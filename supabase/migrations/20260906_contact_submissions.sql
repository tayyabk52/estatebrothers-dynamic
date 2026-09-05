create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  name text not null,
  email text not null,
  phone text,
  intent text not null default 'General inquiry',
  city text,
  message text,
  status text not null default 'new',
  source_path text not null default '/contact',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_submissions_reference_length check (char_length(reference) between 6 and 32),
  constraint contact_submissions_name_length check (char_length(name) between 2 and 100),
  constraint contact_submissions_email_length check (char_length(email) between 3 and 254),
  constraint contact_submissions_phone_length check (phone is null or char_length(phone) <= 40),
  constraint contact_submissions_intent_length check (char_length(intent) between 2 and 80),
  constraint contact_submissions_city_length check (city is null or char_length(city) <= 80),
  constraint contact_submissions_message_length check (message is null or char_length(message) <= 3000),
  constraint contact_submissions_status_valid check (status in ('new', 'read', 'replied', 'archived')),
  constraint contact_submissions_source_path_length check (char_length(source_path) between 1 and 200)
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

create index if not exists contact_submissions_status_created_at_idx
  on public.contact_submissions (status, created_at desc);

alter table public.contact_submissions enable row level security;

drop policy if exists "visitors can submit contact inquiries" on public.contact_submissions;
create policy "visitors can submit contact inquiries"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and source_path = '/contact'
    and char_length(name) between 2 and 100
    and char_length(email) between 3 and 254
  );

drop policy if exists "admins can manage contact inquiries" on public.contact_submissions;
create policy "admins can manage contact inquiries"
  on public.contact_submissions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant insert on public.contact_submissions to anon, authenticated;
grant select, update, delete on public.contact_submissions to authenticated;

comment on table public.contact_submissions is
  'Private contact form inquiries. Visitors may insert only; authenticated administrators may review and update records.';
