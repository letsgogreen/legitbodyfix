-- Fourth editorial pass: shoulder girdle and rib-cage movement observations.

UPDATE public.recipes
SET
  title = 'Shoulder Elevation',
  goal = 'Explore neck, shoulder-blade, and arm strategies that make reaching and carrying feel easier.',
  summary = 'Shoulders naturally elevate during many reaching and loading tasks. Explore the pattern when it is paired with neck effort, pain, asymmetry, or reduced task tolerance rather than trying to keep the shoulders down at all times.',
  assessment_clues = 'Compare relaxed arm elevation, a supported wall slide, and a light carry. Notice neck tension, breath holding, painful range, side-to-side differences, and whether support changes the response.',
  dosage = 'Choose 2–3 options. Begin with 1–2 sets of 5–8 controlled repetitions or a 20-second light carry. Stop before shrugging becomes forced or symptoms increase.',
  safety_notes = 'Stop for sharp or rapidly increasing shoulder or neck pain, new arm weakness or numbness, a new inability to raise the arm, visible deformity, chest pain, or symptoms after significant trauma. Worsening neurological symptoms require assessment.',
  evidence = 'APTA-endorsed Rotator Cuff Tendinopathy Clinical Practice Guideline (2025)\nhttps://www.orthopt.org/uploads/content_files/files/Rotator_Cuff_CPG.pdf\nAPTA Orthopedics — Neck Pain Clinical Practice Guideline (2017)\nhttps://www.orthopt.org/uploads/content_files/files/Neck%20Pain%20CPG%20-%20Revision%202017.pdf',
  equipment = ARRAY['Wall', 'Optional light weight']::text[],
  session_minutes = 9,
  progression_level = 'control'::public.recipe_progression_level,
  content_blocks = $json$[
    {"id":"se-context","type":"callout","title":"The shoulder blade is meant to move","text":"Upward rotation and some elevation are normal during arm raising. The goal is a comfortable, coordinated reach—not pinning the shoulders down."},
    {"id":"se-check","type":"heading","level":2,"text":"Quick movement check"},
    {"id":"se-check-list","type":"list","style":"numbered","items":["Raise both arms only through a comfortable range.","Notice neck effort, breath holding, pain, and side-to-side differences.","Repeat with the forearms supported on a wall.","Compare whether support improves ease or range without forcing the shoulders downward."]},
    {"id":"se-options","type":"heading","level":2,"text":"Movement options"},
    {"id":"se-options-list","type":"list","style":"bullet","items":["Forearm wall slide: gently slide upward while allowing the shoulder blades to rotate and the neck to stay relaxed.","Supported reach: rest the forearm on a surface and reach forward without holding the breath.","Light carry: hold a light object at the side and walk slowly without deliberately depressing the shoulder.","Easy neck rotation: turn left and right through a comfortable range between reaching sets."]},
    {"id":"se-retest","type":"heading","level":2,"text":"Reassess"},
    {"id":"se-retest-text","type":"paragraph","text":"Repeat the original reach or carry. Keep the option if it improves comfort, range, confidence, or neck relaxation."},
    {"id":"se-source-shoulder","type":"button","label":"Examine shoulder rehabilitation evidence","url":"https://www.orthopt.org/uploads/content_files/files/Rotator_Cuff_CPG.pdf"},
    {"id":"se-source-neck","type":"button","label":"Examine neck pain evidence and limitations","url":"https://www.orthopt.org/uploads/content_files/files/Neck%20Pain%20CPG%20-%20Revision%202017.pdf"}
  ]$json$::jsonb,
  instructions = 'Use the structured content blocks for the current guide.',
  review_status = 'published'::public.content_review_status,
  last_reviewed_at = '2026-09-11',
  updated_at = now()
WHERE slug = 'shoulder-elevation';

