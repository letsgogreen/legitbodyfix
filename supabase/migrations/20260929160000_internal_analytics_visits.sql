alter table public.page_views
  add column if not exists is_internal boolean not null default false;

alter table public.program_funnel_events
  add column if not exists is_internal boolean not null default false;

create index if not exists page_views_internal_created_at_idx
  on public.page_views (is_internal, created_at desc);

create index if not exists program_funnel_internal_created_at_idx
  on public.program_funnel_events (is_internal, created_at desc);

comment on column public.page_views.is_internal is
  'True when the event came from a browser previously authenticated as the site administrator.';

comment on column public.program_funnel_events.is_internal is
  'True when the event came from a browser previously authenticated as the site administrator.';
