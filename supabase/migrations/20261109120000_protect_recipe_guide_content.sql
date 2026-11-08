-- Public pages use recipe cards. Full instructions are read by the application server.
revoke select on table public.recipes from anon, public;

grant select (
  id, slug, title, goal, summary, regions, progression_level,
  image_url, image_alt, published, featured_rank
) on table public.recipes to anon;
