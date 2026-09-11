-- Complete and publish the ten anatomy records linked to the Forward Head Posture
-- guide that were still drafts in production. The copy mirrors the bundled,
-- source-linked muscle dictionary and does not make diagnostic claims.

WITH completed (
  id, name, anatomical_group, muscle_family, origin, insertion, functions,
  description, image_url, image_alt, image_credit, image_source_url,
  image_license, source_name, source_url, body_map, related_video_ids
) AS (
  VALUES
    (
      'longus-capitis', 'Longus capitis', 'Head and neck', 'Prevertebral muscles',
      'Anterior tubercles of the transverse processes of the third through sixth cervical vertebrae',
      'Basilar part of the occipital bone',
      ARRAY['Flexes the head and upper cervical spine', 'Contributes to anterior cervical control']::text[],
      'A deep prevertebral neck muscle that connects the mid-cervical transverse processes to the base of the skull and contributes to controlled head flexion.',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Longus%20capitis.png',
      'Gray''s Anatomy anterior neck plate highlighting longus capitis from the cervical transverse processes to the occiput',
      'Gray''s Anatomy, modified by Uwe Gille, Wikimedia Commons, public domain',
      'https://commons.wikimedia.org/wiki/File:Longus_capitis.png', 'Public domain',
      'OpenStax Anatomy and Physiology 2e — Head, Neck, and Back',
      'https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back',
      'head-neck', 'neck-alignment'
    ),
    (
      'longus-colli', 'Longus colli', 'Head and neck', 'Prevertebral muscles',
      'Anterior surfaces of the upper thoracic and lower cervical vertebral bodies and cervical transverse processes',
      'Anterior tubercle of the atlas, upper cervical vertebral bodies, and cervical transverse processes',
      ARRAY['Flexes and stabilizes the cervical spine', 'Assists slight rotation to the opposite side']::text[],
      'A deep prevertebral muscle running along the front of the cervical spine that contributes to neck flexion and segmental cervical control.',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Longus%20colli.png',
      'Gray''s Anatomy anterior neck plate highlighting longus colli along the cervical vertebral bodies',
      'Gray''s Anatomy, modified by Uwe Gille, Wikimedia Commons, public domain',
      'https://commons.wikimedia.org/wiki/File:Longus_colli.png', 'Public domain',
      'OpenStax Anatomy and Physiology 2e — Head, Neck, and Back',
      'https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back',
      'head-neck', 'neck-alignment'
    ),
    (
      'obliquus-capitis-inferior', 'Obliquus capitis inferior', 'Suboccipital neck', NULL,
      'Spinous process of C2', 'Transverse process of C1',
      ARRAY['Rotates the atlas and head toward the working side', 'Stabilizes the atlantoaxial region']::text[],
      'One of the four suboccipital muscles, spanning C2 to C1 and contributing to same-side upper-cervical rotation and fine positional control.',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Obliquus_capitis_inferior_muscle_animation_small.gif',
      'Rotating Anatomography model highlighting the obliquus capitis inferior muscle',
      'Anatomography / DBCLS, Wikimedia Commons, CC BY-SA 2.1 JP',
      'https://commons.wikimedia.org/wiki/File:Obliquus_capitis_inferior_muscle_animation_small.gif', 'CC BY-SA 2.1 JP',
      'NCBI Bookshelf, Occipitocervical Anatomy', 'https://www.ncbi.nlm.nih.gov/books/NBK617531/',
      'head-neck', 'neck-alignment'
    ),
    (
      'obliquus-capitis-superior', 'Obliquus capitis superior', 'Suboccipital neck', NULL,
      'Transverse process of C1', 'Occipital bone between the superior and inferior nuchal lines',
      ARRAY['Extends the head', 'Laterally flexes the head', 'Supports fine upper-cervical control']::text[],
      'A small suboccipital muscle connecting C1 to the occipital bone and contributing to head extension, lateral flexion, and fine positional control.',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Obliquus_capitis_superior_muscle_-_animation02.gif',
      'Rotating Anatomography model highlighting the obliquus capitis superior muscle',
      'Anatomography / DBCLS, Wikimedia Commons, CC BY-SA 2.1 JP',
      'https://commons.wikimedia.org/wiki/File:Obliquus_capitis_superior_muscle_-_animation02.gif', 'CC BY-SA 2.1 JP',
      'NCBI Bookshelf, Occipitocervical Anatomy', 'https://www.ncbi.nlm.nih.gov/books/NBK617531/',
      'head-neck', 'neck-alignment'
    ),
    (
      'pectoralis-major', 'Pectoralis major', 'Chest', NULL,
      'Medial clavicle, sternum, and costal cartilages of the upper ribs',
      'Lateral lip of the intertubercular sulcus of the humerus',
      ARRAY['Adducts the arm', 'Medially rotates the arm', 'Clavicular fibers assist shoulder flexion']::text[],
      'A broad superficial chest muscle that links the clavicle, sternum, and upper ribs to the humerus and contributes to pressing and bringing the arm across the body.',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Pectoralis-major.png',
      'Anterior Gray''s Anatomy plate highlighting the pectoralis major muscle',
      'Gray''s Anatomy, colorized by Michael Gasperl, Wikimedia Commons, public domain',
      'https://commons.wikimedia.org/wiki/File:Pectoralis-major.png', 'Public domain',
      'OpenStax Anatomy and Physiology 2e — Pectoral Girdle and Upper Limbs',
      'https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs',
      'chest', 'neck-alignment'
    ),
    (
      'rectus-capitis-posterior-major', 'Rectus capitis posterior major', 'Suboccipital neck', NULL,
      'Spinous process of C2', 'Lateral portion of the inferior nuchal line of the occipital bone',
      ARRAY['Extends the head', 'Rotates the head toward the working side', 'Supports fine upper-cervical control']::text[],
      'A suboccipital muscle extending from C2 to the occiput that contributes to head extension, same-side rotation, and fine upper-cervical control.',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rectus_capitis_posterior_major_muscle_animation_small.gif',
      'Rotating Anatomography model highlighting the rectus capitis posterior major muscle',
      'Anatomography / DBCLS, Wikimedia Commons, CC BY-SA 2.1 JP',
      'https://commons.wikimedia.org/wiki/File:Rectus_capitis_posterior_major_muscle_animation_small.gif', 'CC BY-SA 2.1 JP',
      'NCBI Bookshelf, Occipitocervical Anatomy', 'https://www.ncbi.nlm.nih.gov/books/NBK617531/',
      'head-neck', 'neck-alignment'
    ),
    (
      'rectus-capitis-posterior-minor', 'Rectus capitis posterior minor', 'Suboccipital neck', NULL,
      'Posterior tubercle of C1', 'Medial portion of the inferior nuchal line of the occipital bone',
      ARRAY['Extends the head', 'Contributes to fine stabilization of the atlanto-occipital region']::text[],
      'A small suboccipital muscle spanning C1 to the occiput that assists head extension and fine stabilization at the atlanto-occipital region.',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rectus_capitis_posterior_minor_muscle_animation_small.gif',
      'Rotating Anatomography model highlighting the rectus capitis posterior minor muscle',
      'Anatomography / DBCLS, Wikimedia Commons, CC BY-SA 2.1 JP',
      'https://commons.wikimedia.org/wiki/File:Rectus_capitis_posterior_minor_muscle_animation_small.gif', 'CC BY-SA 2.1 JP',
      'NCBI Bookshelf, Occipitocervical Anatomy', 'https://www.ncbi.nlm.nih.gov/books/NBK617531/',
      'head-neck', 'neck-alignment'
    ),
    (
      'rhomboid-major', 'Rhomboid major', 'Upper back', NULL,
      'Spinous processes of the upper thoracic vertebrae',
      'Medial border of the scapula from the scapular spine to the inferior angle',
      ARRAY['Retracts the scapula', 'Downwardly rotates the scapula', 'Helps hold the scapula against the thoracic wall']::text[],
      'An upper-back muscle running from the thoracic spine to the medial border of the scapula and contributing to scapular retraction and control.',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rhomboideus_major.png',
      'Posterior anatomical illustration highlighting the rhomboid major muscle',
      'Modified by Uwe Gille, Wikimedia Commons, public domain',
      'https://commons.wikimedia.org/wiki/File:Rhomboideus_major.png', 'Public domain',
      'OpenStax Anatomy and Physiology 2e — Pectoral Girdle and Upper Limbs',
      'https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs',
      'shoulder', 'neck-alignment'
    ),
    (
      'rhomboid-minor', 'Rhomboid minor', 'Upper back', NULL,
      'Ligamentum nuchae and spinous processes of the seventh cervical and first thoracic vertebrae',
      'Medial end of the scapular spine',
      ARRAY['Retracts the scapula', 'Downwardly rotates the scapula', 'Helps secure the scapula to the thoracic wall']::text[],
      'A small upper-back muscle connecting the lower neck and upper thoracic spine to the scapular spine and contributing to scapular retraction and control.',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rhomboid_minor_muscle_back.png',
      'Posterior anatomical illustration highlighting the rhomboid minor',
      'Anatomography, Wikimedia Commons, CC BY-SA 2.1 JP',
      'https://commons.wikimedia.org/wiki/File:Rhomboid_minor_muscle_back.png', 'CC BY-SA 2.1 JP',
      'OpenStax Anatomy and Physiology 2e — Pectoral Girdle and Upper Limbs',
      'https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs',
      'shoulder', 'neck-alignment'
    ),
    (
      'sternocleidomastoid', 'Sternocleidomastoid', 'Head and neck', 'Superficial neck',
      'Manubrium of the sternum and medial clavicle',
      'Mastoid process of the temporal bone and lateral superior nuchal line',
      ARRAY['Bilaterally flexes the neck', 'Laterally flexes to the same side', 'Rotates the head to the opposite side']::text[],
      'A prominent superficial neck muscle connecting the sternum and clavicle to the skull and contributing to neck flexion, lateral flexion, and head rotation.',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Sternocleidomastoideus.png',
      'Lateral anatomical illustration highlighting the sternocleidomastoid muscle',
      'Gray''s Anatomy, modified by Uwe Gille, Wikimedia Commons, public domain',
      'https://commons.wikimedia.org/wiki/File:Sternocleidomastoideus.png', 'Public domain',
      'OpenStax Anatomy and Physiology 2e — Head, Neck, and Back',
      'https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back',
      'head-neck', 'neck-alignment'
    )
)
UPDATE public.muscles AS muscle
SET
  name = completed.name,
  slug = completed.id,
  anatomical_group = completed.anatomical_group,
  muscle_family = completed.muscle_family,
  origin = completed.origin,
  insertion = completed.insertion,
  functions = completed.functions,
  description = completed.description,
  image_url = completed.image_url,
  image_alt = completed.image_alt,
  image_credit = completed.image_credit,
  image_source_url = completed.image_source_url,
  image_license = completed.image_license,
  source_name = completed.source_name,
  source_url = completed.source_url,
  body_map = completed.body_map,
  related_video_ids = completed.related_video_ids,
  anatomy_approved_at = COALESCE(muscle.anatomy_approved_at, now()),
  image_approved_at = COALESCE(muscle.image_approved_at, now()),
  image_status = 'approved'::public.image_review_status,
  review_status = 'published'::public.content_review_status,
  published = true,
  published_at = COALESCE(muscle.published_at, now()),
  updated_at = now()
FROM completed
WHERE muscle.id = completed.id;

DO $$
DECLARE
  published_count integer;
BEGIN
  SELECT count(*)
  INTO published_count
  FROM public.muscles
  WHERE id IN (
    'longus-capitis',
    'longus-colli',
    'obliquus-capitis-inferior',
    'obliquus-capitis-superior',
    'pectoralis-major',
    'rectus-capitis-posterior-major',
    'rectus-capitis-posterior-minor',
    'rhomboid-major',
    'rhomboid-minor',
    'sternocleidomastoid'
  )
  AND published = true;

  IF published_count <> 10 THEN
    RAISE EXCEPTION 'Expected 10 completed Forward Head Posture muscle records, found %.', published_count;
  END IF;
END;
$$;
