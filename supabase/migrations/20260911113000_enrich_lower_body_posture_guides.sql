-- Second editorial pass: lower-body movement observations.
-- These guides describe options to test, not diagnoses based on visual alignment.

UPDATE public.recipes
SET
  title = 'Knee Dominance',
  goal = 'Explore squat and step variations that distribute effort comfortably across the foot, knee, and hip.',
  summary = 'A knee-dominant strategy is one valid way to squat or step. It becomes worth exploring when it is paired with pain, limited options, poor control, or difficulty meeting the task.',
  assessment_clues = 'Compare a comfortable squat, sit-to-stand, and low step. Notice symptoms, balance, heel contact, and whether changing stance, depth, support, or tempo makes the task easier.',
  dosage = 'Choose 2–3 options. Start with 1–2 sets of 5–8 controlled repetitions. Keep effort moderate and reassess the original squat or step after each option.',
  safety_notes = 'Stop for sharp or rapidly increasing pain, marked swelling, locking, repeated giving way, inability to bear weight, or symptoms after significant trauma. New calf swelling, warmth, or shortness of breath requires urgent medical assessment.',
  evidence = 'APTA Orthopedics — Patellofemoral Pain Clinical Practice Guideline (2019)\nhttps://www.orthopt.org/content/s/patellofemoral-pain-2019\nAPTA — Patellofemoral Pain Clinical Summary\nhttps://www.apta.org/patient-care/evidence-based-practice-resources/clinical-summaries/patellofemoral-pain',
  equipment = ARRAY['Chair or box', 'Optional wall or rail']::text[],
  session_minutes = 10,
  progression_level = 'control'::public.recipe_progression_level,
  content_blocks = $json$[
    {"id":"kd-context","type":"callout","title":"Knees moving forward is not automatically harmful","text":"Squat style changes with body proportions, depth, load, and goal. Use symptoms and task quality—not one visual rule—to guide the variation."},
    {"id":"kd-check","type":"heading","level":2,"text":"Quick movement check"},
    {"id":"kd-check-list","type":"list","style":"numbered","items":["Perform a comfortable sit-to-stand or shallow squat.","Notice pain, balance, heel contact, and where effort is felt.","Repeat with light hand support or a slightly wider stance.","Compare the response instead of trying to make every repetition look identical."]},
    {"id":"kd-options","type":"heading","level":2,"text":"Movement options"},
    {"id":"kd-options-list","type":"list","style":"bullet","items":["Box squat: sit back to a stable chair or box, pause lightly, and stand without dropping or bouncing.","Supported split squat: hold a rail and lower only through a comfortable range while sharing pressure across both feet.","Hip hinge practice: move the hips toward a wall and return, keeping the feet grounded.","Tempo squat: lower for three seconds, pause briefly, and stand at a speed you can control."]},
    {"id":"kd-retest","type":"heading","level":2,"text":"Reassess"},
    {"id":"kd-retest-text","type":"paragraph","text":"Repeat the original squat or step. A useful option should improve comfort, balance, confidence, or control without creating a new symptom."},
    {"id":"kd-source","type":"button","label":"Examine patellofemoral pain evidence","url":"https://www.orthopt.org/content/s/patellofemoral-pain-2019"}
  ]$json$::jsonb,
  instructions = 'Use the structured content blocks for the current guide.',
  review_status = 'published'::public.content_review_status,
  last_reviewed_at = '2026-09-11',
  updated_at = now()
WHERE slug = 'knee-dominance';

