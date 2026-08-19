-- LegitBodyFix customer identity migration
-- Run once in the Supabase SQL editor before relying on user_id in application code.
--
-- Existing checkout behavior remains compatible: PayPal records buyer_email first,
-- then a matching Supabase account claims those records when the profile is created.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_lower_key
  on public.profiles (lower(email));

alter table public.profiles enable row level security;

drop policy if exists "Customers can read their own profile" on public.profiles;
create policy "Customers can read their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Customers can update their own profile" on public.profiles;
create policy "Customers can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.payment_orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.entitlements
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists payment_orders_user_id_idx
  on public.payment_orders (user_id, paid_at desc);

create index if not exists entitlements_user_id_idx
  on public.entitlements (user_id, status, created_at asc);

create unique index if not exists entitlements_active_user_program_key
  on public.entitlements (user_id, program_id)
  where user_id is not null and status = 'active';

create or replace function public.sync_customer_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text;
begin
  normalized_email := lower(trim(coalesce(new.email, '')));
  if normalized_email = '' then
    return new;
  end if;

  insert into public.profiles (user_id, email, display_name)
  values (
    new.id,
    normalized_email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '')
  )
  on conflict (user_id) do update
    set email = excluded.email,
        display_name = coalesce(excluded.display_name, public.profiles.display_name),
        updated_at = now();

  update public.payment_orders
    set user_id = new.id
    where user_id is null and lower(trim(buyer_email)) = normalized_email;

  update public.entitlements
    set user_id = new.id
    where user_id is null and lower(trim(buyer_email)) = normalized_email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_customer_profile on auth.users;
create trigger on_auth_user_customer_profile
  after insert or update of email, raw_user_meta_data on auth.users
  for each row execute function public.sync_customer_profile();

-- Backfill accounts and purchases created before this migration.
insert into public.profiles (user_id, email, display_name, created_at, updated_at)
select
  users.id,
  lower(trim(users.email)),
  nullif(trim(coalesce(users.raw_user_meta_data ->> 'display_name', '')), ''),
  coalesce(users.created_at, now()),
  now()
from auth.users as users
where users.email is not null and trim(users.email) <> ''
on conflict (user_id) do update
  set email = excluded.email,
      display_name = coalesce(excluded.display_name, public.profiles.display_name),
      updated_at = now();

update public.payment_orders as orders
set user_id = users.id
from auth.users as users
where orders.user_id is null
  and users.email is not null
  and lower(trim(orders.buyer_email)) = lower(trim(users.email));

update public.entitlements as access
set user_id = users.id
from auth.users as users
where access.user_id is null
  and users.email is not null
  and lower(trim(access.buyer_email)) = lower(trim(users.email));

revoke all on public.profiles from anon;
revoke all on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
