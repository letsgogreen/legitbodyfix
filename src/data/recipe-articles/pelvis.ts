import type { PatternArticle } from "./types.ts";

export const pelvisArticles: Record<string, PatternArticle> = {
  "excessive-anterior-pelvic-tilt": {
    title: "Anterior pelvic tilt: what is actually changing?",
    intro: [
      "From the side, the pelvis may appear tipped forward while the lower back looks more arched. That outline can appear in relaxed standing, or become more noticeable during a reach or a leg movement. The useful starting point is to distinguish the position you see from the movement that produces it.",
      "Anterior pelvic tilt means the pelvis rotating forward relative to its reference position. It is not another name for lumbar extension, and it is not automatically a measurement of short hip flexors or weak abdominals.",
    ],
    sections: [
      {
        heading: "A resting angle is not the same as a movement problem",
        paragraphs: [
          "Some anterior tilt is common in people without symptoms. In a study of 120 healthy young adults, most participants had anterior tilt when assessed using pelvic landmarks. That does not make every degree of tilt unimportant; it means that the presence of tilt alone is not a useful definition of 'excessive'.",
          "The bones also affect the measurement. Research on pelvic specimens found substantial variation in landmark angles even when the specimens were held in the same reference orientation. Comparing two people's outlines therefore mixes posture with anatomy. A change within the same person's movement answers a different question from a comparison of resting photographs.",
        ],
        evidence: ["pelvicStandingVariation", "pelvicLandmarks"],
      },
      {
        heading: "Muscle length, tension and strength are different questions",
        paragraphs: [
          "The muscle cards help explain which tissues may participate in the pattern, but their tight/weak categories are not test results for the reader. A study of 31 healthy adults found weak relationships between its abdominal-performance measure, standing pelvic tilt and lumbar lordosis. It does not support reading abdominal strength directly from a pelvic angle.",
          "Hamstrings illustrate a different distinction. In a cadaver experiment with the legs fixed, increasing anterior pelvic tilt lengthened hamstring tissue. That demonstrates a mechanical length change, not weakness. A muscle's position in the movement, its passive tension and its ability to produce force need to be considered separately.",
        ],
        evidence: ["abdominalPelvicAngle", "pelvicHamstringLength"],
      },
      {
        heading: "Pelvic orientation also changes the hip's starting conditions",
        paragraphs: [
          "The hip socket moves with the pelvis. Its orientation therefore affects the relationship between the socket and the thigh as the hip flexes or rotates. In computer models of hips with femoroacetabular impingement, increasing anterior tilt reduced available internal rotation in flexed positions before bony contact.",
          "This provides a reason to consider pelvic orientation alongside hip motion. It does not show that every anteriorly tilted pelvis has impingement, that a photograph identifies the available range, or that everyone should tuck the pelvis to squat.",
        ],
        evidence: ["pelvicHipOrientation"],
      },
      {
        heading: "Where the related patterns fit",
        paragraphs: [
          "Rib flare is relevant when the front ribs lift as the trunk extends during the same task. It helps separate a chest-wall or trunk change from pelvic rotation, rather than assume one caused the other.",
          "Posterior pelvic tilt provides a comparison in the other direction. A person can begin a squat in anterior tilt and rotate backward later in the descent. Describing that sequence is more useful than trying to keep the pelvis at one fixed angle throughout the movement.",
        ],
      },
    ],
    interpretation:
      "Here, 'excessive' is a description that needs task-specific context, not a diagnosis made from a universal angle. The muscle cards and related recipes are reference models to explore; pelvic appearance alone cannot establish a specific muscle deficit, the cause of pain or a need to correct a resting posture.",
    connections: [
      {
        slug: "rib-flare",
        reason:
          "If the front ribs lift during the same reach or trunk extension, distinguish that movement from the pelvis rotating forward.",
      },
      {
        slug: "excessive-posterior-tilt",
        reason:
          "Compare a forward-tipped starting position with backward pelvic rotation later in a squat. This is a movement comparison, not a prescription to tuck the pelvis.",
      },
    ],
  },
  "excessive-posterior-tilt": {
    title: "What happens when the pelvis tucks under?",
    intro: [
      "Near the bottom of a squat, the pelvis may begin to roll backward and the lower-back curve may change. The important distinction is between a pelvis that rests in this orientation and a pelvis that rotates as the task becomes deeper. Those are not the same observation.",
    ],
    sections: [
      {
        heading: "The hips and pelvis share the descent",
        paragraphs: [
          "As the thighs move toward the trunk, hip flexion and pelvic movement contribute together. A visible tuck therefore needs to be described alongside squat depth and thigh position. It is not a direct measurement of hamstring length. Studies tracking healthy hips show that pelvic motion is part of weight-bearing movement, rather than something that remains fixed throughout.",
        ],
        evidence: ["hipPelvis"],
      },
      {
        heading: "Hip position can change the options available",
        paragraphs: [
          "The hip's position relative to the pelvis matters as much as how low the body travels. Foot placement, rotation and the chosen task can change that relationship. If a person cannot comfortably accommodate the next part of the descent at the hip, an earlier stop or a different pelvic strategy is a possibility to investigate.",
          "In symptomatic hip-impingement research, constraining the squat changed hip and pelvic behaviour without producing a between-group depth difference. This supports examining the strategy, not using a pelvic tuck to diagnose impingement.",
        ],
        evidence: ["hipTask"],
      },
      {
        heading: "A dropped chest can be a different event",
        paragraphs: [
          "Forward trunk inclination describes the torso's direction. Posterior pelvic tilt describes rotation of the pelvis. A person can lean forward without a visible tuck, or tuck near the bottom after the trunk has already inclined. Following their timing is more informative than putting both under the label 'rounding'.",
          "Anterior pelvic tilt is included below as a directional comparison: the pelvis can move between orientations during the same repetition. The aim of this comparison is to understand movement, not to select one angle to hold all day.",
        ],
      },
    ],
    interpretation:
      "Neither a photograph nor the presence of a tuck establishes injury risk or a specific tight/weak muscle combination. Depth, load, symptoms and the ability to control the task provide context for assessment.",
    connections: [
      {
        slug: "excessive-forward-trunk-leaning",
        reason:
          "Distinguish torso inclination from the pelvis rolling backward, especially near the bottom of a squat.",
      },
      {
        slug: "excessive-anterior-pelvic-tilt",
        reason:
          "Compare forward and backward pelvic rotation rather than treating either resting angle as the whole movement.",
      },
    ],
  },
  "asymmetric-weight-shift": {
    title: "Why might your pelvis shift to one side during a squat?",
    intro: [
      "As you lower into a squat, your pelvis may drift toward one foot. One side of the pelvis may also sit higher, while the trunk leans or a knee changes direction. Together these can look like one 'hip shift', but they describe different parts of the movement.",
      "In this recipe, 'same side' means the side where the pelvis is higher; 'opposite side' means the other side. These muscle-card labels do not refer to the direction of the sideways shift. For example, a higher right pelvis and a shift to the left are two separate observations, not conflicting descriptions.",
    ],
    sections: [
      {
        heading: "First separate shifting, hiking and turning",
        paragraphs: [
          "A lateral shift is the pelvis travelling sideways relative to the feet. A pelvic hike is one side becoming higher. Rotation is the pelvis turning. Any two can occur together, but seeing one does not tell you the direction or size of the others.",
          "This distinction matters when reading the muscle cards. A muscle listed on the higher side is not automatically on the side the person shifts toward. Describe the visible movement first, then use a consistent reference for the side labels.",
        ],
      },
      {
        heading: "The two hips and ankles may offer different options",
        paragraphs: [
          "As a squat gets deeper, each ankle needs to accommodate shin movement while each hip accommodates the changing thigh–pelvis relationship. If the available motion differs between sides, moving the pelvis sideways is one possible way the person may organise the descent.",
          "A university report of a 40-person overhead-squat thesis found less hip abduction and ankle dorsiflexion, and greater hip internal-rotation range, on the side shifted toward compared with the side shifted away from. The report also suggested differences in gluteus medius activation. These preliminary findings concern the shift direction, not necessarily the higher side of the pelvis.",
          "This makes hip and ankle differences worth investigating. It does not turn the observed shift into proof that the higher-side adductors are short or that the opposite piriformis is responsible. Muscle activity measured during a task is also different from muscle strength or resting length.",
        ],
        evidence: ["lateralShiftThesis"],
      },
      {
        heading: "A visible shift can accompany unequal loading",
        paragraphs: [
          "Pelvic position can be relevant to how the legs share the task. In 17 collegiate athletes after ACL reconstruction, medial–lateral hip position correlated with asymmetry in vertical ground-reaction forces and knee-extension moments during double-leg squats.",
          "The finding gives a reason to pay attention to a shift, but a photograph is not a pair of force plates. It cannot tell you the percentage of load under each foot, and a more centred-looking pelvis does not guarantee equal demand at the knees. Those findings also come from a postoperative group, not every person who squats.",
        ],
        evidence: ["squatLoadAsymmetry"],
      },
      {
        heading: "Which accompanying patterns are worth exploring?",
        paragraphs: [
          "If one heel rises at the same stage of the descent, heel contact and ankle motion become useful companions to examine. If a knee moves inward relative to its foot, that knee path adds another observation. Neither should replace the description of where the pelvis travels or which side is higher.",
          "These are the two related recipes selected below. They are there to clarify a feature actually seen in the movement, rather than imply that every hip shift begins at the foot or always includes an inward-moving knee.",
        ],
      },
      {
        heading: "Asymmetry is a finding, not a complete explanation",
        paragraphs: [
          "Small side-to-side differences are not exclusive to people with symptoms. A biplane-radiography study of 24 asymptomatic young adults documented differences in hip kinematics during walking and squatting. It did not establish an acceptable size for a visible pelvic shift.",
          "For this recipe, the useful description is specific: which side is higher, which direction the pelvis moves, and whether that relationship changes between the descent and ascent. These details provide a better starting point than assigning a complete muscle-imbalance pattern from one image.",
        ],
        evidence: ["healthyHipAsymmetry"],
      },
    ],
    interpretation:
      "The higher-side convention keeps this recipe's muscle labels consistent; it is not a research-validated diagnosis. The muscle cards describe the recipe's reference model, while the studies above support more limited observations about mobility, coordination and loading. A visible shift alone does not establish leg-length discrepancy or identify a muscle that requires treatment.",
    connections: [
      {
        slug: "heel-rise",
        reason:
          "If a heel lifts as the pelvis drifts, compare the timing of heel contact and sideways movement. The higher pelvic side and the lifting heel need not be the same side.",
      },
      {
        slug: "valgus-knee-knee-collapsing-inward",
        reason: "If a knee moves inward during the shift, distinguish its path relative to the foot from the pelvis's sideways travel and height difference.",
      },
    ],
  },
  "rib-flare": {
    title: "When the front ribs lift during movement",
    intro: [
      "While reaching overhead, the lower front ribs may become more prominent as the chest lifts. A similar outline can also be visible at rest. The first question is not which muscle is weak, but whether you are seeing ribcage movement, a whole-trunk lean, a change in the lower-back curve, or a combination.",
    ],
    sections: [
      {
        heading: "Breathing movement is not a fixed posture",
        paragraphs: [
          "The chest wall changes shape during breathing, and its contribution relative to the abdomen changes with body position. Research in healthy adults demonstrates this variability. It does not validate rib flare as a breathing diagnosis.",
          "Keep the observation specific: ribs moving with a breath differ from a trunk that extends as an arm rises. A visible lower-rib outline by itself cannot show whether the diaphragm is functioning well.",
        ],
        evidence: ["breathing"],
      },
      {
        heading: "An overhead reach is not only a shoulder-joint movement",
        paragraphs: [
          "Watch the relationship between the rising arm and the torso. If the arm travels higher while the trunk leans back, some of the visible reach comes from trunk movement. That is a description of how the task is completed, not proof that the shoulder is blocked.",
          "Thoracic-position experiments show that the upper body's starting posture can change shoulder and scapular mechanics. This gives a reason to consider the shoulder region alongside the trunk, without claiming that a rib position caused a shoulder problem.",
        ],
        evidence: ["thoraxShoulder"],
      },
      {
        heading: "Where pelvic tilt and scapular tilt fit",
        paragraphs: [
          "If the pelvis tips forward and the lower back arches with the rising ribs, the anterior-pelvic-tilt recipe helps separate those motions. If the lower tip of a shoulder blade becomes prominent during the same reach, scapular anterior tilt is another observation to distinguish.",
          "These connections are about different parts participating in one task. They do not imply that a person must force the ribs down, tuck the pelvis or pin the shoulder blades in place.",
        ],
      },
    ],
    interpretation:
      "Evidence for a visible 'rib-flare syndrome' and a predictable muscle-correction sequence is limited. This article uses the term descriptively and does not infer respiratory impairment or a treatment need from appearance.",
    connections: [
      {
        slug: "excessive-anterior-pelvic-tilt",
        reason: "Separate a forward-tipping pelvis and lumbar arch from the lower ribs lifting.",
      },
      {
        slug: "scapula-anterior-tilt",
        reason:
          "Compare shoulder-blade tilt with trunk movement during an overhead reach; one does not establish the cause of the other.",
      },
    ],
  },
};
