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
    title: "When a movement drifts toward one side",
    intro: [
      "During a squat or a step, the pelvis may travel toward one leg instead of remaining between the feet. Sometimes one side also rises or the trunk leans. Before assigning a cause, separate these visible events: shifting sideways, tilting the pelvis and bending the torso describe different movements.",
    ],
    sections: [
      {
        heading: "The feet can provide different starting conditions",
        paragraphs: [
          "A turned-out foot, a lifting heel or a changing arch can accompany a shift. These are useful observations because they describe what is happening at the base of the movement. They do not reveal how much force is under each foot; that requires a separate measurement.",
          "Experiments that increased pronation on one side during walking found changes elsewhere in the lower limb and pelvis. This makes foot–pelvis coordination relevant, but an induced walking condition cannot explain every habitual squat shift.",
        ],
        evidence: ["unilateralFoot"],
      },
      {
        heading: "Hip motion and pelvic motion need to be separated",
        paragraphs: [
          "A thigh moving relative to its socket is different from the pelvis moving over the supporting leg. A sideways shift may accompany a difference in comfortable hip motion, a preferred strategy or an adjustment to the task. The direction alone does not tell you which hip is restricted.",
          "Research in symptomatic hip impingement found task-dependent hip adduction and pelvic rise. It offers an example of coordinated adaptation, not a rule that the raised side or opposite-side piriformis must be the cause.",
        ],
        evidence: ["hipTask"],
      },
      {
        heading: "Track the knee and trunk as separate companions",
        paragraphs: [
          "If one knee moves inward as the pelvis shifts, the valgus-knee recipe provides a closer look at that knee-to-foot relationship. If the chest also drops, the forward-lean recipe addresses the side-view pattern. Neither companion should replace the description of the shift itself.",
          "The most useful account says what moves, on which side and at what point in the repetition. That gives the muscle cards above a context instead of turning side labels into a diagnosis.",
        ],
      },
    ],
    interpretation:
      "A visible shift does not establish leg-length discrepancy, a named asymmetry syndrome, or a particular muscle imbalance. The links below are observation-based comparisons, not confirmed causal pathways.",
    connections: [
      {
        slug: "valgus-foot",
        reason:
          "Explore changing foot contact and arch motion as a possible companion to the shift, not an assumed root cause.",
      },
      {
        slug: "valgus-knee-knee-collapsing-inward",
        reason: "Distinguish inward knee movement from sideways travel of the pelvis.",
      },
      {
        slug: "excessive-forward-trunk-leaning",
        reason: "Follow a simultaneous chest drop separately from the left-to-right movement.",
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
