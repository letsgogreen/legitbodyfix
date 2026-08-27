-- A customer may purchase before creating an account. When an account with the
-- same email appears, attach its paid orders and grant program access.
CREATE OR REPLACE FUNCTION public.create_customer_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customer_profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name'))
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;

  UPDATE public.orders SET user_id = NEW.id
  WHERE user_id IS NULL AND status = 'paid' AND lower(customer_email) = lower(NEW.email);

  INSERT INTO public.entitlements (user_id, program_id, order_id, source, active)
  SELECT NEW.id, o.program_id, o.id, 'stripe', true
  FROM public.orders o
  WHERE o.user_id = NEW.id AND o.status = 'paid' AND o.program_id IS NOT NULL
  ON CONFLICT (user_id, program_id) DO UPDATE SET
    order_id = EXCLUDED.order_id, source = 'stripe', active = true, revoked_at = NULL;
  RETURN NEW;
END;
$$;