UPDATE public.recipes
SET
  title = 'Valgus Knee (Knee Moving Inward)',
  goal = 'Explore comfortable control of the foot, knee, and hip during squats, steps, landings, and single-leg tasks.',
  summary = 'The knee may move inward during many normal tasks. The observation matters most when it is linked to pain, instability, a large side-to-side difference, or reduced task tolerance.',
  assessment_clues = 'Compare a shallow squat, step-down, and supported single-leg balance. Observe the whole task: foot pressure, trunk position, speed, fatigue, symptoms, and confidence.',
  dosage = 'Select 2–3 drills. Begin with 1–2 sets of 5–8 repetitions per side or 20 seconds of balance. Progress range or resistance only when control and symptoms remain acceptable.',
  safety_notes = 'Stop for sharp pain, significant swelling, locking, repeated giving way, inability to bear weight, or a new injury with a pop and rapid swelling. Seek assessment if instability or function is worsening.',
  evidence = 'APTA Orthopedics — Patellofemoral Pain Clinical Practice Guideline (2019)\nhttps://www.orthopt.org/content/s/patellofemoral-pain-2019\nAPTA Orthopedics — Patellofemoral Pain Decision Tree\nhttps://www.orthopt.org/uploads/content_files/files/Patellofemoral%20Knee%20Pain%20Decision%20Tree.pdf',
  equipment = ARRAY['Wall or rail', 'Optional step']::text[],
  session_minutes = 10,
  progression_level = 'control'::public.recipe_progression_level,
  content_blocks = $json$[
    {"id":"vk-context","type":"callout","title":"Movement is not a diagnosis","text":"Some inward knee motion is common. Do not judge the knee in isolation; consider pain, speed, fatigue, foot contact, hip strategy, and the demands of the task."},
    {"id":"vk-check","type":"heading","level":2,"text":"Quick movement check"},
    {"id":"vk-check-list","type":"list","style":"numbered","items":["Use a rail and perform a shallow step-down or small single-leg bend.","Notice symptoms, balance, and side-to-side differences.","Repeat more slowly or with a smaller range.","If the task becomes easier, use that version as the starting point."]},
    {"id":"vk-options","type":"heading","level":2,"text":"Movement options"},
    {"id":"vk-options-list","type":"list","style":"bullet","items":["Supported single-leg balance: keep the whole foot comfortable on the floor and use fingertip support as needed.","Slow step-down: lower from a small step with control, then use both feet to reset.","Sit-to-stand with target: rise from a chair while guiding the knee toward a comfortable target in front of the foot.","Lateral weight shift: move the pelvis over one foot and return without rushing or gripping the toes."]},
    {"id":"vk-retest","type":"heading","level":2,"text":"Reassess"},
    {"id":"vk-retest-text","type":"paragraph","text":"Repeat the original task at the same depth and speed. Look for an easier, more confident repetition rather than forcing perfect alignment."},
    {"id":"vk-source","type":"button","label":"Open the patellofemoral pain decision guide","url":"https://www.orthopt.org/uploads/content_files/files/Patellofemoral%20Knee%20Pain%20Decision%20Tree.pdf"}
  ]$json$::jsonb,
  instructions = 'Use the structured content blocks for the current guide.',
  review_status = 'published'::public.content_review_status,
  last_reviewed_at = '2026-09-11',
  updated_at = now()
WHERE slug = 'valgus-knee-knee-collapsing-inward';

UPDATE public.recipes
SET
  title = 'Feet Turn Out',
  goal = 'Explore stance and ankle-foot options that make squatting and walking feel comfortable and stable.',
  summary = 'Feet may point outward because of anatomy, habit, stance width, available ankle motion, or the task. A turned-out foot is not automatically a fault that needs correction.',
  assessment_clues = 'Compare your natural stance with a slightly narrower or wider stance. Notice whether heel contact, balance, knee comfort, and squat depth change. Do not force both feet to point straight ahead.',
  dosage = 'Choose 2–3 options. Use 1–2 sets of 6–10 slow repetitions or 20–30 seconds per side. Reassess walking or squatting before increasing range.',
  safety_notes = 'Stop for sharp pain, rapidly increasing swelling, inability to bear weight, new numbness or weakness, or symptoms after major trauma. Persistent instability or repeated ankle giving way should be professionally assessed.',
  evidence = 'APTA Orthopedics — Ankle Stability and Movement Coordination Clinical Practice Guideline (2021)\nhttps://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf',
  equipment = ARRAY['Wall or chair', 'Optional small step']::text[],
  session_minutes = 8,
  progression_level = 'control'::public.recipe_progression_level,
  content_blocks = $json$[
    {"id":"fto-context","type":"callout","title":"Your natural foot angle may be appropriate","text":"Hip and shin anatomy differ between people. The goal is not parallel feet at all costs; it is a stance that supports a comfortable, stable task."},
    {"id":"fto-check","type":"heading","level":2,"text":"Quick movement check"},
    {"id":"fto-check-list","type":"list","style":"numbered","items":["Stand in the foot angle that feels natural.","Perform a shallow squat while noticing heel contact, balance, and symptoms.","Try a small change in stance width before changing foot angle.","Compare comfort and control; do not force the toes inward."]},
    {"id":"fto-options","type":"heading","level":2,"text":"Movement options"},
    {"id":"fto-options-list","type":"list","style":"bullet","items":["Supported ankle rock: with the heel down, move the knee forward over a comfortable toe line and return.","Calf raise: rise through a comfortable pressure path across the forefoot, then lower slowly.","Tripod balance: feel contact under the heel and both sides of the forefoot without gripping the toes.","Stance experiment: test small changes in width and toe angle, keeping the version that improves the task."]},
    {"id":"fto-retest","type":"heading","level":2,"text":"Reassess"},
    {"id":"fto-retest-text","type":"paragraph","text":"Repeat the original walk or squat. Keep the option only if it improves comfort, balance, or range without forcing the foot into a rigid position."},
    {"id":"fto-source","type":"button","label":"Examine ankle stability evidence","url":"https://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf"}
  ]$json$::jsonb,
  instructions = 'Use the structured content blocks for the current guide.',
  review_status = 'published'::public.content_review_status,
  last_reviewed_at = '2026-09-11',
  updated_at = now()
WHERE slug = 'feet-turn-out';
