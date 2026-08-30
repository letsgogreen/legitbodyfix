-- Restore the canonical Notion recipe-to-muscle relationships in the user-owned
-- backend. Only exact atlas entries and high-confidence aliases/group expansions
-- are included. Ambiguous groups (for example Core stabilizers and Hip flexors)
-- intentionally remain for editorial review rather than being guessed here.

WITH links(recipe_slug, role, muscle_name) AS (
  VALUES
    -- Asymmetric weight shift
    ('asymmetric-weight-shift', 'tight', 'Quadratus lumborum'),
    ('asymmetric-weight-shift', 'tight', 'Tensor fasciae latae'),
    ('asymmetric-weight-shift', 'tight', 'Piriformis'),
    ('asymmetric-weight-shift', 'tight', 'Adductor brevis'),
    ('asymmetric-weight-shift', 'tight', 'Adductor longus'),
    ('asymmetric-weight-shift', 'tight', 'Adductor magnus'),
    ('asymmetric-weight-shift', 'weak', 'Gluteus medius'),

    -- Pelvic position
    ('excessive-anterior-pelvic-tilt', 'tight', 'Quadratus lumborum'),
    ('excessive-anterior-pelvic-tilt', 'tight', 'Tensor fasciae latae'),
    ('excessive-anterior-pelvic-tilt', 'tight', 'Rectus femoris'),
    ('excessive-anterior-pelvic-tilt', 'weak', 'Gluteus medius'),
    ('excessive-anterior-pelvic-tilt', 'weak', 'Biceps femoris'),
    ('excessive-anterior-pelvic-tilt', 'weak', 'Semimembranosus'),
    ('excessive-anterior-pelvic-tilt', 'weak', 'Semitendinosus'),
    ('excessive-anterior-pelvic-tilt', 'weak', 'Rectus abdominis'),
    ('excessive-posterior-tilt', 'tight', 'Rectus abdominis'),
    ('excessive-posterior-tilt', 'tight', 'Piriformis'),
    ('excessive-posterior-tilt', 'tight', 'Gluteus medius'),
    ('excessive-posterior-tilt', 'weak', 'Latissimus dorsi'),

    -- Squat and foot observations
    ('excessive-forward-trunk-leaning', 'tight', 'Gastrocnemius'),
    ('excessive-forward-trunk-leaning', 'tight', 'Tensor fasciae latae'),
    ('excessive-forward-trunk-leaning', 'tight', 'Rectus femoris'),
    ('excessive-forward-trunk-leaning', 'tight', 'Soleus'),
    ('excessive-forward-trunk-leaning', 'weak', 'Tibialis anterior'),
    ('feet-turn-out', 'tight', 'Gastrocnemius'),
    ('feet-turn-out', 'tight', 'Biceps femoris'),
    ('feet-turn-out', 'weak', 'Semimembranosus'),
    ('feet-turn-out', 'weak', 'Semitendinosus'),
    ('feet-turn-out', 'weak', 'Gastrocnemius'),
    ('heel-rise', 'tight', 'Gastrocnemius'),
    ('heel-rise', 'tight', 'Soleus'),
    ('heel-rise', 'weak', 'Tibialis anterior'),

    -- Head, shoulder and rib cage
    ('forward-head-posture', 'tight', 'Sternocleidomastoid'),
    ('forward-head-posture', 'tight', 'Pectoralis minor'),
    ('forward-head-posture', 'tight', 'Pectoralis major'),
    ('forward-head-posture', 'tight', 'Upper trapezius'),
    ('forward-head-posture', 'tight', 'Obliquus capitis inferior'),
    ('forward-head-posture', 'tight', 'Obliquus capitis superior'),
    ('forward-head-posture', 'tight', 'Rectus capitis posterior major'),
    ('forward-head-posture', 'tight', 'Rectus capitis posterior minor'),
    ('forward-head-posture', 'weak', 'Longus capitis'),
    ('forward-head-posture', 'weak', 'Longus colli'),
    ('forward-head-posture', 'weak', 'Lower trapezius'),
    ('forward-head-posture', 'weak', 'Rhomboid major'),
    ('forward-head-posture', 'weak', 'Rhomboid minor'),
    ('rib-flare', 'tight', 'Pectoralis minor'),
    ('rib-flare', 'tight', 'Serratus anterior'),
    ('rib-flare', 'tight', 'Serratus posterior inferior'),
    ('rib-flare', 'tight', 'Serratus posterior superior'),
    ('rib-flare', 'weak', 'External oblique'),
    ('rib-flare', 'weak', 'Rectus abdominis'),
    ('round-shoulder', 'tight', 'Pectoralis minor'),
    ('round-shoulder', 'tight', 'Pectoralis major'),
    ('round-shoulder', 'tight', 'Latissimus dorsi'),
    ('round-shoulder', 'weak', 'Rhomboid major'),
    ('round-shoulder', 'weak', 'Rhomboid minor'),
    ('round-shoulder', 'weak', 'Lower trapezius'),
    ('round-shoulder', 'weak', 'Middle trapezius'),
    ('scapula-anterior-tilt', 'tight', 'Pectoralis minor'),
    ('scapula-anterior-tilt', 'tight', 'Latissimus dorsi'),
    ('scapula-anterior-tilt', 'tight', 'Coracobrachialis'),
    ('scapula-anterior-tilt', 'weak', 'Lower trapezius'),
    ('scapula-anterior-tilt', 'weak', 'Serratus anterior'),
    ('shoulder-elevation', 'tight', 'Pectoralis minor'),
    ('shoulder-elevation', 'tight', 'Upper trapezius'),
    ('shoulder-elevation', 'tight', 'Levator scapulae'),
    ('shoulder-elevation', 'weak', 'Serratus anterior'),
    ('shoulder-elevation', 'weak', 'Lower trapezius'),

    -- Knee and lower-limb alignment
    ('knee-dominance', 'tight', 'Soleus'),
    ('knee-dominance', 'tight', 'Rectus femoris'),
    ('knee-dominance', 'tight', 'Vastus intermedius'),
    ('knee-dominance', 'tight', 'Vastus lateralis'),
    ('knee-dominance', 'tight', 'Vastus medialis'),
    ('knee-dominance', 'weak', 'Gluteus maximus'),
    ('valgus-foot', 'tight', 'Fibularis brevis'),
    ('valgus-foot', 'tight', 'Fibularis longus'),
    ('valgus-foot', 'tight', 'Fibularis tertius'),
    ('valgus-foot', 'tight', 'Gastrocnemius'),
    ('valgus-foot', 'tight', 'Soleus'),
    ('valgus-foot', 'tight', 'Tensor fasciae latae'),
    ('valgus-foot', 'weak', 'Tibialis anterior'),
    ('valgus-foot', 'weak', 'Gluteus medius'),
    ('valgus-knee-knee-collapsing-inward', 'tight', 'Tensor fasciae latae'),
    ('valgus-knee-knee-collapsing-inward', 'tight', 'Biceps femoris'),
    ('valgus-knee-knee-collapsing-inward', 'tight', 'Adductor brevis'),
    ('valgus-knee-knee-collapsing-inward', 'tight', 'Adductor longus'),
    ('valgus-knee-knee-collapsing-inward', 'tight', 'Adductor magnus'),
    ('valgus-knee-knee-collapsing-inward', 'tight', 'Fibularis brevis'),
    ('valgus-knee-knee-collapsing-inward', 'tight', 'Fibularis longus'),
    ('valgus-knee-knee-collapsing-inward', 'tight', 'Fibularis tertius'),
    ('valgus-knee-knee-collapsing-inward', 'weak', 'Gluteus medius'),
    ('valgus-knee-knee-collapsing-inward', 'weak', 'Gluteus maximus'),
    ('valgus-knee-knee-collapsing-inward', 'weak', 'Popliteus'),
    ('varus-foot', 'tight', 'Tibialis posterior'),
    ('varus-foot', 'tight', 'Flexor digitorum longus'),
    ('varus-foot', 'tight', 'Fibularis longus'),
    ('varus-foot', 'tight', 'Flexor hallucis brevis'),
    ('varus-foot', 'weak', 'Fibularis brevis'),
    ('varus-foot', 'weak', 'Fibularis longus'),
    ('varus-foot', 'weak', 'Fibularis tertius'),
    ('varus-foot', 'weak', 'Tibialis anterior'),
    ('varus-knee', 'tight', 'Adductor magnus'),
    ('varus-knee', 'tight', 'Tensor fasciae latae'),
    ('varus-knee', 'tight', 'Piriformis'),
    ('varus-knee', 'weak', 'Gluteus maximus'),
    ('varus-knee', 'weak', 'Gluteus medius')
), resolved AS (
  SELECT r.id AS recipe_id, m.id AS muscle_id, l.role::public.recipe_muscle_role AS role
  FROM links l
  JOIN public.recipes r ON r.slug = l.recipe_slug
  JOIN public.muscles m ON lower(m.name) = lower(l.muscle_name)
)
INSERT INTO public.recipe_muscles (recipe_id, muscle_id, role)
SELECT recipe_id, muscle_id, role FROM resolved
ON CONFLICT (recipe_id, muscle_id, role) DO NOTHING;
