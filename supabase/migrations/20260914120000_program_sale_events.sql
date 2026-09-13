create table if not exists public.program_sale_events (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null unique references public.programs(id) on delete cascade,
  label text not null default 'Limited-time sale',
  amount_minor integer not null check (amount_minor > 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

alter table public.program_sale_events enable row level security;
grant select on public.program_sale_events to anon, authenticated;
grant all on public.program_sale_events to service_role;

drop policy if exists "Public can read sale events" on public.program_sale_events;
create policy "Public can read sale events" on public.program_sale_events for select using (true);
create index if not exists program_sale_events_window_idx on public.program_sale_events (program_id, starts_at, ends_at) where active;