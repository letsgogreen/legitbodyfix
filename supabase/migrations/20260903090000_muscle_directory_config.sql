-- Additive only: existing content, publication state, RLS and revision trigger remain unchanged.
alter table public.muscles add column if not exists directory_config jsonb;
comment on column public.muscles.directory_config is
  'Public dictionary overrides: regions, groups, functions. Null values retain automatic classification.';
