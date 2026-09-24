INSERT INTO public.site_copy (key, value, updated_at)
VALUES (
  'about_credentials_body',
  E'NASM Corrective Exercise Specialization (CES)\nNational Academy of Sports Medicine (NASM)\n\nNASM Corrective Exercise Specialists focus on movement using their skills to assess and correct muscle imbalances and movement compensations. They develop customized plans that enhance mobility and performance, as well as proactive and preventive programs that reduce the risk of future injuries.',
  now()
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = EXCLUDED.updated_at
WHERE trim(public.site_copy.value) = '';
