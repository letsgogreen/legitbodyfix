-- Source links should support critical appraisal, not imply that institutional authority settles the question.

UPDATE public.recipes
SET
  content_blocks = replace(
    replace(
      replace(
        replace(
          replace(
            replace(
              replace(
                replace(
                  replace(
                    replace(content_blocks::text,
                      'Read the APTA neck pain guideline', 'Examine neck pain evidence and limitations'),
                    'Review OSHA monitor setup guidance', 'Compare workstation setup options'),
                  'Read the shoulder rehabilitation guideline', 'Examine shoulder rehabilitation evidence'),
                'Review OSHA working-position guidance', 'Compare working-position options'),
              'Read the WHO low back pain guideline', 'Examine broad low back pain recommendations'),
            'Read the APTA low back pain guideline', 'Examine low back pain evidence and limitations'),
          'Review the APTA patellofemoral pain guideline', 'Examine patellofemoral pain evidence'),
        'Read the APTA ankle stability guideline', 'Examine ankle stability evidence'),
      'Read the APTA ankle guideline', 'Examine ankle stability evidence'),
    'Read the APTA patellofemoral pain guideline', 'Examine patellofemoral pain evidence')::jsonb,
  updated_at = now()
WHERE slug IN (
  'asymmetric-weight-shift',
  'excessive-anterior-pelvic-tilt',
  'excessive-forward-trunk-leaning',
  'excessive-posterior-tilt',
  'feet-turn-out',
  'forward-head-posture',
  'heel-rise',
  'knee-dominance',
  'rib-flare',
  'round-shoulder',
  'scapula-anterior-tilt',
  'shoulder-elevation',
  'valgus-foot',
  'valgus-knee-knee-collapsing-inward',
  'varus-knee'
);
