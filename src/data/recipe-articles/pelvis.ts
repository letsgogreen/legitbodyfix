import type { PatternArticle } from "./types.ts";

export const pelvisArticles: Record<string, PatternArticle> = {
  "excessive-anterior-pelvic-tilt": {
    title: "When the pelvis tips forward, what else is moving?",
    intro: [
      "From the side, the front of the pelvis may appear lower and the lower-back curve more visible. That snapshot describes an orientation. To understand its role in movement, separate what the pelvis does from what the ribs, lumbar spine and thighs do around it.",
    ],
    sections: [
      {
        heading: "Pelvic tilt and a back arch are related, but not interchangeable",
        paragraphs: [
          "Anterior tilt is the pelvis rotating forward; lumbar extension is the lower back arching. They can occur together, but one visible curve cannot tell you the exact contribution of each. Even the angle between pelvic landmarks is influenced by the shape of the bones, so comparing two people's photographs is not a precise comparison of their movement.",
        ],
        evidence: ["pelvicLandmarks"],
      },
      {
        heading: "Why rib position belongs in the picture",
        paragraphs: [
          "During a reach, the front ribs may lift while the pelvis also tips forward. Ask whether the extra height comes from the arm moving overhead, the whole trunk leaning back, or the lower back extending. The rib-flare recipe follows this distinction; it is not evidence that the ribs caused the pelvic position.",
          "Breathing adds another source of chest-wall movement. A ribcage changing shape with a breath is not the same observation as a sustained trunk position. Looking at both prevents every visible rib movement from being labelled a compensation.",
        ],
        evidence: ["breathing"],
      },
      {
        heading: "The direction can change during a squat",
        paragraphs: [
          "A pelvis that starts tipped forward may rotate backward farther into a squat. Hip movement is the thigh moving relative to the pelvis, not just the thigh moving relative to the room. Healthy-hip research documents this coordination during weight-bearing tasks.",
          "That is why posterior pelvic tilt is a useful comparison, rather than the opposite diagnosis. If there is also a sideways shift, consider that separately: forward/backward rotation and left/right translation are different dimensions of the movement.",
        ],
        evidence: ["hipPelvis"],
      },
    ],
    interpretation:
      "Use changes within the same person and task to describe the pattern. A resting pelvic angle alone does not establish shortened hip flexors, weak abdominals, or the source of back pain.",
    connections: [
      {
        slug: "rib-flare",
        reason:
          "Separate front-rib movement from pelvic rotation when the trunk extends during a reach.",
      },
      {
        slug: "excessive-posterior-tilt",
        reason:
          "Compare the starting pelvic position with the backward rotation that may appear at greater squat depth.",
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
