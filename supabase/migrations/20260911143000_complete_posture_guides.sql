-- Final editorial pass: asymmetry and frontal-plane lower-body observations.

UPDATE public.recipes
SET
  title = 'Asymmetric Weight Shift',
  goal = 'Explore comfortable left-to-right loading options during standing, squatting, stepping, and walking.',
  summary = 'People rarely load both sides exactly equally. A weight shift becomes useful to explore when it is new, painful, difficult to control, or clearly limits a task.',
  assessment_clues = 'Compare quiet standing, a shallow squat, and a low step on both sides. Notice symptoms, confidence, foot pressure, previous injury, fatigue, and whether light support changes the pattern.',
  dosage = 'Choose 2–3 options. Begin with 1–2 sets of 5–8 repetitions per side or 20 seconds of balance. Use support freely and progress only when both symptoms and control remain acceptable.',
  safety_notes = 'Stop for sudden weakness, new numbness, severe pain, inability to bear weight, repeated unexplained falls, marked swelling, or symptoms after significant trauma. A sudden new asymmetry with neurological symptoms needs urgent assessment.',
  evidence = 'APTA Orthopedics — Low Back Pain Clinical Practice Guideline (2021)\nhttps://www.orthopt.org/uploads/content_files/files/jospt.2021.0304.pdf\nAPTA Orthopedics — Ankle Stability and Movement Coordination Clinical Practice Guideline (2021)\nhttps://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf',
  equipment = ARRAY['Wall or rail', 'Optional low step']::text[],
  session_minutes = 10,
  progression_level = 'control'::public.recipe_progression_level,
  content_blocks = $json$[
    {"id":"aws-context","type":"callout","title":"Perfect symmetry is not required","text":"Small side-to-side differences are common. Focus on whether you can load each side comfortably and confidently enough for the task."},
    {"id":"aws-check","type":"heading","level":2,"text":"Quick movement check"},
    {"id":"aws-check-list","type":"list","style":"numbered","items":["Stand near a stable support and notice pressure under each foot.","Perform a shallow squat without deliberately centering yourself.","Step onto a low surface with each leg and compare.","Repeat the harder task with fingertip support or a smaller range."]},
    {"id":"aws-options","type":"heading","level":2,"text":"Movement options"},
    {"id":"aws-options-list","type":"list","style":"bullet","items":["Lateral weight shift: move the pelvis gently over one foot, pause, and return.","Supported march: alternate lifting one foot while keeping the trunk relaxed.","Low step-up: use a rail and step up slowly, then reset between repetitions.","Staggered sit-to-stand: place one foot slightly back and compare each setup without forcing equal effort."]},
    {"id":"aws-retest","type":"heading","level":2,"text":"Reassess"},
    {"id":"aws-retest-text","type":"paragraph","text":"Repeat the original squat, step, or walk. Look for improved comfort, confidence, or access to the less-used side rather than exact visual symmetry."},
    {"id":"aws-source-lbp","type":"button","label":"Read the APTA low back pain guideline","url":"https://www.orthopt.org/uploads/content_files/files/jospt.2021.0304.pdf"},
    {"id":"aws-source-ankle","type":"button","label":"Read the APTA ankle guideline","url":"https://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf"}
  ]$json$::jsonb,
  instructions = 'Use the structured content blocks for the current guide.',
  review_status = 'published'::public.content_review_status,
  last_reviewed_at = '2026-09-11',
  updated_at = now()
WHERE slug = 'asymmetric-weight-shift';

