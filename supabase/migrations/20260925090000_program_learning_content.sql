ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS learning_content jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.programs.learning_content IS
  'Editable post-purchase learning-page copy shown to entitled customers.';
