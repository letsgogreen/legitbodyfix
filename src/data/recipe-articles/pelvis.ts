import type { PatternArticle } from "./types.ts";

export const pelvisArticles: Record<string, PatternArticle> = {
  "excessive-anterior-pelvic-tilt": {
    title: "Understanding anterior pelvic tilt",
    intro: [
      "You may notice it in a side-on photo: the pelvis tips forward and the lower back looks more arched. Or it may become clearer when you lift your arms, move a leg behind you, or settle into your usual standing position.",
      "Should you start by stretching the hip flexors? Before choosing a muscle to work on, follow what moves with the pelvis: the lower back, the ribcage and the thighs. You will get a clearer picture of how the forward tilt happens—and where the muscle cards fit.",
    ],
    sections: [
      {
        heading: "Look beyond the arch in your lower back",
        paragraphs: [
          "Anterior pelvic tilt means the pelvis rotating forward. The lower-back curve may deepen with it, which makes the two easy to read as one event. Follow the waistband as well as the back: one shows the pelvis turning, while the other shows the spine changing shape.",
          "Picture an overhead reach. As the arms rise, the chest may lift, the lower back may arch and the pelvis may tip forward. The final position looks like a posture; watching the reach reveals how you arrived there.",
        ],
      },
      {
        heading: "Why the hip flexors are only part of the story",
        paragraphs: [
          "The hip flexors are an obvious place to look because they link the thigh with the pelvis or lower spine. They help bring the thigh toward the trunk. With the leg relatively fixed, their pull can also contribute to movement around the pelvis. Behind them, the back extensors help extend and support the spine. A forward-tipped pelvis and a deeper back arch can involve both regions.",
          "Now look at the other side of that relationship. The abdominal muscles help control the ribcage relative to the pelvis. The gluteals and hamstrings help extend the hip and can contribute to controlling pelvic rotation over supported legs. During a reach or step, these muscles share the job of allowing movement while controlling where it comes from.",
          "The hamstrings add an important twist: feeling stretched is not the same as being short. As the pelvis tips forward over relatively fixed legs, their attachment at the pelvis moves and the tissue can lengthen. Keep length, tension and strength separate when reading the cards. Each answers a different question about the muscle.",
        ],
        evidence: ["pelvicHamstringLength"],
      },
      {
        heading: "The hip socket moves with the pelvis",
        paragraphs: [
          "The pelvis carries the hip sockets with it. As it rotates, it changes how each socket faces the thigh. This matters during a squat, when the thighs bend toward the trunk and the pelvis also contributes to the descent.",
          "That is why the top and bottom of a squat can tell different stories. The pelvis may begin tipped forward, then rotate backward farther down. Follow that transition alongside the thighs: how does the pelvis change as the hips bend and the squat gets deeper?",
        ],
        evidence: ["pelvicHipOrientation"],
      },
      {
        heading: "Where rib flare and a pelvic tuck fit in",
        paragraphs: [
          "If the front ribs lift as the lower back arches during a reach, the rib-flare recipe takes a closer look at the upper part of that movement. Read the two patterns together when the ribcage and pelvis both change position during the same task.",
          "If the pelvis rolls backward near the bottom of a squat, the posterior-pelvic-tilt recipe follows the next part of the sequence. A forward-tipped starting position and a later tuck can belong to the same repetition. The related cards help you follow those changes instead of choosing one label for the whole movement.",
        ],
      },
      {
        heading: "Research behind the movement connections",
        paragraphs: [
          "Anterior tilt was common in a study of 120 healthy young adults. Separate measurements of pelvic specimens showed that bone shape influences the angle between pelvic landmarks. Together, these findings explain why two people's standing outlines are a poor basis for choosing one ideal pelvic angle.",
          "In 31 healthy adults, the abdominal-performance measure had weak relationships with standing pelvic tilt and lumbar lordosis. A separate experiment in seven specimens found that increasing anterior tilt lengthened hamstring tissue with the legs fixed. These studies distinguish muscle performance from the position and length of the tissues.",
          "Computer modelling of hips with femoroacetabular impingement also found that anterior tilt reduced available internal rotation in flexed positions before bony contact. This supports considering pelvic orientation alongside hip motion; the study concerns bony clearance in that hip population, rather than a universal limit for every squat.",
        ],
        evidence: ["pelvicStandingVariation", "pelvicLandmarks", "abdominalPelvicAngle", "pelvicHamstringLength", "pelvicHipOrientation"],
      },
    ],
    interpretation:
      "Before choosing what to stretch or strengthen, connect the pelvis to the task. During a reach, follow the ribs and lower back. During a squat, follow the thighs and the changing pelvic angle. 'Excessive' is not a diagnosis defined by one standing angle: the aim is to understand how the parts work together, not to spend the day holding your pelvis in place.",
    connections: [
      {
        slug: "rib-flare",
        reason:
          "If the front ribs lift during the same reach or trunk extension, distinguish that movement from the pelvis rotating forward.",
      },
      {
        slug: "excessive-posterior-tilt",
        reason:
          "Follow how a forward-tipped starting position changes into backward pelvic rotation farther down in a squat.",
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
      "You may first notice it in a photo taken from behind: one side of your pelvis sits higher than the other. Or you may notice it during a squat, when your hips drift to one side as you lower.",
      "For some people, it is simply something they see. For others, it comes with an awkward squat, uneven weight transfer, or discomfort during everyday movement. To understand the pattern, follow more than the waistline: how the hips turn, where the knees travel, and how each foot meets the ground.",
    ],
    sections: [
      {
        heading: "Different jobs, different movement histories",
        paragraphs: [
          "Think about an ollie. The front foot guides the board while the rear leg delivers the pop. Across years of skating and the many tricks built around that movement, each side develops a different movement history.",
          "In the skateboarders we work with, that history gives us something concrete to explore: how each hip turns, which leg feels more natural to stand on, and what happens to the pelvis as they squat.",
        ],
      },
      {
        heading: "How the muscles around the pelvis contribute",
        paragraphs: [
          "The muscle cards focus on the tensor fasciae latae (TFL), adductors and quadratus lumborum (QL) on the higher side of the pelvis, and the piriformis on the opposite side. Each contributes differently to the movement.",
          "The QL helps explain why we look at the waist as well as the hips. It connects the pelvis to the lower back and lowest rib, and can help lift one side of the pelvis when the trunk stays steady. Watch whether the higher hip is accompanied by a sideways trunk bend, and how the two change as weight moves between the feet.",
          "The adductors draw the thigh toward the midline. The TFL has a different role: it contributes to hip movement and tensions the iliotibial band, helping support the hip and knee. Rather than treating them as one inward pull, we look at how the thigh moves relative to the pelvis and how that leg accepts weight.",
          "On the opposite side, the piriformis contributes to outward hip rotation and can assist abduction when the hip is flexed. Its role changes with hip position, so we compare how that hip turns and opens in standing and as the person lowers into a squat.",
          "Together, these references give you a way to read the movement: the height of the pelvis, the direction each thigh turns, and the support available through each leg.",
        ],
      },
      {
        heading: "Follow the movement from hip to foot",
        paragraphs: [
          "On the elevated side, the thigh may move inward and rotate internally, with the knee following inward and the foot arch lowering. In some people, the opposite thigh sits farther outward and is more externally rotated. These differences can be subtle in standing and easier to recognise during movement.",
          "As the person lowers into a squat, we follow the sequence: does the pelvis begin to drift, does a knee move inward, or does one heel start to rise? The knee-valgus and heel-rise recipes below take a closer look at those accompanying movements.",
        ],
      },
      {
        heading: "How much movement is available on each side?",
        paragraphs: [
          "A squat asks both hips to bend while the ankles allow the shins to travel forward. If those movements are easier on one side, the pelvis may travel sideways as the person lowers. Comparing hip rotation, how comfortably each thigh opens, and ankle movement gives us a clearer picture of where the two sides differ.",
        ],
      },
      {
        heading: "Research behind the movement connections",
        paragraphs: [
          "The research brings hip and ankle mobility, leg loading and natural side-to-side variation into the picture. These studies examine different groups and tasks, so each adds a different piece to the explanation.",
          "A preliminary study of 40 people performing an overhead squat associated a lateral hip shift with differences in hip and ankle range, with possible differences in gluteus medius activation.",
          "In 17 athletes after ACL reconstruction, sideways hip position was associated with differences in leg loading during squats. A separate study of 24 asymptomatic young adults documented side-to-side hip differences during movement. Together, these findings help explain why movement and weight transfer deserve attention alongside appearance.",
        ],
        evidence: ["lateralShiftThesis", "squatLoadAsymmetry", "healthyHipAsymmetry"],
      },
    ],
    interpretation:
      "A photograph shows where your pelvis sits. Movement shows how you use it. Follow the hips, knees and feet together, then return to the task that feels difficult. The goal is to make that movement feel steadier, easier and more comfortable—not simply to make the photograph look more symmetrical.",
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
