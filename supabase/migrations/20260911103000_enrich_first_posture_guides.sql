-- First editorial pass for the most visible Posture & Movement guides.
-- The language deliberately treats posture as an observation rather than a diagnosis.

UPDATE public.recipes
SET
  title = 'Forward Head Posture',
  goal = 'Explore a more comfortable head and neck position without forcing a single “perfect” posture.',
  summary = 'A forward head position is a common observation, not a diagnosis by itself. Use workstation changes and low-load movement to see whether comfort, control, or task tolerance improves.',
  assessment_clues = 'Notice when the position appears and whether it changes with back support, screen height, visual effort, breathing, or a brief movement break. Compare comfort and ease of movement rather than trying to hold a rigid pose.',
  dosage = 'Choose 2–3 options. Use 1–2 sets of 5–8 slow repetitions or 20–30 seconds of comfortable movement. Recheck the task that felt restricted before adding more.',
  safety_notes = 'Stop if movement causes dizziness, faintness, a severe or unusual headache, new numbness or weakness, loss of balance, or pain spreading into the arm. Seek urgent assessment after significant trauma or with rapidly worsening neurological symptoms.',
  evidence = 'APTA Orthopedics — Neck Pain Clinical Practice Guideline (2017)\nhttps://www.orthopt.org/uploads/content_files/files/Neck%20Pain%20CPG%20-%20Revision%202017.pdf\nOSHA — Computer Workstation Monitor Guidance\nhttps://www.osha.gov/etools/computer-workstations/components/monitors',
  equipment = ARRAY['Chair or wall', 'Optional rolled towel']::text[],
  session_minutes = 8,
  progression_level = 'control'::public.recipe_progression_level,
  content_blocks = $json$[
    {"id":"fhp-context","type":"callout","title":"Start with context","text":"Head position changes with the task, vision, fatigue, breathing, and workstation setup. Treat the position as a clue—not proof of damage."},
    {"id":"fhp-check","type":"heading","level":2,"text":"Quick check"},
    {"id":"fhp-check-list","type":"list","style":"numbered","items":["Sit with your back supported and feet comfortable.","Look straight ahead without lifting or dropping the chin.","Notice effort, stiffness, and breathing for 10 seconds.","Change the screen or back support, then compare. A useful change should feel easier, not forced."]},
    {"id":"fhp-options","type":"heading","level":2,"text":"Movement options"},
    {"id":"fhp-options-list","type":"list","style":"bullet","items":["Gentle head glide: slide the head straight back a small distance while keeping the eyes level; relax fully between repetitions.","Supported upper-back extension: sit against a chair back or rolled towel and gently open the upper chest without pushing the neck backward.","Easy rotation: turn left and right only through a comfortable range while keeping the jaw relaxed.","Workstation reset: place the primary screen in front of you, make text easy to read, and change position regularly."]},
    {"id":"fhp-retest","type":"heading","level":2,"text":"Reassess"},
    {"id":"fhp-retest-text","type":"paragraph","text":"Return to the activity that prompted the check. Keep an option only if movement feels easier, symptoms stay the same or improve, and you can breathe normally."},
    {"id":"fhp-source-cpg","type":"button","label":"Read the APTA neck pain guideline","url":"https://www.orthopt.org/uploads/content_files/files/Neck%20Pain%20CPG%20-%20Revision%202017.pdf"},
    {"id":"fhp-source-osha","type":"button","label":"Review OSHA monitor setup guidance","url":"https://www.osha.gov/etools/computer-workstations/components/monitors"}
  ]$json$::jsonb,
  instructions = 'Use the structured content blocks for the current guide.',
  review_status = 'published'::public.content_review_status,
  last_reviewed_at = '2026-09-11',
  updated_at = now()
WHERE slug = 'forward-head-posture';

