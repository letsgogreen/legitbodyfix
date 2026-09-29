update public.program_sales_pages
set content = jsonb_set(
  jsonb_set(
    content,
    '{curriculum,0,title}',
    to_jsonb('Carefully designed inhibition techniques'::text)
  ),
  '{curriculum,0,description}',
  to_jsonb(
    'Apply targeted inhibition techniques with the muscle choice and intensity adapted to the individual response.'::text
  )
)
where video_id = 'neck-alignment'
  and content #>> '{curriculum,0,title}' = 'Reduce unnecessary tension';
