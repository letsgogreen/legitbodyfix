-- Customer identity, payment ledger and program access.

CREATE TABLE public.customer_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  customer_email text,
  stripe_checkout_session_id text UNIQUE,
  stripe_payment_intent_id text UNIQUE,
  amount_total integer NOT NULL DEFAULT 0 CHECK (amount_total >= 0),
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'failed', 'disputed')),
  purchased_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('stripe', 'manual', 'migration', 'promotion')),
  active boolean NOT NULL DEFAULT true,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, program_id)
);

CREATE INDEX orders_user_created_idx ON public.orders (user_id, created_at DESC);
CREATE INDEX orders_email_created_idx ON public.orders (customer_email, created_at DESC);
CREATE INDEX entitlements_user_active_idx ON public.entitlements (user_id, active);
CREATE INDEX entitlements_program_active_idx ON public.entitlements (program_id, active);

CREATE TRIGGER customer_profiles_updated_at BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER entitlements_updated_at BEFORE UPDATE ON public.entitlements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auth_user_customer_profile ON auth.users;
CREATE TRIGGER auth_user_customer_profile
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_customer_profile();

INSERT INTO public.customer_profiles (user_id, email, display_name)
SELECT id, email, COALESCE(raw_user_meta_data ->> 'name', raw_user_meta_data ->> 'full_name')
FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;

GRANT SELECT, UPDATE ON public.customer_profiles TO authenticated;
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.entitlements TO authenticated;
GRANT ALL ON public.customer_profiles, public.orders, public.entitlements TO service_role;

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers read own profile" ON public.customer_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Customers update own profile" ON public.customer_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage customer profiles" ON public.customer_profiles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Customers read own orders" ON public.orders
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage orders" ON public.orders
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Customers read own entitlements" ON public.entitlements
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage entitlements" ON public.entitlements
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Customers can see the curriculum metadata only for programs they own.
CREATE POLICY "Customers read entitled modules" ON public.program_modules
  FOR SELECT TO authenticated USING (
    published AND EXISTS (
      SELECT 1 FROM public.entitlements e
      WHERE e.user_id = auth.uid() AND e.program_id = program_modules.program_id AND e.active
    )
  );
CREATE POLICY "Customers read entitled lessons" ON public.lessons
  FOR SELECT TO authenticated USING (
    published AND EXISTS (
      SELECT 1 FROM public.entitlements e
      WHERE e.user_id = auth.uid() AND e.program_id = lessons.program_id AND e.active
    )
  );

-- Private Storage downloads are permitted only for an administrator or an active
-- owner of the published lesson whose video_path matches the requested object.
CREATE POLICY "Customers read entitled lesson videos" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'lesson-videos' AND EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.entitlements e ON e.program_id = l.program_id
      WHERE l.video_path = name
        AND l.published
        AND e.user_id = auth.uid()
        AND e.active
    )
  );
