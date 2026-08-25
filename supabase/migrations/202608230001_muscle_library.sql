create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false);
$$;

create table if not exists public.muscles (
  id text primary key,
  title text not null,
  anatomical_group text not null,
  family text,
  origin text not null,
  insertion_text text not null,
  actions text not null,
  image_url text not null check (image_url ~ '^https://'),
  image_alt text not null,
  image_credit text not null,
  image_credit_url text,
  source_name text not null,
  source_url text not null check (source_url ~ '^https://'),
  related_video_ids text not null default '',
  body_map text,
  functional_roles text[] not null default '{}',
  card_image_position text,
  card_image_scale numeric check (card_image_scale is null or card_image_scale > 0),
  published boolean not null default false,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.muscle_revisions (
  id bigint generated always as identity primary key,
  muscle_id text not null,
  version integer not null,
  snapshot jsonb not null,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id) on delete set null,
  unique (muscle_id, version)
);

create or replace function public.capture_muscle_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old is distinct from new then
    insert into public.muscle_revisions (muscle_id, version, snapshot, changed_by)
    values (old.id, old.version, to_jsonb(old), auth.uid());
    new.version := old.version + 1;
    new.updated_at := now();
    new.updated_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists muscle_revision_before_update on public.muscles;
create trigger muscle_revision_before_update
before update on public.muscles
for each row execute function public.capture_muscle_revision();

alter table public.muscles enable row level security;
alter table public.muscle_revisions enable row level security;

drop policy if exists "Published muscles are public" on public.muscles;
create policy "Published muscles are public"
on public.muscles for select
using (published or public.is_admin());

drop policy if exists "Admins insert muscles" on public.muscles;
create policy "Admins insert muscles"
on public.muscles for insert to authenticated
with check (public.is_admin());

drop policy if exists "Admins update muscles" on public.muscles;
create policy "Admins update muscles"
on public.muscles for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins delete muscles" on public.muscles;
create policy "Admins delete muscles"
on public.muscles for delete to authenticated
using (public.is_admin());

drop policy if exists "Admins read revisions" on public.muscle_revisions;
create policy "Admins read revisions"
on public.muscle_revisions for select to authenticated
using (public.is_admin());

create index if not exists muscles_group_idx on public.muscles (anatomical_group);
create index if not exists muscles_published_idx on public.muscles (published);
create index if not exists muscle_revisions_muscle_id_idx
on public.muscle_revisions (muscle_id, version desc);
