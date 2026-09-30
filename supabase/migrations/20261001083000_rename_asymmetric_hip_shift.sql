update public.recipes
set
  title = 'Asymmetric Hip Shift',
  updated_at = now()
where slug = 'asymmetric-weight-shift'
  and title is distinct from 'Asymmetric Hip Shift';
