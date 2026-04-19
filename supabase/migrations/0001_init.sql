-- Enums
create type report_category as enum ('trash', 'graffiti', 'pothole', 'abandoned', 'hazard', 'other');
create type report_status as enum ('new', 'reviewing', 'in_progress', 'resolved');

-- Reports table
create table reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category report_category not null,
  description text check (char_length(description) <= 500),
  photo_path text,
  latitude numeric,
  longitude numeric,
  address text,
  status report_status not null default 'new',
  reporter_device_id text
);

create index reports_created_at_idx on reports (created_at desc);
create index reports_status_idx on reports (status);

-- RLS
alter table reports enable row level security;

-- Anon can insert (demo mode)
create policy "anon insert reports" on reports
  for insert to anon
  with check (true);

-- Only service role can select (admin only for now)
-- No select policy = no access for anon/authenticated