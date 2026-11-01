create table if not exists public.recipe_library_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text not null check (email = lower(email) and char_length(email) between 3 and 320),
  source_path text not null default '/recipes' check (char_length(source_path) between 1 and 500),
  constraint recipe_library_leads_email_key unique (email)
);

create index if not exists recipe_library_leads_updated_at_idx
  on public.recipe_library_leads (updated_at desc);

alter table public.recipe_library_leads enable row level security;

drop policy if exists "Administrators can read recipe library leads" on public.recipe_library_leads;

create policy "Administrators can read recipe library leads"
  on public.recipe_library_leads for select
  to authenticated
  using (public.is_admin());

grant select on public.recipe_library_leads to authenticated;
grant all on public.recipe_library_leads to service_role;
