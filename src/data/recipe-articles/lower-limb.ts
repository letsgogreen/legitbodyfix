import type { PatternArticle } from "./types.ts";

export const lowerLimbArticles: Record<string, PatternArticle> = {
  "varus-knee": {
    title: "When the knees appear to move outward",
    intro: [
      "During a squat, a knee may travel farther outward relative to the foot. Before calling this a correction target, establish the starting stance and what the knee is moving relative to. A wide stance, an outward-facing foot and a changing knee path can look similar from one camera angle.",
    ],
    sections: [
      {
        heading: "Foot direction changes the reference",
        paragraphs: [
          "A knee seen from directly in front of the body is not necessarily being viewed along the direction of that foot. Describe the knee-to-foot relationship as well as the knee-to-body relationship. This avoids mistaking a change in setup for a new movement at the knee.",
          "Squat experiments show that foot angle and stance width alter frontal-plane knee movement. The finding supports recording the setup, not selecting one universal stance or assuming every outward-moving knee has the same cause.",
        ],
        evidence: ["stance"],
      },
      {
        heading: "Outward motion and a sideways shift are different",
        paragraphs: [
          "If one knee moves outward while the pelvis travels toward that side, two observations are present. The asymmetric hip-shift recipe looks at the pelvis; this recipe describes the knee path. One does not establish the cause of the other.",
          "Likewise, a turned-out foot may accompany the pattern without showing whether the rotation comes from the hip, lower leg or foot. The feet-turn-out recipe helps keep those possibilities separate.",
        ],
      },
      {
        heading: "Do not confuse a movement label with bone alignment",
        paragraphs: [
          "A knee that moves outward during one task is not the same finding as fixed bow-legged alignment measured in standing. Structural alignment and a task-specific motion should not be diagnosed from the same image.",
          "The muscle cards therefore provide anatomical context. They cannot demonstrate that the adductors are weak or the lateral tissues are short simply because a knee appears farther out.",
        ],
      },
    ],
    interpretation:
      "Evidence specific to this visual recipe label is limited. The connections below are setup and observation comparisons, not a validated varus-correction sequence.",
    connections: [
      {
        slug: "feet-turn-out",
        reason: "Establish foot direction before interpreting where the knee moves relative to it.",
      },
      {
        slug: "asymmetric-weight-shift",
        reason: "Separate outward knee motion from a simultaneous sideways movement of the pelvis.",
      },
    ],
  },
  "valgus-foot": {
    title: "When the arch lowers during movement",
    intro: [
      "As weight comes onto the foot, the arch may lower and the heel may change orientation. A low-looking arch at rest and an arch changing during a step are different observations. This recipe focuses on the movement, not on treating every foot shape as a defect.",
    ],
    sections: [
      {
        heading: "The foot and the leg can move together",
        paragraphs: [
          "Pronation is a combined foot motion, not simply the arch getting closer to the floor. In walking experiments, inducing more pronation changed hip and pelvic motion as well. This shows that the foot can participate in a wider movement strategy.",
          "Those experiments used insoles to change the condition. They do not mean that every naturally lower arch causes a knee or pelvic problem, or that making the arch higher will improve the movement.",
        ],
        evidence: ["footPelvis"],
      },
      {
        heading: "An inward-moving knee needs its own description",
        paragraphs: [
          "If the knee moves inward at the same time as the arch lowers, record both events rather than naming the foot as the cause. The thigh can change position, the lower leg can rotate, and the foot can move; a front-view outline cannot measure each contribution.",
          "The valgus-knee recipe is linked to examine that knee-to-foot relationship. It is not a claim that pronation and inward knee movement always occur together.",
        ],
      },
      {
        heading: "A turned-out foot is a different feature",
        paragraphs: [
          "Foot progression angle describes the direction the foot points. Pronation describes motion within the foot. A foot may point outward without visibly lowering its arch, or show arch movement while pointing relatively forward.",
          "If one side also behaves differently from the other and the pelvis shifts, the asymmetric hip-shift recipe provides a separate observation to explore. It does not identify which part of the chain initiated the change.",
        ],
      },
    ],
    interpretation:
      "Foot appearance alone does not diagnose dysfunction or a need for arch correction. Distinguish resting shape, movement during the task and symptoms before drawing conclusions about the muscle references.",
    connections: [
      {
        slug: "valgus-knee-knee-collapsing-inward",
        reason:
          "Describe inward knee movement separately when it accompanies changing foot contact.",
      },
      {
        slug: "feet-turn-out",
        reason: "Distinguish the direction the foot points from pronation within the foot.",
      },
      {
        slug: "asymmetric-weight-shift",
        reason:
          "Explore a side-to-side pelvic strategy if the foot observations are also asymmetric.",
      },
    ],
  },
  "feet-turn-out": {
    title: "Why might the feet point outward?",
    intro: [
      "Some people begin a squat with the feet angled outward; others turn a foot farther out while descending. A chosen starting stance and a changing foot angle are different observations. The second gives information about the movement's timing, but neither identifies a single tight muscle.",
    ],
    sections: [
      {
        heading: "Foot angle is part of the setup",
        paragraphs: [
          "The direction of the foot changes the reference for the knee path. An outward-facing knee may be following an outward-facing foot rather than drifting sideways across it. Describe both before labelling the movement.",
          "Research varying squat stance and foot angle found changes in hip and knee mechanics. This supports considering foot direction as a task condition, rather than assuming parallel feet are the correct target for everyone.",
        ],
        evidence: ["stance"],
      },
      {
        heading: "The foot's direction does not locate the rotation",
        paragraphs: [
          "An outward-facing foot does not tell you how much orientation comes from the thigh, lower leg or foot itself. It also does not establish a difference between a habitual stance and a response to the current squat.",
          "Turning out is not the same as pronation. One describes where the foot points; the other describes combined movement within it. The pronation recipe is useful when arch or heel movement is present as well.",
        ],
      },
      {
        heading: "Follow the moment when the setup changes",
        paragraphs: [
          "If turnout increases near the point where a heel starts to lift, it is reasonable to investigate the foot–ankle conditions of that part of the descent. This is a connection to explore, not proof that calf tightness caused the turnout.",
          "If instead the feet remain still while the knees move farther outward, the varus-knee recipe helps describe the knee path. Keeping these events separate avoids using one correction cue for several different movements.",
        ],
      },
    ],
    interpretation:
      "A foot angle alone cannot distinguish structural rotation, limited motion or a chosen movement strategy. The related recipes are comparisons, not instructions to force the feet into a new angle.",
    connections: [
      {
        slug: "heel-rise",
        reason: "Explore heel contact if the foot angle changes as the squat becomes deeper.",
      },
      {
        slug: "valgus-foot",
        reason: "Separate foot direction from arch and heel movement within the foot.",
      },
      {
        slug: "varus-knee",
        reason:
          "Compare the knee's path with the actual direction of the foot, rather than the camera alone.",
      },
    ],
  },
  "knee-dominance": {
    title: "What does a knee-dominant squat actually mean?",
    intro: [
      "A squat with more forward knee travel and a relatively upright torso may look different from one with the hips farther back and the chest inclined. 'Knee dominance' is most useful as a description of relative mechanical demand, not a diagnosis or a synonym for bad technique.",
    ],
    sections: [
      {
        heading: "The knee and hip share the work",
        paragraphs: [
          "Researchers studying 100 people found that trunk and shin angles were associated with the hip-to-knee extensor moment ratio. More forward trunk inclination and less forward shin inclination were associated with a relatively larger hip moment.",
          "The reverse visual strategy can be more knee-biased. A joint moment describes a mechanical demand, however; it is not a direct measurement of quadriceps activation or proof that the gluteal muscles are inactive.",
        ],
        evidence: ["jointDemand"],
      },
      {
        heading: "Forward lean is a comparison, not the cure",
        paragraphs: [
          "The forward-trunk-lean recipe provides the other side of this comparison. A more inclined torso can change the distribution of demand, but it also changes the task. It should not automatically replace a more upright squat.",
          "Depth, external load and the exercise being performed belong in the description. Two different exercises should not be judged only by whether the knees travel the same distance.",
        ],
      },
      {
        heading: "Watch the foot without banning knee travel",
        paragraphs: [
          "A heel leaving the ground is a separate event from the knee moving forward. The heel-rise recipe addresses contact and ankle motion; this recipe addresses the way the overall squat is organised.",
          "A supported heel and substantial forward knee travel can coexist. Equally, a heel can lift during a squat that also uses considerable trunk lean. Keeping foot contact and hip-to-knee demand separate avoids treating either outline as a complete assessment.",
        ],
      },
    ],
    interpretation:
      "Knee travel beyond the toes is not, on its own, evidence of damage or a muscle imbalance. The useful question is whether the chosen strategy fits the task, load and person's symptoms, rather than whether the knee appears 'dominant'.",
    connections: [
      {
        slug: "excessive-forward-trunk-leaning",
        reason:
          "Compare different trunk–shin strategies and how they relate to hip and knee demand.",
      },
      {
        slug: "heel-rise",
        reason: "Separate heel contact from forward knee movement; they are not the same finding.",
      },
    ],
  },
  "valgus-knee-knee-collapsing-inward": {
    title: "When the knee moves inward, look above and below it",
    intro: [
      "During a squat, step or landing, a knee may move inward relative to the supporting foot. The front view shows the combined outline of the thigh, knee, lower leg and foot. It does not isolate which segment moved first or identify a weak muscle.",
    ],
    sections: [
      {
        heading: "The ankle can be relevant without being the cause",
        paragraphs: [
          "A group comparison of overhead-squat patterns found less ankle dorsiflexion in people displaying medial knee displacement. This makes available ankle movement worth considering alongside the knee path.",
          "That study did not show that all inward-moving knees begin at the ankle. It also reported less navicular drop in the medial-displacement group, a reminder that a simple 'lower arch causes valgus' explanation does not fit every dataset.",
        ],
        evidence: ["kneeAnkle"],
      },
      {
        heading: "Hip and pelvic movement change the same outline",
        paragraphs: [
          "The thigh may move inward or rotate while the pelvis also shifts. These events can coexist with knee displacement, but they should be described separately. The asymmetric hip-shift recipe focuses on the pelvis; this one focuses on the knee relative to the foot.",
          "Muscle-activity studies of medial knee displacement examine coordination during a particular squat. Electrical activity is not a strength test, so the visual pattern cannot be reduced to 'weak glutes' on that basis.",
        ],
        evidence: ["kneeActivation"],
      },
      {
        heading: "Keep the task in the explanation",
        paragraphs: [
          "A two-leg squat, a single-leg step and a landing ask for different forms of control. A finding in one does not automatically describe how the person moves in the others.",
          "The related foot-pronation and heel-rise recipes are included to separate accompanying changes in contact or ankle motion. Their presence in the library is not evidence that either caused the knee to move inward.",
        ],
      },
    ],
    interpretation:
      "This movement label does not diagnose ligament injury, predict injury from one repetition, or confirm an adduction syndrome. Interpret timing, task and symptoms alongside the muscle references.",
    connections: [
      {
        slug: "heel-rise",
        reason:
          "Explore ankle movement and contact when the heel changes at the same point as the knee path.",
      },
      {
        slug: "valgus-foot",
        reason:
          "Distinguish accompanying foot motion from the knee displacement rather than assuming a one-way cause.",
      },
      {
        slug: "asymmetric-weight-shift",
        reason: "Describe a simultaneous pelvic shift separately from inward knee travel.",
      },
    ],
  },
  "heel-rise": {
    title: "What changes when the heel leaves the ground?",
    intro: [
      "As a squat becomes deeper, a heel may lose contact with the floor. Record when that happens and whether it occurs on one or both sides. Heel rise describes a contact change; it does not, by itself, explain whether the ankle, stance or the overall movement strategy is responsible.",
    ],
    sections: [
      {
        heading: "Ankle range and the rest of the squat are connected",
        paragraphs: [
          "Keeping the heel supported while the shin moves forward uses ankle dorsiflexion. When that movement is limited, the rest of the squat may change rather than following one fixed compensation.",
          "A study comparing people with and without limited ankle dorsiflexion found differences in trunk, hip and lumbar movement. This supports linking heel contact to the wider squat strategy, but the study did not establish heel rise as a test of calf shortening.",
        ],
        evidence: ["ankleLean"],
      },
      {
        heading: "Lifting a heel is not the same as using a heel wedge",
        paragraphs: [
          "A heel wedge gives the heel an elevated support surface; an unsupported rising heel changes where the foot contacts the floor. These conditions should not be treated as equivalent.",
          "In recreational lifters, one study found no significant change in measured trunk angles across heel-raised setups. A response to heel elevation is therefore a task-specific observation, not a guaranteed correction or a diagnosis of the original cause.",
        ],
        evidence: ["heelResponse"],
      },
      {
        heading: "Follow the other changes at the same depth",
        paragraphs: [
          "Does the chest incline more before contact is lost? Does one foot turn farther outward? Does the pelvis shift toward the other leg? Those questions connect heel rise to the forward-lean, turnout and asymmetric-shift recipes without assuming that all three must be present.",
          "The distinction is useful for describing the sequence: a heel that rises first and a heel that rises after a large shift are not necessarily parts of the same strategy.",
        ],
      },
    ],
    interpretation:
      "The appearance of heel rise does not identify a particular calf muscle or justify forcing greater depth. The related cards help separate accompanying movements, not prescribe one solution.",
    connections: [
      {
        slug: "excessive-forward-trunk-leaning",
        reason: "Compare trunk movement with the point at which heel contact changes.",
      },
      {
        slug: "feet-turn-out",
        reason: "Follow a changing foot angle independently from the heel losing support.",
      },
      {
        slug: "asymmetric-weight-shift",
        reason:
          "Explore side-to-side differences when only one heel rises or the pelvis moves sideways.",
      },
    ],
  },
};
