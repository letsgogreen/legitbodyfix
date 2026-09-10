-- Third editorial pass: trunk and ankle observations seen during squat and stance.

UPDATE public.recipes
SET
  title = 'Excessive Forward Trunk Lean',
  goal = 'Explore ankle, hip, and trunk strategies that make squatting or lowering tasks feel more balanced.',
  summary = 'Forward trunk lean can be an efficient strategy depending on body proportions, load, and task. Explore it when the position is uncomfortable, difficult to control, or limits the activity you want to perform.',
  assessment_clues = 'Compare the same shallow squat with normal stance, light hand support, a small heel lift, and a reduced depth. Notice which change affects balance, symptoms, and effort; no single comparison identifies a diagnosis.',
  dosage = 'Choose 2–3 options. Perform 1–2 sets of 5–8 slow repetitions. Use the same squat depth when comparing options and stop before technique or symptoms deteriorate.',
  safety_notes = 'Stop for severe or rapidly increasing back or leg pain, new weakness or numbness, loss of balance, inability to bear weight, saddle numbness, or loss of bowel or bladder control. Significant trauma or progressive neurological symptoms require urgent assessment.',
  evidence = 'APTA Orthopedics — Low Back Pain Clinical Practice Guideline (2021)\nhttps://www.orthopt.org/uploads/content_files/files/jospt.2021.0304.pdf\nAPTA Orthopedics — Ankle Stability and Movement Coordination Clinical Practice Guideline (2021)\nhttps://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf',
  equipment = ARRAY['Chair or rail', 'Optional thin heel support']::text[],
  session_minutes = 10,
  progression_level = 'control'::public.recipe_progression_level,
  content_blocks = $json$[
    {"id":"ftl-context","type":"callout","title":"Forward lean is not automatically a fault","text":"Trunk angle changes with limb proportions, squat depth, load position, ankle motion, and the goal of the task. Judge the strategy by comfort and control."},
    {"id":"ftl-check","type":"heading","level":2,"text":"Quick comparison"},
    {"id":"ftl-check-list","type":"list","style":"numbered","items":["Perform a shallow squat at a comfortable stance width.","Repeat with fingertips on a stable support.","Repeat with a slightly smaller depth or a small heel lift.","Note which version changes balance, symptoms, or trunk effort without forcing an upright chest."]},
    {"id":"ftl-options","type":"heading","level":2,"text":"Movement options"},
    {"id":"ftl-options-list","type":"list","style":"bullet","items":["Supported squat: hold a rail and lower slowly while keeping pressure comfortable across the feet.","Ankle rock: keep the heel grounded and guide the knee forward through an easy range.","Hip hinge to wall: move the hips toward a wall and return without holding the breath.","Counterbalance squat: hold a light object in front and use only the depth you can control."]},
    {"id":"ftl-retest","type":"heading","level":2,"text":"Reassess"},
    {"id":"ftl-retest-text","type":"paragraph","text":"Repeat the original squat at the same depth. Keep the option that improves balance, comfort, or confidence rather than chasing a perfectly vertical torso."},
    {"id":"ftl-source-lbp","type":"button","label":"Examine low back pain evidence and limitations","url":"https://www.orthopt.org/uploads/content_files/files/jospt.2021.0304.pdf"},
    {"id":"ftl-source-ankle","type":"button","label":"Examine ankle stability evidence","url":"https://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf"}
  ]$json$::jsonb,
  instructions = 'Use the structured content blocks for the current guide.',
  review_status = 'published'::public.content_review_status,
  last_reviewed_at = '2026-09-11',
  updated_at = now()
WHERE slug = 'excessive-forward-trunk-leaning';

