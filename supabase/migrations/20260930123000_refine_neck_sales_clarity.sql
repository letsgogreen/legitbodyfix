update public.program_sales_pages
set content = jsonb_set(
  jsonb_set(
    jsonb_set(
      content,
      '{landingSummary}',
      to_jsonb(
        'Follow a structured sequence of inhibition, activation, and integration to practice neck control and connect it with coordinated scapular movement.'::text
      )
    ),
    '{curriculum,0,description}',
    to_jsonb(
      'Learn how to select an appropriate target and adjust the pressure based on your own response.'::text
    )
  ),
  '{curriculum,1,description}',
  to_jsonb(
    'Practice deep-neck-flexor control without letting larger surface muscles dominate the movement.'::text
  )
)
where video_id = 'neck-alignment';
