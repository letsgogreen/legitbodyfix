-- Switch new commerce to Paddle while preserving historical Stripe identifiers.
ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS paddle_product_id text,
  ADD COLUMN IF NOT EXISTS paddle_price_id text;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS paddle_transaction_id text,
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS paddle_subscription_id text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_paddle_transaction_id_key
  ON public.orders (paddle_transaction_id)
  WHERE paddle_transaction_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.program_price_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  paddle_product_id text,
  previous_price_id text,
  new_price_id text NOT NULL,
  amount_minor integer NOT NULL,
  currency text NOT NULL,
  previous_archived boolean NOT NULL DEFAULT false,
  changed_by uuid REFERENCES auth.users(id),
  changed_by_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.program_price_changes TO authenticated;
GRANT ALL ON public.program_price_changes TO service_role;
ALTER TABLE public.program_price_changes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read program price history" ON public.program_price_changes;
CREATE POLICY "Admins can read program price history" ON public.program_price_changes
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE INDEX IF NOT EXISTS program_price_changes_program_idx
  ON public.program_price_changes (program_id, created_at DESC);

DO $$
DECLARE source_constraint text;
BEGIN
  SELECT conname INTO source_constraint FROM pg_constraint
  WHERE conrelid = 'public.entitlements'::regclass
    AND contype = 'c' AND pg_get_constraintdef(oid) ILIKE '%source%';
  IF source_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.entitlements DROP CONSTRAINT %I', source_constraint);
  END IF;
END $$;
ALTER TABLE public.entitlements
  ADD CONSTRAINT entitlements_source_check
  CHECK (source IN ('stripe', 'paddle', 'manual', 'migration', 'promotion'));

CREATE OR REPLACE FUNCTION public.create_customer_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.customer_profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name'))
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;
  UPDATE public.orders SET user_id = NEW.id
    WHERE user_id IS NULL AND status = 'paid' AND lower(customer_email) = lower(NEW.email);
  INSERT INTO public.entitlements (user_id, program_id, order_id, source, active)
  SELECT NEW.id, o.program_id, o.id,
    CASE WHEN o.provider = 'paddle' THEN 'paddle' ELSE 'stripe' END, true
  FROM public.orders o
  WHERE o.user_id = NEW.id AND o.status = 'paid' AND o.program_id IS NOT NULL
  ON CONFLICT (user_id, program_id) DO UPDATE SET
    order_id = EXCLUDED.order_id, source = EXCLUDED.source,
    active = true, revoked_at = NULL;
  RETURN NEW;
END;
$$;
