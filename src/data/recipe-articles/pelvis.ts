import type { PatternArticle } from "./types.ts";

export const pelvisArticles: Record<string, PatternArticle> = {
  "excessive-anterior-pelvic-tilt": {
    title: "Understanding anterior pelvic tilt",
    intro: [
      "You may notice it in a side-on photo: the pelvis tips forward and the lower back looks more arched. Or it becomes clearer when you lift your arms or move a leg behind you.",
      "Anterior pelvic tilt describes that forward rotation. To understand the pattern, look at the hips, lower back and ribcage together—not just the angle of the pelvis.",
    ],
    sections: [
      {
        heading: "How the muscles influence pelvic tilt",
        paragraphs: [
          "The hip flexors and back extensors can contribute to a forward-tipped, more arched position. The abdominal and hip-extensor muscles help control the relationship between the trunk, pelvis and legs. The balance of that work differs between people.",
          "That is why addressing the pattern involves more than applying pressure to a tight area. Where movement is limited, mobility work may be useful; the next step is learning to control the pelvis and trunk while the arms and legs move, then using that control in a combined task.",
        ],
        evidence: ["pelvicMotorStrategies"],
      },
      {
        heading: "How to approach the pattern",
        paragraphs: [
          "A four-stage approach connects preparation with practice: inhibit, lengthen, activate and integrate. The sequence gives each part a purpose, from targeted soft-tissue work to coordinated movement. Select the areas and exercises for your needs rather than automatically working through every example.",
        ],
        table: {
          caption: "A sample progression from targeted preparation to whole-body movement",
          columns: ["Stage", "What you practice", "Key focus", "Examples"],
          rows: [
            ["1. Inhibit", "Apply targeted self-myofascial techniques to selected areas.", "Find the intended area, support your weight and use manageable pressure.", "Rectus femoris; tensor fasciae latae (TFL); latissimus dorsi."],
            ["2. Lengthen", "Use stretching where additional range is needed.", "Keep movement at the intended area rather than creating extra range through unwanted back arching or pelvic movement.", "Hip-flexor complex; latissimus dorsi; spinal extensors."],
            ["3. Activate", "Practice focused abdominal and gluteal control.", "Begin with a manageable range and steady breathing before increasing the challenge.", "Abdominal/core stabilizers; gluteus maximus."],
            ["4. Integrate", "Combine the legs, trunk and arms in one task.", "Carry the control into a suitable movement, then compare comfort and coordination with the starting task.", "Squat-to-row, using an appropriate variation and load."],
          ],
        },
        evidence: ["anteriorTiltProgramExcerpt", "activeLumbopelvicControl"],
      },
      {
        heading: "Connecting the pelvis, shoulders and head",
        paragraphs: [
          "A forward-tipped pelvis may appear alongside a rounded upper back, forward shoulders and a head carried in front of the trunk. Janda’s layer syndrome brings upper- and lower-crossed patterns into one clinical framework for considering these regions together.",
          "The ribcage sits above the pelvis, the shoulder blades move on the ribs, and the neck supports the head above the trunk. Looking at these regions together helps connect rib flare, rounded shoulders and forward head posture with the wider pattern. They can occur together without one being the cause of the others.",
        ],
        evidence: ["jandaLayerFramework"],
      },
    ],
    interpretation: "",
    connections: [
      {
        slug: "rib-flare",
        reason: "Explore the ribcage and lower back when the front ribs lift alongside the pelvic movement.",
      },
      {
        slug: "round-shoulder",
        reason: "Explore shoulder-blade and upper-trunk position alongside the pelvic pattern.",
      },
      {
        slug: "forward-head-posture",
        reason: "Consider head and neck position as part of the wider upper- and lower-body pattern.",
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