UPDATE public.recipes
SET
  title = 'Rounded Shoulders',
  goal = 'Explore shoulder and upper-back positions that make reaching, pushing, and pulling feel easier.',
  summary = 'Shoulders resting forward can reflect habit, task demands, anatomy, or fatigue. Resting appearance alone does not diagnose a problem; movement comfort and function matter more.',
  assessment_clues = 'Compare the resting position with an easy arm raise, wall reach, or light row. Notice whether upper-back support, a smaller range, or slower motion improves comfort without pinching or shrugging.',
  dosage = 'Pick 2–3 drills. Begin with 1–2 sets of 6–10 controlled repetitions. Use a range that stays comfortable and reassess the original reach or press between drills.',
  safety_notes = 'Stop for sharp or rapidly increasing shoulder pain, a new inability to lift the arm, visible deformity, new numbness or weakness, chest pain, or symptoms following significant trauma. Persistent night pain or steadily declining function warrants professional assessment.',
  evidence = 'APTA-endorsed Rotator Cuff Tendinopathy Clinical Practice Guideline (2025)\nhttps://www.orthopt.org/uploads/content_files/files/Rotator_Cuff_CPG.pdf\nOSHA — Good Working Positions\nhttps://www.osha.gov/etools/computer-workstations/positions',
  equipment = ARRAY['Wall', 'Optional light resistance band']::text[],
  session_minutes = 10,
  progression_level = 'control'::public.recipe_progression_level,
  content_blocks = $json$[
    {"id":"rs-context","type":"callout","title":"Appearance is not the whole story","text":"A rounded resting position can be normal and pain-free. Use this guide to explore movement options, not to force the shoulders backward all day."},
    {"id":"rs-check","type":"heading","level":2,"text":"Quick movement check"},
    {"id":"rs-check-list","type":"list","style":"numbered","items":["Raise both arms only as high as is comfortable.","Notice pinching, shrugging, breath holding, or a large side-to-side difference.","Repeat with the upper back supported or with a slightly smaller range.","Use the comparison to choose a drill; it is not a diagnosis."]},
    {"id":"rs-options","type":"heading","level":2,"text":"Movement options"},
    {"id":"rs-options-list","type":"list","style":"bullet","items":["Wall reach: gently reach the arms forward so the shoulder blades glide around the ribs, then return without squeezing hard.","Supported arm slide: slide the forearms up a wall through an easy range while keeping the neck relaxed.","Light row: draw the elbows back with low resistance and finish before the shoulders tip forward or shrug.","Position change: alternate between supported sitting, standing, and short movement breaks instead of holding one posture."]},
    {"id":"rs-retest","type":"heading","level":2,"text":"Reassess"},
    {"id":"rs-retest-text","type":"paragraph","text":"Repeat the original reach or light press. A useful option should improve ease, confidence, or range without producing a painful pinch."},
    {"id":"rs-source-cpg","type":"button","label":"Read the shoulder rehabilitation guideline","url":"https://www.orthopt.org/uploads/content_files/files/Rotator_Cuff_CPG.pdf"},
    {"id":"rs-source-osha","type":"button","label":"Review OSHA working-position guidance","url":"https://www.osha.gov/etools/computer-workstations/positions"}
  ]$json$::jsonb,
  instructions = 'Use the structured content blocks for the current guide.',
  review_status = 'published'::public.content_review_status,
  last_reviewed_at = '2026-09-11',
  updated_at = now()
WHERE slug = 'round-shoulder';

UPDATE public.recipes
SET
  goal = 'Explore pelvic and trunk-control options without treating pelvic angle as a diagnosis or forcing a neutral position.',
  summary = 'An anterior pelvic tilt is an observation that can vary with stance, anatomy, breathing, and the task. Focus on comfort, function, and change after movement rather than appearance alone.',
  assessment_clues = 'Observe the position during relaxed standing, a squat, and a hip hinge. Compare with a wider stance, heel support, slower breathing, or a smaller range. A visible tilt without pain or limitation may not need correction.',
  dosage = 'Choose 2–3 options. Start with 1–2 sets of 5–8 slow repetitions or 3–5 breaths. Progress only when the target task stays comfortable and controlled.',
  safety_notes = 'Stop for new or worsening leg weakness or numbness, saddle numbness, loss of bowel or bladder control, fever with back pain, major trauma, unexplained weight loss, or severe progressive night pain. Seek urgent medical assessment for neurological red flags.',
  evidence = 'WHO — Guideline for Non-surgical Management of Chronic Primary Low Back Pain (2023)\nhttps://www.who.int/publications/i/item/9789240081789\nAPTA Orthopedics — Low Back Pain Clinical Practice Guideline (2021)\nhttps://www.orthopt.org/uploads/content_files/files/jospt.2021.0304.pdf',
  equipment = ARRAY['Floor or mat', 'Optional wall or chair']::text[],
  session_minutes = 10,
  progression_level = 'control'::public.recipe_progression_level,
  content_blocks = $json$[
    {"id":"apt-context","type":"callout","title":"Do not chase a perfect pelvic angle","text":"Pelvic position varies between people and tasks. The useful target is a movement strategy that is comfortable, repeatable, and appropriate for what you need to do."},
    {"id":"apt-check","type":"heading","level":2,"text":"Quick movement check"},
    {"id":"apt-check-list","type":"list","style":"numbered","items":["Stand comfortably and note symptoms—not just appearance.","Try a small squat or hip hinge without forcing the low back flat.","Repeat with a slower exhale, a smaller range, or light hand support.","Choose the variation that feels easier and more controlled."]},
    {"id":"apt-options","type":"heading","level":2,"text":"Movement options"},
    {"id":"apt-options-list","type":"list","style":"bullet","items":["Breathing reset: lie or sit supported and take 3–5 slow breaths, allowing the ribs and abdomen to move without pushing the back into the floor.","Supported hip hinge: send the hips back toward a wall while keeping pressure balanced through the feet.","Bridge: lift the pelvis only as high as you can without pain, cramping, or breath holding.","Split-stance weight shift: shift forward and back gently while keeping both feet grounded and the trunk relaxed."]},
    {"id":"apt-retest","type":"heading","level":2,"text":"Reassess"},
    {"id":"apt-retest-text","type":"paragraph","text":"Repeat the original squat, hinge, standing task, or walk. Keep the drill only if it improves comfort, confidence, or movement options."},
    {"id":"apt-source-who","type":"button","label":"Read the WHO low back pain guideline","url":"https://www.who.int/publications/i/item/9789240081789"},
    {"id":"apt-source-apta","type":"button","label":"Read the APTA low back pain guideline","url":"https://www.orthopt.org/uploads/content_files/files/jospt.2021.0304.pdf"}
  ]$json$::jsonb,
  instructions = 'Use the structured content blocks for the current guide.',
  review_status = 'published'::public.content_review_status,
  last_reviewed_at = '2026-09-11',
  updated_at = now()
WHERE slug = 'excessive-anterior-pelvic-tilt';
