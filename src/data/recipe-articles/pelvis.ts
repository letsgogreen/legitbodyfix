import type { PatternArticle } from "./types.ts";

export const pelvisArticles: Record<string, PatternArticle> = {
  "excessive-anterior-pelvic-tilt": {
    title: "Understanding anterior pelvic tilt",
    intro: [
      "You may notice it in a side-on photo: the pelvis tips forward and the lower back looks more arched. Or it may become clearer when you lift your arms, move a leg behind you, or settle into your usual standing position.",
      "The pelvis sits between the trunk and the thighs. When it tips forward, the movement can involve the lower back and ribcage as well as the hips. Looking at these connections helps explain the pattern beyond its appearance.",
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
        heading: "How the muscles influence pelvic tilt",
        paragraphs: [
          "The hip flexors link the thigh with the pelvis or lower spine. They bring the thigh toward the trunk and, when the leg is relatively fixed, can contribute to forward pelvic rotation. The back extensors help extend and support the spine. From the other side, the abdominal muscles help control the ribcage relative to the pelvis, while the gluteals and hamstrings help extend the hip and control the pelvis over supported legs.",
          "Those actions describe what the muscles can do. How they share the work differs between people. Someone may have limited hip extension; someone else may have more available movement but move the pelvis and lower back early as the leg travels behind them. Both can show a forward tilt, while the contribution from mobility and coordination differs.",
          "The hamstrings illustrate why position matters. As the pelvis tips forward over relatively fixed legs, the tissue can lengthen. A lengthened position is different from a measurement of strength, just as a forward-tipped pelvis is different from a test of hip-flexor length.",
        ],
        evidence: ["pelvicHamstringLength", "pelvicMotorStrategies", "hipExtensionPosture"],
      },
      {
        heading: "Available movement and movement strategy",
        paragraphs: [
          "Consider a leg moving behind the body. How much movement takes place at the hip, and how much comes from the pelvis tipping and the back arching? Keeping track of both separates the range available at the joint from the way the whole movement is performed.",
          "In a study of people with measured iliopsoas shortness, combining stretching with abdominal control changed pelvic movement and muscle activity during a prone leg lift. In another study of healthy adults, instruction in lumbopelvic control changed muscle recruitment during extension exercises. These are two useful examples: available range and the way it is used can both matter.",
          "The relationship also changes with the task. A hip-flexibility test on a treatment table and hip extension during running are different situations. Research in elite runners found that their static test results did not reflect pelvic tilt during running. Follow the pattern in the activity where it appears.",
        ],
        evidence: ["iliopsoasShortnessControl", "activeLumbopelvicControl", "runningPelvicTilt"],
      },
      {
        heading: "Connecting the pelvis, shoulders and head",
        paragraphs: [
          "The pelvis is one part of a larger postural pattern. A forward-tipped pelvis and a more arched lower back may appear alongside a rounded upper back, forward shoulders and a head carried farther in front of the trunk.",
          "Janda's layer syndrome, also called stratification syndrome, brings upper- and lower-crossed patterns into one clinical framework. It describes alternating regions of muscle tightness and reduced performance across the body. Here, it gives us a way to consider the pelvic region alongside the shoulder girdle and neck, rather than treating each outline in isolation.",
          "Follow those connections during a reach: how does the ribcage move over the pelvis, how do the shoulder blades move on the ribs, and where does the head sit as the arms rise? The rounded-shoulder and forward-head recipes explore the upper part of that picture. The framework connects observations; it does not mean that pelvic tilt caused the shoulder or neck position.",
          "If the front ribs also lift as the lower back arches, the rib-flare recipe adds the connection through the trunk. Each region still has its own movement and muscle relationships to examine.",
        ],
        evidence: ["jandaLayerFramework"],
      },
      {
        heading: "Research behind the movement connections",
        paragraphs: [
          "Anterior tilt was common in a study of 120 healthy young adults. Separate measurements of pelvic specimens showed that bone shape influences the angle between pelvic landmarks. Together, these findings explain why two people's standing outlines are a poor basis for choosing one ideal pelvic angle.",
          "Standing posture, muscle performance and movement strategy have been studied separately. Hip-extension range was not meaningfully correlated with standing pelvic tilt in 25 healthy adults. A study of 31 adults also found weak relationships between its abdominal-performance measure and standing pelvic tilt. An exploratory study of 41 people identified four muscle-activation patterns during voluntary backward pelvic tilting, showing that the same movement direction can be achieved through different muscle combinations.",
          "The task-specific studies add detail. Among 25 people with iliopsoas shortness, stretching followed by abdominal drawing-in reduced pelvic compensation and increased gluteus maximus activity during prone hip extension. In 13 healthy adults, a learned control strategy also changed extension-exercise recruitment. These were specific exercise conditions, rather than demonstrations of one lasting correction for every anteriorly tilted posture.",
          "In 14 elite athletes, pelvic tilt and hip extension were coordinated during running, but static hip-extension flexibility did not significantly correlate with either running measure. A separate test-validation study in 29 participants showed why pelvic position needs attention even on the examination table: allowing it to move distorted the measurement of hip extension.",
        ],
        evidence: ["pelvicStandingVariation", "pelvicLandmarks", "abdominalPelvicAngle", "pelvicHamstringLength", "hipExtensionPosture", "pelvicMotorStrategies", "iliopsoasShortnessControl", "activeLumbopelvicControl", "runningPelvicTilt", "thomasPelvicControl"],
      },
    ],
    interpretation:
      "The same forward tilt can reflect different combinations of available motion and muscle coordination. Connect the muscle references to the task: the ribs and lower back during a reach, the hip during a step, and the changing pelvic angle during a squat. 'Excessive' is not a diagnosis defined by one standing angle. What matters is how the parts share the movement.",
    connections: [
      {
        slug: "rib-flare",
        reason:
          "If the front ribs lift during the same reach or trunk extension, distinguish that movement from the pelvis rotating forward.",
      },
      {
        slug: "round-shoulder",
        reason:
          "Explore shoulder-blade and upper-trunk position alongside the pelvic pattern within the layer-syndrome framework.",
      },
      {
        slug: "forward-head-posture",
        reason:
          "Follow how head and neck position relates to the upper trunk when upper- and lower-crossed patterns appear together.",
      },
    ],
  },
  "excessive-posterior-tilt": {
    title: "Understanding posterior pelvic tilt",
    intro: [
      "Your squat looks steady—until the last part of the descent. Then the pelvis rolls under and the lower back begins to flatten. Or you may notice a tucked-under position in standing, before you move at all.",
      "Both can be described as posterior pelvic tilt, but they tell different stories. Before choosing a muscle to stretch or strengthen, ask when the tuck appears. The answer connects the muscle cards to the movement you are actually seeing.",
    ],
    sections: [
      {
        heading: "A tucked position and a late-squat tuck are different stories",
        paragraphs: [
          "Posterior pelvic tilt means the pelvis rotating backward. The lower-back curve may flatten as it happens. In standing, you are looking at a starting position. During a squat, you are watching that position change as the hips and knees bend.",
          "Follow the last few centimetres of the descent. Do the thighs keep moving toward the trunk as the pelvis starts to roll backward? That transition shows how the hip joints and pelvis share the movement. It is more specific than describing the whole squat as rounded.",
        ],
      },
      {
        heading: "How the muscles influence pelvic tilt",
        paragraphs: [
          "The hamstrings attach to the back of the pelvis and cross both the hip and knee. They help extend the hip and bend the knee; with the legs supported, they can also contribute to backward pelvic rotation. But a squat bends both joints at once. Hip flexion lengthens the hamstrings across the hip while knee flexion shortens them across the knee. Their role changes with both angles.",
          "The gluteus maximus also helps extend the hip and can contribute to pelvic control over supported legs. The abdominal muscles help control the pelvis relative to the ribcage, while the back extensors help support and extend the spine. Think of these muscles as sharing control of the movement, rather than assigning the tuck to one tight muscle.",
          "A straight-leg bend and a deep squat therefore ask different questions of the hamstrings. Use the muscle cards to understand their attachments and actions, then return to the task: when does the pelvis begin to turn, and what are the knees doing at that moment?",
        ],
        evidence: ["hamstringPelvicRotation"],
      },
      {
        heading: "More squat depth does not always mean more hip flexion",
        paragraphs: [
          "Your body can travel lower through a combination of hip, knee, ankle and pelvic movement. Once the pelvis begins to roll backward, the thighs can move farther relative to the room without the same increase in hip flexion relative to the pelvis. The hip socket moves with the pelvis, so the relationship between the two matters.",
          "This is why depth alone leaves part of the story out. Stance and heel position can change how the descent is distributed. In a bodyweight-squat study, raising the heels allowed greater depth and knee flexion, while the hip-flexion angle at the onset of posterior tilt remained similar.",
        ],
        evidence: ["squatTiltOnset"],
      },
      {
        heading: "Where forward lean and anterior tilt fit in",
        paragraphs: [
          "A forward lean describes the torso tipping toward the floor. A posterior tilt describes the pelvis rotating backward. The chest may lean forward well before the pelvis tucks, or the two changes may appear close together. The forward-trunk-lean recipe helps separate those parts of the descent.",
          "Anterior pelvic tilt completes the comparison. A squat can start with the pelvis tipped forward and finish with it rotating backward. Read the two recipes as different parts of a movement, rather than opposite labels that must describe different people.",
        ],
      },
      {
        heading: "Research behind the movement connections",
        paragraphs: [
          "An imaging study of six healthy men tracked coordinated movement of the pelvis and thigh during activities including squatting and rising from a chair. It provides a useful starting point: the pelvis participates in the task alongside the hip joint.",
          "A study of 28 participants compared standard squats, heel-raised squats and passive hip flexion. Hip flexion at the onset of posterior tilt was similar across conditions, even though the heel-raised squat went deeper. A separate hip-flexion experiment found that knee position and hamstring length influenced pelvic rotation. These findings make joint position and task setup important parts of the explanation.",
          "Research comparing 15 people with symptomatic hip impingement and 14 controls found similar squat depths but differences in pelvic and hip strategy during a constrained squat. Reaching the same depth can involve different movements; the study does not identify hip impingement from a visible tuck.",
        ],
        evidence: ["hipPelvis", "squatTiltOnset", "hamstringPelvicRotation", "hipTask"],
      },
    ],
    interpretation:
      "Start with the timing of the tuck, then connect it to hip depth, knee bend and trunk position. A standing posture and the last few centimetres of a squat deserve different explanations. The aim is to understand the movement you need—not to keep the pelvis frozen while everything around it moves.",
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
