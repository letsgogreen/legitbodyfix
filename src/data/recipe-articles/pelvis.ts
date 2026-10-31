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
      "You may notice your pelvis sitting tucked under in a side-on photo. Or your squat may look steady until the final part of the descent, when the pelvis rolls backward and the lower back begins to flatten.",
      "Both involve posterior pelvic tilt. The useful starting point is when it appears: before the movement begins, or as you reach a particular depth.",
    ],
    sections: [
      {
        heading: "How the muscles influence pelvic tilt",
        paragraphs: [
          "The hamstrings connect the back of the pelvis to the lower leg. Alongside their role in hip extension and knee flexion, they can contribute to backward pelvic rotation when the legs are supported. The abdominal muscles can also help draw the pelvis into a tucked position.",
          "During a squat, however, the hips and knees bend together. Those joint positions change the length and influence of the hamstrings. A straight-leg bend and a deep squat therefore do not tell the same story about the back of the thighs.",
          "Addressing the pattern involves both available movement and muscular control. The hip flexors and spinal extensors contribute to movement away from a tucked position, while the gluteus maximus helps produce hip extension. The aim is to coordinate these actions—not simply to relax every muscle capable of rotating the pelvis backward.",
        ],
        evidence: ["hamstringPelvicRotation"],
      },
      {
        heading: "How to approach the pattern",
        paragraphs: [
          "The progression moves from targeted preparation to coordinated movement: inhibit, lengthen, activate and integrate.",
          "Choose the areas that need attention, then practice using the available range. The examples below are options within that progression, not a checklist everyone needs to complete.",
        ],
        table: {
          caption: "A sample progression from targeted preparation to coordinated movement",
          columns: ["Stage", "What you practice", "Key focus", "Examples"],
          rows: [
            ["1. Inhibit", "Targeted self-myofascial work for selected areas around the hips and thighs.", "Prepare areas that feel restricted without treating every muscle as an automatic target.", "Adductor magnus; hamstring complex; piriformis."],
            ["2. Lengthen", "Stretching where additional range is needed.", "Develop the movement needed for the task rather than chasing the strongest stretch.", "Abdominal complex; adductor magnus; hamstring complex."],
            ["3. Activate", "Focused work for hip and spinal control.", "Practice hip flexion, hip extension and spinal extension without forcing an exaggerated lower-back arch.", "Hip flexors; gluteus maximus; spinal extensors."],
            ["4. Integrate", "Combine lower-body movement with an upper-body task.", "Coordinate the hips, pelvis and trunk as the movement becomes more demanding.", "Ball wall squat with overhead press, using a suitable variation."],
          ],
        },
        evidence: ["posteriorTiltProgramExcerpt"],
      },
      {
        heading: "Connecting the pattern to your squat",
        paragraphs: [
          "If the tuck appears only near the bottom, include squat depth and setup in the picture. Greater depth can come from different combinations of hip, knee, ankle and pelvic movement. In one study, raising the heels increased squat depth without significantly changing the hip-flexion angle at which posterior tilt began.",
          "Use a manageable version of the task while developing control, then revisit the movement that brought you here. Look for a smoother descent and more comfortable coordination rather than forcing the pelvis forward throughout the repetition.",
        ],
        evidence: ["squatTiltOnset"],
      },
    ],
    interpretation: "",
    connections: [
      {
        slug: "excessive-forward-trunk-leaning",
        reason:
          "Compare the torso leaning forward with the pelvis rolling backward; they describe different parts of the movement.",
      },
      {
        slug: "excessive-anterior-pelvic-tilt",
        reason:
          "Understand forward and backward pelvic rotation, including how the starting position may change during a squat.",
      },
    ],
  },
  "asymmetric-weight-shift": {
    title: "Understanding asymmetric hip shift",
    intro: [
      "You may first notice it in a photo taken from behind: one side of your pelvis sits higher than the other. Or you may notice your hips drifting to one side as you lower into a squat.",
      "For some people, it is simply something they see. For others, it comes with an awkward squat, uneven weight transfer or discomfort during everyday movement. Understanding the pattern means looking beyond the waistline—to the hips, knees and support beneath each foot.",
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
          "For the pattern described here, we examine the TFL, adductors and quadratus lumborum (QL) on the higher side of the pelvis, and the piriformis on the opposite side.",
          "The QL connects the pelvis to the lower back and lowest rib. With the trunk held steady, it can help lift one side of the pelvis. This makes the relationship between the waist, ribs and higher hip worth examining together.",
          "The adductors draw the thigh toward the midline. The TFL contributes to hip flexion, abduction and internal rotation while tensioning the iliotibial band. On the opposite side, the piriformis contributes to outward rotation and can assist abduction when the hip is flexed.",
          "These muscles do different jobs. Addressing the pattern therefore involves more than releasing a tight area: the hips also need usable movement, and the trunk and legs need to coordinate how weight passes between them.",
        ],
      },
      {
        heading: "How to approach the pattern",
        paragraphs: [
          "The progression connects targeted preparation with movement practice: inhibit, lengthen, activate and integrate.",
          "Select the side and area according to the restriction or control difficulty you find. Then connect the preparation to a task that asks the legs and trunk to work together.",
        ],
        table: {
          caption: "A sample progression from targeted preparation to coordinated weight transfer",
          columns: ["Stage", "What you practice", "Key focus", "Examples"],
          rows: [
            ["1. Inhibit", "Targeted self-myofascial work around selected hip, thigh and waist muscles.", "Prepare the areas that need attention rather than treating both sides identically.", "Selected adductors, TFL and piriformis; QL on the higher side of the pelvis and biceps femoris where relevant."],
            ["2. Lengthen", "Stretching to develop the hip and trunk movement needed for the task.", "Address the restricted direction on the relevant side rather than automatically stretching both sides the same way.", "Selected adductors, piriformis and TFL; QL on the higher side of the pelvis where relevant."],
            ["3. Activate", "Focused work for hip and trunk control.", "Develop support through each leg and control of the pelvis as weight transfers.", "Gluteus medius; adductors on the side needing focused work; QL on the lower side of the pelvis where relevant; core stabilizers."],
            ["4. Integrate", "Combine stepping, weight transfer and an upper-body movement.", "Bring the available hip movement and trunk control into one coordinated task.", "Step-up to overhead cable press, using a suitable variation."],
          ],
        },
        evidence: ["asymmetricShiftProgramExcerpt"],
      },
      {
        heading: "Follow the movement from hip to foot",
        paragraphs: [
          "On the elevated side, the thigh may move inward and rotate internally, with the knee following inward and the foot arch lowering. The opposite thigh may sit farther outward and turn more externally. These differences can be subtle in standing and clearer during a squat or step.",
          "Include the ankles in that picture. A preliminary study of people performing an overhead squat found side-to-side differences in hip and ankle mobility among those displaying a lateral hip shift. This gives us a practical reason to compare the movement available through both legs.",
        ],
        evidence: ["lateralShiftThesis"],
      },
    ],
    interpretation:
      "A photograph shows where your pelvis sits. Movement shows how you use it. Follow the hips, knees and feet together, then return to the task that feels difficult. The goal is to make that movement feel steadier, easier and more comfortable—not simply to make the photograph look more symmetrical.",
    connections: [
      {
        slug: "heel-rise",
        reason:
          "Follow when each heel lifts as the pelvis moves sideways, alongside the changes at the hips and knees.",
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
