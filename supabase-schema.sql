-- Run this in Supabase SQL Editor

create table if not exists crew (
  id          uuid primary key default gen_random_uuid(),
  crew_id     text unique not null,
  name        text not null,
  position    text,
  line_link   text not null,
  is_registered boolean not null default true,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Index for fast lookup by crew_id
create index if not exists idx_crew_crew_id on crew(crew_id);

-- Row Level Security: allow anyone to read visible crew
alter table crew enable row level security;

drop policy if exists "Public can search visible crew" on crew;
drop policy if exists "Anyone can insert (register)" on crew;
drop policy if exists "Anyone can update visibility by crew_id" on crew;

create policy "Public can search visible crew"
  on crew for select
  using (is_registered = true and is_visible = true);

create policy "Anyone can insert (register)"
  on crew for insert
  with check (true);

create policy "Anyone can update visibility by crew_id"
  on crew for update
  using (true)
  with check (true);

-- Test data (optional — remove before production)
insert into crew (crew_id, name, position, line_link, is_registered, is_visible) values
  ('10234', 'Aom Supanat', 'FA',     'https://line.me/ti/p/~aomsupanat', true, true),
  ('20891', 'Krit Thanawat', 'Purser', 'https://line.me/ti/p/~kritthanawat', true, true),
  ('33105', 'Hidden User',  'FA',     'https://line.me/ti/p/~hidden', true, false)
on conflict (crew_id) do nothing;
