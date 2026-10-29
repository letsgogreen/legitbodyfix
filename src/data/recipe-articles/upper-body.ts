import type { PatternArticle } from "./types.ts";

export const upperBodyArticles: Record<string, PatternArticle> = {
  "round-shoulder": {
    title: "Rounded shoulders: a resting outline or a reaching strategy?",
    intro: [
      "From the side, the shoulders may sit forward of the trunk. During a reach, they may also travel forward deliberately. Those appearances are not interchangeable: the shoulder blade needs to move around the ribcage, while a resting photograph captures only one position.",
    ],
    sections: [
      {
        heading: "The upper back changes the starting point",
        paragraphs: [
          "The shoulder blades sit on the thorax, so a change in upper-back position changes their starting relationship to the arms. In an experiment comparing upright and slouched postures, thoracic position affected scapular motion and shoulder range. This provides a mechanical connection, not a verdict that a rounded upper back is harmful.",
          "A separate adopted-posture study also found changes in arm mobility and neck–shoulder recruitment. These are task responses; they are not evidence that the same posture explains every person's discomfort.",
        ],
        evidence: ["thoraxShoulder", "slouchReach"],
      },
      {
        heading: "Forward is not the same as tipped forward",
        paragraphs: [
          "Protraction describes a shoulder blade travelling around the ribcage. Anterior tilt describes its top tipping forward relative to its bottom. Either can contribute to a 'rounded' outline, and a photograph may not distinguish them well.",
          "Pectoralis minor resting length has been associated with differences in scapular movement in pain-free volunteers. That makes its mechanics relevant to explore, but does not mean every forward shoulder has a shortened pectoralis minor.",
        ],
        evidence: ["pecMinor"],
      },
      {
        heading: "Why the head position is a related question",
        paragraphs: [
          "A forward head and forward shoulders can be observed together. In that case, describe the head relative to the thorax separately from the shoulder blade relative to the ribs. Group research during overhead tasks considered head and shoulder posture together, so it cannot establish that one caused the other.",
          "The related recipes below separate these overlapping observations. They help replace the broad instruction 'pull your shoulders back' with a clearer account of which movement is actually changing.",
        ],
        evidence: ["headShoulder"],
      },
    ],
    interpretation:
      "A resting shoulder outline does not diagnose tissue shortening, weakness or pain. Interpret it alongside comfortable movement and the task, rather than trying to keep the shoulder blades retracted throughout every reach.",
    connections: [
      {
        slug: "scapula-anterior-tilt",
        reason:
          "Distinguish a shoulder blade tipping forward from one moving forward around the ribcage.",
      },
      {
        slug: "forward-head-posture",
        reason:
          "Describe the head–thorax relationship separately when forward shoulders and head position coexist.",
      },
      {
        slug: "shoulder-elevation",
        reason:
          "Separate forward shoulder position from the upward movement that occurs during arm elevation.",
      },
    ],
  },
  "forward-head-posture": {
    title: "What does a forward head position tell you?",
    intro: [
      "During screen work or a reach, the head may sit farther forward relative to the upper trunk. That outline does not tell the whole story: the thorax may have moved, the head may have translated, or the neck may be using a different combination of angles to keep the eyes directed toward the task.",
    ],
    sections: [
      {
        heading: "Choose the reference before naming the change",
        paragraphs: [
          "The head's location in the room is different from its location relative to the chest. If the whole trunk leans forward, the head can move forward in space without the same change in the neck. Keeping those descriptions separate avoids interpreting every screen-facing position as one identical pattern.",
          "The rounded-shoulder recipe is related because the upper trunk and shoulder girdle may share the same task. Their positions should still be described separately rather than combined into a guaranteed syndrome.",
        ],
      },
      {
        heading: "The connection with overhead movement",
        paragraphs: [
          "Research comparing groups with different head-and-shoulder postures found differences in scapular mechanics and muscle activity during overhead tasks. This supports considering the shoulder region when looking at a neck posture, but it does not identify which region initiated the difference.",
          "If the shoulder also rises during a reach, the shoulder-elevation recipe helps distinguish that upward movement from the head moving forward. A single still image cannot reveal the sequence.",
        ],
        evidence: ["headShoulder"],
      },
      {
        heading: "Appearance and symptoms are different questions",
        paragraphs: [
          "A study of 43 volunteers found no significant difference in forward head posture between the neck-pain and asymptomatic groups, while movement range and speed differed. An earlier comparison did find a more forward head position in its pain group. These different results are a reason not to use a head angle as a substitute for assessing symptoms and movement.",
          "A useful explanation therefore describes when the position appears, whether it changes during the task, and how the movement feels. It does not turn a photograph into a prediction of pain.",
        ],
        evidence: ["headPain", "headPainComparison"],
      },
    ],
    interpretation:
      "The related cards describe neighbouring movements, not a chain that must be corrected from one end. Head position alone cannot establish weak deep-neck muscles or shortened superficial muscles.",
    connections: [
      {
        slug: "round-shoulder",
        reason:
          "Consider the shared task while separating shoulder position from the head's relationship to the thorax.",
      },
      {
        slug: "shoulder-elevation",
        reason:
          "Distinguish an upward shoulder strategy during a reach from a change in head position.",
      },
    ],
  },
  "shoulder-elevation": {
    title: "When is a rising shoulder part of the reach?",
    intro: [
      "As the arm rises, the shoulder girdle normally moves too. Seeing the shoulder approach the ear is therefore not enough to label the movement excessive. The more useful question is how that upward movement relates to the arm, shoulder blade and trunk throughout the reach.",
    ],
    sections: [
      {
        heading: "Upward movement is not the same as a shrug-only strategy",
        paragraphs: [
          "Three-dimensional measurements in healthy shoulders show coordinated clavicular, scapular and arm motion during elevation. The collarbone elevates and rotates while the shoulder blade changes orientation. Holding the shoulder down throughout an overhead reach would not reproduce that moving system.",
          "Describe whether the shoulder rises as part of the arm's progression or whether the person mainly lifts the shoulder while little arm movement follows. This is a timing distinction, not a diagnosis of upper-trapezius overactivity.",
        ],
        evidence: ["shoulder3d"],
      },
      {
        heading: "The thorax changes the shoulder's starting conditions",
        paragraphs: [
          "In a thoracic-posture experiment, the scapula was more elevated through part of arm abduction in the slouched condition. This gives a reason to look at the upper trunk as well as the shoulder itself.",
          "A rounded-shoulder outline, a forward head and a rising shoulder may all be visible during one task. Separate the forward and upward components before treating them as the same problem.",
        ],
        evidence: ["thoraxShoulder"],
      },
      {
        heading: "Check tilt as well as height",
        paragraphs: [
          "Scapular anterior tilt refers to a shoulder blade tipping; elevation refers to it moving upward. The blade can change both at once. If the lower tip becomes more prominent during the reach, that is a different observation from the distance between the shoulder and ear.",
          "The related recipes offer these different views of the same region. None implies that every elevated shoulder needs to be depressed or that one neck muscle should be inhibited.",
        ],
      },
    ],
    interpretation:
      "Judge the strategy in the context of the task and symptoms. Shoulder height by itself cannot identify a tight muscle, a nerve problem or the source of neck discomfort.",
    connections: [
      {
        slug: "scapula-anterior-tilt",
        reason: "Separate a shoulder blade's tilt from its upward travel during arm movement.",
      },
      {
        slug: "round-shoulder",
        reason:
          "Compare the forward starting position with the upward movement of the shoulder girdle.",
      },
      {
        slug: "forward-head-posture",
        reason:
          "Describe a simultaneous change in head position without assuming the neck caused the shoulder strategy.",
      },
    ],
  },
  "scapula-anterior-tilt": {
    title: "A shoulder blade can move forward without tipping forward",
    intro: [
      "When the lower tip of the shoulder blade becomes prominent, it may look as though the whole shoulder is rolling forward. Anterior tilt is a more specific description: the blade's top tips forward relative to its bottom. This differs from protraction around the ribs or simply lifting the shoulder.",
    ],
    sections: [
      {
        heading: "The shoulder blade moves in more than one direction",
        paragraphs: [
          "During arm elevation, healthy shoulder-complex research records coordinated rotation at the collarbone, shoulder blade and upper arm. Upward rotation and changes in tilt are part of that system. A resting orientation is not a complete description of what the blade does during a reach.",
          "Look at the progression, not only the final outline. Does the lower tip become more visible as the arm rises, or is its prominence similar throughout? The difference helps describe the motion without prescribing a fixed shoulder-blade position.",
        ],
        evidence: ["shoulder3d"],
      },
      {
        heading: "Why pectoralis minor is relevant, but not the whole explanation",
        paragraphs: [
          "Pectoralis minor connects the ribs to the scapula. Research in pain-free people associated its resting length with differences in scapular kinematics. This makes it an anatomical and research-based connection worth understanding.",
          "It does not allow a visual assessment to identify tissue shortening, or prove that releasing this muscle would change the movement. The muscle cards are reference material, not the result of an individual muscle-length test.",
        ],
        evidence: ["pecMinor"],
      },
      {
        heading: "Separate scapular movement from the trunk underneath it",
        paragraphs: [
          "If the front ribs lift and the torso extends during the same reach, describe that trunk movement separately. The blade's outline is being viewed against a moving ribcage, not a fixed flat surface.",
          "Rounded shoulders is a broader description of the forward outline; shoulder elevation follows upward travel. Linking those recipes makes the distinctions clearer without turning three descriptions into three separate diagnoses.",
        ],
      },
    ],
    interpretation:
      "A prominent scapular border or lower tip does not, by appearance alone, diagnose nerve injury, impingement or a specific muscle deficit. This article explains movement relationships rather than predicting pathology.",
    connections: [
      {
        slug: "round-shoulder",
        reason:
          "Compare a forward shoulder outline with the more specific motion of scapular tipping.",
      },
      {
        slug: "shoulder-elevation",
        reason: "Distinguish upward travel from changes in scapular tilt during a reach.",
      },
      {
        slug: "rib-flare",
        reason:
          "Follow ribcage and trunk movement underneath the shoulder blade as a separate observation.",
      },
    ],
  },
};