UPDATE public.recipes
SET
  title = 'Varus Knee (Knee Moving Outward)',
  goal = 'Explore foot, knee, and hip strategies that support comfortable squatting, stepping, and single-leg control.',
  summary = 'An outward knee position can reflect anatomy, stance, task strategy, or load. It is not automatically a problem; explore it when paired with pain, instability, or reduced function.',
  assessment_clues = 'Compare a shallow squat, step-down, and supported single-leg balance. Notice symptoms, foot pressure, trunk shift, speed, and whether stance width or support changes the task.',
  dosage = 'Choose 2–3 options. Begin with 1–2 sets of 5–8 controlled repetitions per side or 20 seconds of balance. Increase range before adding load.',
  safety_notes = 'Stop for sharp pain, significant swelling, locking, repeated giving way, inability to bear weight, or symptoms after a new injury. Rapid swelling or a pop during injury should be assessed promptly.',
  evidence = 'APTA Orthopedics — Patellofemoral Pain Clinical Practice Guideline (2019)\nhttps://www.orthopt.org/content/s/patellofemoral-pain-2019\nAPTA Orthopedics — Ankle Stability and Movement Coordination Clinical Practice Guideline (2021)\nhttps://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf',
  equipment = ARRAY['Wall or rail', 'Optional chair or step']::text[],
  session_minutes = 9,
  progression_level = 'control'::public.recipe_progression_level,
  content_blocks = $json$[
    {"id":"vk-out-context","type":"callout","title":"Alignment varies with anatomy and task","text":"Do not force the knee inward to match an ideal line. Explore a range where the whole foot feels supported and the task remains comfortable."},
    {"id":"vk-out-check","type":"heading","level":2,"text":"Quick movement check"},
    {"id":"vk-out-check-list","type":"list","style":"numbered","items":["Perform a shallow squat in your natural stance.","Notice knee comfort, balance, and pressure across the foot.","Repeat with a small change in stance width or light hand support.","Use the variation that improves comfort and control without forcing alignment."]},
    {"id":"vk-out-options","type":"heading","level":2,"text":"Movement options"},
    {"id":"vk-out-options-list","type":"list","style":"bullet","items":["Tripod balance: feel the heel and both sides of the forefoot while keeping the toes relaxed.","Supported sit-to-stand: rise slowly from a chair using a stance that feels stable.","Lateral weight shift: move over one foot and return while keeping the knee comfortable.","Low step-down: lower slowly from a small step with rail support, then reset."]},
    {"id":"vk-out-retest","type":"heading","level":2,"text":"Reassess"},
    {"id":"vk-out-retest-text","type":"paragraph","text":"Repeat the original task. Keep the option if it improves symptoms, balance, or confidence—not simply because the knee looks straighter."},
    {"id":"vk-out-source-knee","type":"button","label":"Review the APTA patellofemoral pain guideline","url":"https://www.orthopt.org/content/s/patellofemoral-pain-2019"},
    {"id":"vk-out-source-ankle","type":"button","label":"Read the APTA ankle guideline","url":"https://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf"}
  ]$json$::jsonb,
  instructions = 'Use the structured content blocks for the current guide.',
  review_status = 'published'::public.content_review_status,
  last_reviewed_at = '2026-09-11',
  updated_at = now()
WHERE slug = 'varus-knee';

UPDATE public.recipes
SET
  title = 'Foot Pronation During Movement',
  goal = 'Explore foot and ankle control while preserving comfortable, adaptable movement during standing, walking, and squatting.',
  summary = 'Pronation is a normal part of how the foot adapts to the ground. Explore the pattern when it is painful, difficult to control, markedly different between sides, or associated with reduced task tolerance.',
  assessment_clues = 'Compare relaxed standing, a calf raise, a shallow squat, and a few steps. Notice symptoms, balance, heel movement, toe gripping, and whether support or a smaller range changes the response.',
  dosage = 'Choose 2–3 options. Use 1–2 sets of 6–10 slow repetitions or 20 seconds of supported balance. Progress range and load gradually while symptoms remain acceptable.',
  safety_notes = 'Stop for sharp foot or ankle pain, rapidly increasing swelling, inability to bear weight, new numbness or weakness, skin color change, or symptoms after significant trauma. Persistent instability or progressive function loss warrants assessment.',
  evidence = 'APTA Orthopedics — Ankle Stability and Movement Coordination Clinical Practice Guideline (2021)\nhttps://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf',
  equipment = ARRAY['Wall or chair', 'Optional small step']::text[],
  session_minutes = 8,
  progression_level = 'control'::public.recipe_progression_level,
  content_blocks = $json$[
    {"id":"fp-context","type":"callout","title":"Pronation is a movement, not a diagnosis","text":"The arch is expected to change as the foot accepts and transfers load. The aim is adaptable, comfortable control—not holding a rigid arch."},
    {"id":"fp-check","type":"heading","level":2,"text":"Quick movement check"},
    {"id":"fp-check-list","type":"list","style":"numbered","items":["Stand near a support with the toes relaxed.","Shift weight gently toward one foot and notice pressure distribution.","Perform a slow calf raise and lower.","Compare sides and repeat with fingertip support if balance changes the result."]},
    {"id":"fp-options","type":"heading","level":2,"text":"Movement options"},
    {"id":"fp-options-list","type":"list","style":"bullet","items":["Foot-pressure exploration: shift gently between heel, inner forefoot, and outer forefoot, then find a comfortable middle.","Supported calf raise: rise and lower slowly without gripping the toes.","Single-leg balance with support: use fingertips and allow small natural adjustments at the foot.","Slow step-through: practice transferring weight from one foot to the other before returning to normal walking."]},
    {"id":"fp-retest","type":"heading","level":2,"text":"Reassess"},
    {"id":"fp-retest-text","type":"paragraph","text":"Repeat the original standing, walking, or squat task. Keep the option if it improves comfort, balance, or confidence without trying to freeze the arch."},
    {"id":"fp-source","type":"button","label":"Read the APTA ankle stability guideline","url":"https://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf"}
  ]$json$::jsonb,
  instructions = 'Use the structured content blocks for the current guide.',
  review_status = 'published'::public.content_review_status,
  last_reviewed_at = '2026-09-11',
  updated_at = now()
WHERE slug = 'valgus-foot';
