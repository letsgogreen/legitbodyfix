ALTER TABLE public.programs
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- The user-managed project previously had commerce columns from an older
-- programs table. Keep their historical data, but do not require the current
-- admin form to submit fields it no longer owns.
ALTER TABLE public.programs
  ALTER COLUMN title SET DEFAULT '',
  ALTER COLUMN price DROP NOT NULL,
  ALTER COLUMN price DROP DEFAULT,
  ALTER COLUMN currency SET DEFAULT 'USD';
