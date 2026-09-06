ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS paypal_order_id text,
  ADD COLUMN IF NOT EXISTS paypal_capture_id text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_paypal_order_id_key
  ON public.orders (paypal_order_id) WHERE paypal_order_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS orders_paypal_capture_id_key
  ON public.orders (paypal_capture_id) WHERE paypal_capture_id IS NOT NULL;

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
  CHECK (source IN ('stripe', 'paddle', 'paypal', 'manual', 'migration', 'promotion'));

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
    CASE WHEN o.provider IN ('paddle', 'paypal') THEN o.provider ELSE 'stripe' END, true
  FROM public.orders o
  WHERE o.user_id = NEW.id AND o.status = 'paid' AND o.program_id IS NOT NULL
  ON CONFLICT (user_id, program_id) DO UPDATE SET
    order_id = EXCLUDED.order_id, source = EXCLUDED.source,
    active = true, revoked_at = NULL;
  RETURN NEW;
END;
$$;