UPDATE public.recipes
SET
  title = 'Rib Flare',
  goal = 'Explore breathing, trunk, and reaching options without forcing the ribs into a fixed position.',
  summary = 'The lower ribs may appear prominent because of anatomy, breathing strategy, trunk position, or the task. Appearance alone is not a diagnosis; focus on comfort, breathing ease, and movement choices.',
  assessment_clues = 'Observe relaxed breathing, an overhead reach, and a supported squat or hinge. Notice whether the rib position changes with a slower exhale, arm support, or a smaller range and whether symptoms change with it.',
  dosage = 'Choose 2–3 options. Use 3–5 slow breaths or 1–2 sets of 5–8 controlled repetitions. Avoid prolonged breath holding or forceful abdominal bracing.',
  safety_notes = 'Stop for chest pain, faintness, unusual shortness of breath, severe abdominal or back pain, new numbness or weakness, or symptoms following significant trauma. Breathing difficulty or chest pressure requires urgent medical assessment.',
  evidence = 'WHO — Guideline for Non-surgical Management of Chronic Primary Low Back Pain (2023)\nhttps://www.who.int/publications/i/item/9789240081789\nAPTA Orthopedics — Low Back Pain Clinical Practice Guideline (2021)\nhttps://www.orthopt.org/uploads/content_files/files/jospt.2021.0304.pdf',
  equipment = ARRAY['Wall or chair', 'Optional light object']::text[],
  session_minutes = 8,
  progression_level = 'reset_tolerance'::public.recipe_progression_level,
  content_blocks = $json$[
    {"id":"rf-context","type":"callout","title":"Ribs should not be held down all day","text":"The rib cage expands and changes shape with breathing and movement. Explore control without compressing the breath or forcing a rigid trunk."},
    {"id":"rf-check","type":"heading","level":2,"text":"Quick movement check"},
    {"id":"rf-check-list","type":"list","style":"numbered","items":["Sit or lie in a supported position and breathe normally.","Notice where the breath moves without trying to change it.","Take a slow, comfortable exhale and then breathe in quietly.","Repeat an easy arm reach and compare comfort and breath holding."]},
    {"id":"rf-options","type":"heading","level":2,"text":"Movement options"},
    {"id":"rf-options-list","type":"list","style":"bullet","items":["Supported breathing: rest the arms and take 3–5 quiet breaths into the sides and back of the rib cage.","Wall reach: gently reach the arms forward while allowing the upper back to widen.","Half-kneeling reach: use a supported stance and reach one arm forward or overhead only as far as breathing stays easy.","Hip hinge with exhale: begin the hinge during a relaxed exhale, then return without bracing hard."]},
    {"id":"rf-retest","type":"heading","level":2,"text":"Reassess"},
    {"id":"rf-retest-text","type":"paragraph","text":"Return to the original reach, stance, or hinge. Keep the option if breathing stays easier and the task feels more comfortable or controlled."},
    {"id":"rf-source-who","type":"button","label":"Examine broad low back pain recommendations","url":"https://www.who.int/publications/i/item/9789240081789"},
    {"id":"rf-source-apta","type":"button","label":"Examine low back pain evidence and limitations","url":"https://www.orthopt.org/uploads/content_files/files/jospt.2021.0304.pdf"}
  ]$json$::jsonb,
  instructions = 'Use the structured content blocks for the current guide.',
  review_status = 'published'::public.content_review_status,
  last_reviewed_at = '2026-09-11',
  updated_at = now()
WHERE slug = 'rib-flare';

UPDATE public.recipes
SET
  title = 'Scapular Anterior Tilt',
  goal = 'Explore shoulder-blade and arm movement that improves reaching comfort without forcing the scapula into one resting position.',
  summary = 'The shoulder blade changes orientation as the arm moves, and resting position varies between people. Explore anterior tilt only when it accompanies pain, poor control, or limited reaching—not from appearance alone.',
  assessment_clues = 'Compare an arm raise, wall slide, and supported reach. Notice painful range, neck effort, winging under load, and whether slower motion or forearm support changes comfort or control.',
  dosage = 'Choose 2–3 options. Begin with 1–2 sets of 6–10 slow repetitions. Use a pain-free or acceptable range and progress only when the shoulder remains calm afterward.',
  safety_notes = 'Stop for sharp or rapidly increasing pain, new arm weakness or numbness, a sudden inability to raise the arm, visible deformity, or symptoms after trauma. Persistent night pain or steadily declining function warrants assessment.',
  evidence = 'APTA-endorsed Rotator Cuff Tendinopathy Clinical Practice Guideline (2025)\nhttps://www.orthopt.org/uploads/content_files/files/Rotator_Cuff_CPG.pdf',
  equipment = ARRAY['Wall', 'Optional light resistance band']::text[],
  session_minutes = 10,
  progression_level = 'control'::public.recipe_progression_level,
  content_blocks = $json$[
    {"id":"sat-context","type":"callout","title":"Do not pin the shoulder blade","text":"The scapula should rotate, tilt, and glide during arm movement. The aim is coordinated motion that fits the task, not a permanently retracted position."},
    {"id":"sat-check","type":"heading","level":2,"text":"Quick movement check"},
    {"id":"sat-check-list","type":"list","style":"numbered","items":["Raise one arm slowly through a comfortable range.","Notice pain, neck effort, breath holding, or a large side-to-side difference.","Repeat with the forearm sliding on a wall.","Compare ease and range without squeezing the shoulder blades together."]},
    {"id":"sat-options","type":"heading","level":2,"text":"Movement options"},
    {"id":"sat-options-list","type":"list","style":"bullet","items":["Wall slide: keep light forearm contact and allow the shoulder blade to move as the arm rises.","Wall push-up plus: perform a small wall push-up, then gently reach the chest away from the wall.","Supported external rotation: rest the elbow on a towel or surface and rotate through a comfortable range.","Light row and release: pull with low resistance, then fully allow the shoulder blade to glide forward again."]},
    {"id":"sat-retest","type":"heading","level":2,"text":"Reassess"},
    {"id":"sat-retest-text","type":"paragraph","text":"Repeat the original reach. Keep the option if the arm moves with less effort or discomfort and without a forced shoulder-blade position."},
    {"id":"sat-source","type":"button","label":"Examine shoulder rehabilitation evidence","url":"https://www.orthopt.org/uploads/content_files/files/Rotator_Cuff_CPG.pdf"}
  ]$json$::jsonb,
  instructions = 'Use the structured content blocks for the current guide.',
  review_status = 'published'::public.content_review_status,
  last_reviewed_at = '2026-09-11',
  updated_at = now()
WHERE slug = 'scapula-anterior-tilt';
