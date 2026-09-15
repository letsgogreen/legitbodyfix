-- Keep account creation compatible with the deployed legacy entitlement key.
-- Production identifies an entitlement by buyer email + program, while the
-- previous trigger tried to upsert by user id + program and omitted the
-- required buyer_email value. PostgreSQL validates the ON CONFLICT target even
-- when a new customer has no paid orders, so that mismatch blocked all signup.

ALTER TABLE public.entitlements
  ADD COLUMN IF NOT EXISTS buyer_email text;

CREATE UNIQUE INDEX IF NOT EXISTS entitlements_buyer_email_program_id_key
  ON public.entitlements (buyer_email, program_id);

CREATE OR REPLACE FUNCTION public.create_customer_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customer_profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name')
  )
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;

  UPDATE public.orders
  SET user_id = NEW.id
  WHERE user_id IS NULL
    AND status = 'paid'
    AND lower(customer_email) = lower(NEW.email);

  INSERT INTO public.entitlements (
    buyer_email,
    user_id,
    program_id,
    order_id,
    source,
    active
  )
  SELECT DISTINCT ON (o.program_id)
    lower(NEW.email),
    NEW.id,
    o.program_id,
    o.id,
    CASE
      WHEN o.provider IN ('paddle', 'paypal') THEN o.provider
      ELSE 'stripe'
    END,
    true
  FROM public.orders o
  WHERE o.user_id = NEW.id
    AND o.status = 'paid'
    AND o.program_id IS NOT NULL
  ORDER BY o.program_id, o.purchased_at DESC NULLS LAST, o.created_at DESC
  ON CONFLICT (buyer_email, program_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    order_id = EXCLUDED.order_id,
    source = EXCLUDED.source,
    active = true,
    revoked_at = NULL;

  RETURN NEW;
END;
$$;
