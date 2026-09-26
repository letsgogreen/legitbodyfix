create table if not exists public.program_funnel_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null,
  visitor_id uuid,
  program_slug text not null check (char_length(program_slug) between 1 and 160),
  program_name text not null check (char_length(program_name) between 1 and 240),
  event_type text not null check (event_type in ('card_impression', 'card_click', 'sales_view', 'checkout_click')),
  source_path text not null default '/' check (char_length(source_path) between 1 and 500),
  device_type text not null check (device_type in ('desktop', 'tablet', 'mobile')),
  unique (session_id, program_slug, event_type)
);

create index if not exists program_funnel_events_created_at_idx on public.program_funnel_events (created_at desc);
create index if not exists program_funnel_events_program_idx on public.program_funnel_events (program_slug, event_type, created_at desc);

alter table public.program_funnel_events enable row level security;
grant all on public.program_funnel_events to service_role;
