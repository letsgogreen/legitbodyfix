import type { PatternArticle } from "./types.ts";

export const upperBodyArticles: Record<string, PatternArticle> = {
  "round-shoulder": {
    title: "Rounded shoulders: look beyond pulling them back",
    intro: [
      "Your shoulders sit forward. You pull them back, lift your chest—and soon find yourself in the same position again.",
      "Holding the shoulders back is not the same as improving how they move. The shoulder blades sit on the ribcage, while the chest muscles and latissimus dorsi influence movement around them. Reaching, pushing and pulling require these parts to work together.",
      "The starting point is to understand what limits the movement, then develop control rather than forcing a position.",
    ],
    sections: [
      {
        heading: "How the chest muscles influence the shoulders",
        paragraphs: [
          "The pectoralis minor connects the ribs to the shoulder blade. Its resting length has been associated with differences in scapular movement during arm elevation, including how the shoulder blade tilts and rotates.",
          "The pectoralis major acts on the upper arm. Together, these muscles make the front of the shoulder relevant when chest flexibility restricts reaching or opening the arms.",
          "This is why chest mobility appears in the sequence—not simply to make the shoulders look farther back, but to address restrictions that affect movement.",
          "Two smaller muscles act on different parts of this region. The coracobrachialis connects the coracoid process to the upper arm and assists shoulder flexion and adduction. The subclavius lies beneath the collarbone and helps stabilize and depress it. Their roles distinguish upper-arm movement from clavicular support; they should not be treated as interchangeable with the pectorals.",
        ],
        evidence: ["pecMinor"],
      },
      {
        heading: "Why the upper back matters",
        paragraphs: [
          "The shoulder blades move over the ribcage. Changing the position of the upper back also changes the surface beneath them.",
          "Research comparing slouched and upright sitting found differences in clavicular and scapular positions during arm elevation. The connection is practical: shoulder movement can change when the trunk position changes.",
          "Thoracic mobility therefore belongs alongside shoulder work. The aim is to allow movement through the upper back without replacing it with an exaggerated lower-back arch or lifted front ribs.",
        ],
        evidence: ["thoraxShoulder"],
      },
      {
        heading: "Where the latissimus dorsi fits",
        paragraphs: [
          "The latissimus dorsi brings the upper arm toward the body and contributes to pulling movements. When its flexibility limits overhead movement, raising the arms may be accompanied by changes in the ribcage and trunk.",
          "This is particularly relevant when the arms fall forward during an overhead squat. That observation is different from the shoulders resting forward, but both give a reason to examine how the upper arm, shoulder blade and trunk move together.",
          "The sequence includes the latissimus dorsi alongside the pectorals rather than treating rounded shoulders as a chest-only issue.",
        ],
      },
      { heading: "Develop control—not a permanent squeeze", paragraphs: ["The rhomboids and middle trapezius contribute to scapular retraction. The lower trapezius also contributes to the coordinated movement of the shoulder blade as the arm rises.", "The purpose of strengthening is not to hold the shoulder blades pinched together throughout the day. They need to move around the ribcage during a reach and return with control during a pull.", "Mobility work and strengthening serve complementary purposes: address relevant restrictions, then practice controlling the movement available."] },
      { heading: "A practical sequence", paragraphs: ["Prepare the relevant tissues, develop available movement, practice muscular control, then connect the work in a whole-body exercise. The source program uses the group names pectorals and rhomboids; their individual muscles are named below. Additions from its accompanying text are identified separately."], table: { caption: "Preparation → mobility → control → integration", columns: ["Phase", "Purpose", "Targets / Exercise", "How it connects"], rows: [["Inhibit · Prepare", "Address tension in tissues that restrict shoulder movement.", "Self-myofascial release: latissimus dorsi; pectoralis major and pectoralis minor; soft tissues around the thoracic region.", "Prepare for the mobility work that follows."], ["Lengthen · Mobilize", "Develop the available motion needed to raise and open the arms.", "Static stretching: latissimus dorsi; pectoralis major and pectoralis minor. The accompanying text also includes thoracic extension mobility.", "Follow mobility work with active control of the movement available."], ["Activate · Control", "Practice controlling the shoulder blades as the arms move, rather than holding them permanently retracted.", "Isolated strengthening: rhomboid major, rhomboid minor, middle trapezius and lower trapezius. The accompanying text adds rotator-cuff work (supraspinatus, infraspinatus, teres minor and subscapularis) and Ball Combo 2; this does not mean Ball Combo 2 trains all four equally.", "Connect targeted strengthening with a coordinated pulling movement."], ["Integrate · Coordinate", "Combine lower-body movement with control of the trunk, shoulder blades and arms.", "Squat to row — transverse plane.", "Emphasize coordinated scapular and arm movement rather than pulling mainly through the latissimus dorsi."]] } },
      { heading: "Ball Combo 2", paragraphs: ["Watch the demonstration of Dumbbell Ball Combo II below."], video: { youtubeId: "Ok46ZtftfhU", title: "Dumbbell Ball Combo II" } },
      { heading: "Using the sequence", paragraphs: ["Coracobrachialis and subclavius are additional muscle references on this page, not extra targets listed in the source program table.", "Thoracic-region soft-tissue work is distinct from thoracic extension mobility. The tissue-preparation entry is not an instruction to apply direct pressure to the vertebrae."] },
      { heading: "Why the row needs attention", paragraphs: ["A row can train pulling without necessarily developing the scapular control you intended.", "The source program specifically highlights the latissimus dorsi’s contribution to rowing. The emphasis is therefore not simply on pulling harder or moving the elbows farther behind the body, but on coordinating the shoulder blades, upper arms and trunk.", "The squat-to-row progression connects that control with lower-body movement. It brings the preceding work into a coordinated task rather than leaving it as separate stretches and muscle exercises."] },
      { heading: "Bring it back to reaching and pulling", paragraphs: ["Return to a comfortable reach or pull. Look for movement through the shoulder blades and upper arms without needing to lift the front ribs, arch the lower back or hold the shoulders rigidly behind you.", "The goal is not to keep the shoulders back all the time. It is to make their movement easier to control."] },
    ],
    connections: [
      {
        slug: "scapula-anterior-tilt",
        reason:
          "Explore how the shoulder blade tips forward, particularly when chest mobility and overhead movement are involved.",
      },
      {
        slug: "forward-head-posture",
        reason:
          "Consider the head and neck alongside the shoulders when reaching or pulling is accompanied by the head moving forward.",
      },
      {
        slug: "shoulder-elevation",
        reason:
          "Explore the upward movement of the shoulder girdle when reaching or pulling becomes dominated by shrugging.",
      },
      { slug: "rib-flare", reason: "Consider the ribcage when lifting the arms is accompanied by the front ribs rising and the lower back arching." },
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
