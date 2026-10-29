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
    title: "Understanding asymmetric hip shift",
    intro: [
      "We often work with people whose pelvis sits higher on one side or shifts sideways as they move. Some feel no discomfort and only notice the difference in a photograph taken from behind. Others come to us because everyday movement feels uncomfortable or awkward.",
      "What first appears to be an uneven pelvis becomes more useful to understand when we look at the whole movement: how the hips turn, where the knees travel, and how each foot meets the ground.",
    ],
    sections: [
      {
        heading: "Repeated movements give us a starting point",
        paragraphs: [
          "Skateboarding is a useful example. The front and rear legs have different jobs, particularly in an ollie and the many tricks built around it. In the skateboarders we work with, we often notice differences in how each side moves. Their stance and repeated movement patterns are useful starting points for assessment.",
          "That history gives the observation context. We look at the positions a person repeatedly uses, the side they prefer for support, and how the pelvis moves when the task changes.",
        ],
      },
      {
        heading: "Be clear about which side is higher",
        paragraphs: [
          "In this recipe, 'same side' means the side where the pelvis is higher; 'opposite side' means the other side. Movement direction is recorded separately. For example, the right side can sit higher while the pelvis travels toward the left foot.",
          "We describe three features separately: height difference, sideways travel and rotation. Keeping these distinctions clear makes it easier to follow the muscle cards and recognise what changes during a squat or step.",
        ],
      },
      {
        heading: "The muscles we focus on",
        paragraphs: [
          "For this pattern, our assessment focuses on the tensor fasciae latae (TFL), adductors and quadratus lumborum (QL) on the elevated side, and the piriformis on the opposite side.",
          "The QL connects the pelvis with the lower back and lowest rib. With the trunk held steady, it can help lift the same side of the pelvis; with the pelvis held steady, it can help bend the trunk sideways. This makes the relationship between pelvic height and trunk position worth watching together.",
          "The adductors draw the thigh toward the midline. The TFL has a different role: it contributes to hip movement and tensions the iliotibial band, helping support the hip and knee. Rather than treating them as one inward pull, we look at how the thigh moves relative to the pelvis and how that leg accepts weight.",
          "On the opposite side, the piriformis contributes to outward hip rotation and can assist abduction when the hip is flexed. Its role changes with hip position, so we compare how that hip turns and opens in standing and as the person lowers into a squat.",
          "These are different lines of action around the same pelvis. The useful picture is how pelvic height, hip rotation and support through each leg fit together during movement.",
        ],
      },
      {
        heading: "How the pattern can show up through the legs",
        paragraphs: [
          "On the elevated side, the thigh may move inward and rotate internally, with the knee following inward and the foot arch lowering. In some people, the opposite thigh sits farther outward and is more externally rotated. These differences can be subtle in standing and easier to recognise during movement.",
          "As the person lowers into a squat, we follow the sequence: does the pelvis begin to drift, does a knee move inward, or does one heel start to rise? The knee-valgus and heel-rise recipes below take a closer look at those accompanying movements.",
        ],
      },
      {
        heading: "How much movement is available on each side?",
        paragraphs: [
          "A squat asks both hips to bend while the ankles allow the shins to travel forward. If those movements are easier on one side, the pelvis may travel sideways as the person lowers. Comparing hip rotation, how comfortably each thigh opens, and ankle movement gives us a clearer picture of where the two sides differ.",
          "In a preliminary study of 40 people performing an overhead squat, a lateral hip shift was associated with differences in hip and ankle range, with possible differences in gluteus medius activation. The researchers labelled the sides by the direction of the shift; the muscle cards here use the higher side of the pelvis. Keep that distinction in mind when reading the findings alongside this recipe.",
        ],
        evidence: ["lateralShiftThesis"],
      },
      {
        heading: "From a photograph to a movement assessment",
        paragraphs: [
          "A photograph helps us notice pelvic height and alignment. Watching the movement adds timing, coordination and the way the two legs share the task. In a study of 17 athletes after ACL reconstruction, sideways hip position was associated with differences in leg loading during squats.",
          "Side-to-side hip differences have also been documented in 24 asymptomatic young adults. In practice, the question is which differences show up in the movement that feels difficult: where the pelvis goes, how the legs share the task, and when discomfort appears.",
        ],
        evidence: ["squatLoadAsymmetry", "healthyHipAsymmetry"],
      },
    ],
    interpretation:
      "Follow three things together: which side of the pelvis is higher, which way it travels, and what the thighs, knees and feet do at that moment. Then return to the movement that matters to you. An easier squat, a steadier step or more comfortable weight transfer tells you more about progress than a perfectly level photograph.",
    connections: [
      {
        slug: "heel-rise",
        reason:
          "Follow when each heel lifts as the pelvis moves sideways, and compare that timing with the changes at the hips and knees.",
      },
      {
        slug: "valgus-knee-knee-collapsing-inward",
        reason: "Take a closer look at inward knee movement and how it accompanies the thigh, pelvis and foot during the same task.",
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