UPDATE public.recipes
SET
  title = 'Heel Rise During Squat',
  goal = 'Explore stance, depth, and ankle options that help the foot remain comfortably supported during a squat.',
  summary = 'Heels may rise because of squat depth, stance, balance strategy, footwear, or available ankle motion. The observation is useful for choosing a variation, not diagnosing one restricted structure.',
  assessment_clues = 'Compare a shallow and deeper squat, then repeat with light hand support or a small heel lift. Notice whether the heel rises before symptoms or loss of balance and whether both sides behave similarly.',
  dosage = 'Choose 2–3 options. Begin with 1–2 sets of 6–10 slow repetitions or 20 seconds of balance. Keep the heel down only within a comfortable, controlled range.',
  safety_notes = 'Stop for sharp ankle, foot, or calf pain; rapidly increasing swelling; inability to bear weight; new numbness or weakness; or symptoms after significant trauma. New one-sided calf swelling, warmth, or shortness of breath needs urgent assessment.',
  evidence = 'APTA Orthopedics — Ankle Stability and Movement Coordination Clinical Practice Guideline (2021)\nhttps://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf',
  equipment = ARRAY['Wall or rail', 'Optional thin heel support']::text[],
  session_minutes = 8,
  progression_level = 'mobility'::public.recipe_progression_level,
  content_blocks = $json$[
    {"id":"hr-context","type":"callout","title":"Match the squat to your available range","text":"A raised heel can be a balance strategy or a response to depth and stance. Start with a version that keeps you stable instead of forcing the heel down."},
    {"id":"hr-check","type":"heading","level":2,"text":"Quick comparison"},
    {"id":"hr-check-list","type":"list","style":"numbered","items":["Perform a shallow squat while holding a stable support.","Notice when either heel begins to lift.","Repeat with a wider stance or less depth.","Try a small heel support and compare balance, comfort, and range."]},
    {"id":"hr-options","type":"heading","level":2,"text":"Movement options"},
    {"id":"hr-options-list","type":"list","style":"bullet","items":["Supported ankle rock: move the knee forward over a comfortable toe line while the heel stays relaxed on the floor.","Slow calf raise: rise evenly, pause, and lower under control through a comfortable range.","Supported squat hold: pause briefly at a depth where the whole foot feels stable.","Depth progression: increase squat depth in small steps only while balance and heel contact remain comfortable."]},
    {"id":"hr-retest","type":"heading","level":2,"text":"Reassess"},
    {"id":"hr-retest-text","type":"paragraph","text":"Repeat the starting squat with the same support and depth. Improvement may be steadier balance, a later heel rise, or a more comfortable range—not necessarily a perfectly flat heel at every depth."},
    {"id":"hr-source","type":"button","label":"Examine ankle stability evidence","url":"https://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf"}
  ]$json$::jsonb,
  instructions = 'Use the structured content blocks for the current guide.',
  review_status = 'published'::public.content_review_status,
  last_reviewed_at = '2026-09-11',
  updated_at = now()
WHERE slug = 'heel-rise';

UPDATE public.recipes
SET
  title = 'Excessive Posterior Pelvic Tilt',
  goal = 'Explore comfortable pelvic, hip, and trunk movement without forcing the low back into one preferred curve.',
  summary = 'A posterior pelvic tilt can appear during sitting, standing, or loaded movement and may be a normal task strategy. Explore alternatives when it is paired with discomfort, stiffness, or reduced movement options.',
  assessment_clues = 'Compare relaxed standing, supported sitting, a hip hinge, and a squat. Notice whether the position changes with seat height, stance, breathing, or task depth and whether the change affects comfort.',
  dosage = 'Choose 2–3 options. Use 1–2 sets of 5–8 slow repetitions or 3–5 relaxed breaths. Work within a comfortable range and reassess the original task.',
  safety_notes = 'Stop for new or worsening leg weakness or numbness, saddle numbness, loss of bowel or bladder control, fever with back pain, major trauma, unexplained weight loss, or severe progressive night pain. Seek urgent assessment for neurological red flags.',
  evidence = 'WHO — Guideline for Non-surgical Management of Chronic Primary Low Back Pain (2023)\nhttps://www.who.int/publications/i/item/9789240081789\nAPTA Orthopedics — Low Back Pain Clinical Practice Guideline (2021)\nhttps://www.orthopt.org/uploads/content_files/files/jospt.2021.0304.pdf',
  equipment = ARRAY['Chair', 'Optional wall or rolled towel']::text[],
  session_minutes = 9,
  progression_level = 'control'::public.recipe_progression_level,
  content_blocks = $json$[
    {"id":"ppt-context","type":"callout","title":"Spinal curves naturally change","text":"There is no single pelvic angle that must be held all day. The aim is access to comfortable movement and more than one usable position."},
    {"id":"ppt-check","type":"heading","level":2,"text":"Quick movement check"},
    {"id":"ppt-check-list","type":"list","style":"numbered","items":["Sit near the front of a stable chair with the feet supported.","Gently explore a small forward and backward pelvic roll.","Find a comfortable middle area without bracing or holding the breath.","Stand and compare a small hip hinge or squat."]},
    {"id":"ppt-options","type":"heading","level":2,"text":"Movement options"},
    {"id":"ppt-options-list","type":"list","style":"bullet","items":["Seated pelvic exploration: slowly move between a small forward and backward roll, then relax in the middle.","Supported hip hinge: move the hips toward a wall while allowing the spine to stay comfortable.","Bridge: lift only through a range that avoids cramping, pain, or excessive bracing.","Chair-height experiment: adjust seat height or use a cushion and compare ease of sitting and standing."]},
    {"id":"ppt-retest","type":"heading","level":2,"text":"Reassess"},
    {"id":"ppt-retest-text","type":"paragraph","text":"Return to the original sitting, squat, or hinge task. Keep the movement option only if it improves comfort, ease, or confidence."},
    {"id":"ppt-source-who","type":"button","label":"Examine broad low back pain recommendations","url":"https://www.who.int/publications/i/item/9789240081789"},
    {"id":"ppt-source-apta","type":"button","label":"Examine low back pain evidence and limitations","url":"https://www.orthopt.org/uploads/content_files/files/jospt.2021.0304.pdf"}
  ]$json$::jsonb,
  instructions = 'Use the structured content blocks for the current guide.',
  review_status = 'published'::public.content_review_status,
  last_reviewed_at = '2026-09-11',
  updated_at = now()
WHERE slug = 'excessive-posterior-tilt';
