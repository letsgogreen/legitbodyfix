create table if not exists public.site_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  sentiment text not null check (sentiment in ('helpful', 'needs_improvement')),
  message text not null default '' check (char_length(message) <= 2000),
  page_path text not null default '/' check (char_length(page_path) between 1 and 500),
  device_type text not null check (device_type in ('desktop', 'tablet', 'mobile')),
  visitor_id uuid,
  status text not null default 'new' check (status in ('new', 'reviewed', 'archived'))
);

create index if not exists site_feedback_created_at_idx on public.site_feedback (created_at desc);
create index if not exists site_feedback_status_idx on public.site_feedback (status, created_at desc);

alter table public.site_feedback enable row level security;

create policy "Administrators can read site feedback"
  on public.site_feedback for select
  to authenticated
  using (public.is_admin());

create policy "Administrators can update site feedback"
  on public.site_feedback for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, update on public.site_feedback to authenticated;
grant all on public.site_feedback to service_role;
