create table if not exists public.program_sales_pages (
  video_id text primary key check (video_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.program_sales_pages enable row level security;

create policy "Public can read program sales pages"
  on public.program_sales_pages for select
  using (true);

create policy "Admins can manage program sales pages"
  on public.program_sales_pages for all
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.program_sales_pages to anon, authenticated;
grant insert, update, delete on public.program_sales_pages to authenticated;

create or replace function public.touch_program_sales_page()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists program_sales_pages_touch on public.program_sales_pages;
create trigger program_sales_pages_touch
before update on public.program_sales_pages
for each row execute function public.touch_program_sales_page();
