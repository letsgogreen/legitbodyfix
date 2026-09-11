-- Restore the existing Forward Head Posture cover uploaded through the admin editor.
-- A stale proxy URL referenced a different recipe id and a file that does not exist.
UPDATE public.recipes
SET image_url = 'https://choyenazxmlcnnyayozy.supabase.co/storage/v1/object/public/recipe-images/recipes/4685fa64-ecaf-46f1-9540-8e023a732445/1789049541062-b31252_b1c287034958401f9ffebf920117d781-mv2.avif'
WHERE id = '4685fa64-ecaf-46f1-9540-8e023a732445'
  AND slug = 'forward-head-posture';
