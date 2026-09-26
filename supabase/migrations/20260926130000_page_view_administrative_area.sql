alter table public.page_views
add column if not exists administrative_area text
check (administrative_area is null or char_length(administrative_area) <= 120);

comment on column public.page_views.administrative_area is
  'Approximate city/county/district/town area derived from hosting-edge coordinates. Coordinates are not retained.';

create table if not exists public.analytics_location_cache (
  coordinate_hash text primary key check (char_length(coordinate_hash) = 32),
  administrative_area text not null check (char_length(administrative_area) <= 120),
  updated_at timestamptz not null default now()
);

alter table public.analytics_location_cache enable row level security;
grant all on public.analytics_location_cache to service_role;
