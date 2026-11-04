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
          "The coracobrachialis connects the coracoid process to the upper arm and helps bring the arm forward and toward the body. The subclavius lies beneath the collarbone and helps stabilize and lower it.",
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
      { heading: "A practical sequence", paragraphs: ["Start with mobility work, then practice shoulder-blade control and connect it with a whole-body pulling exercise."], table: { caption: "Preparation → mobility → control → integration", columns: ["Phase", "Purpose", "Targets / Exercise", "How it connects"], rows: [["Inhibit · Prepare", "Address tension in tissues that restrict shoulder movement.", "Self-myofascial release: latissimus dorsi; pectoralis major and pectoralis minor; soft tissues around the thoracic region.", "Prepare for the mobility work that follows."], ["Lengthen · Mobilize", "Develop the available motion needed to raise and open the arms.", "Stretching: latissimus dorsi, pectoralis major and pectoralis minor. Thoracic extension mobility.", "Practice using the available movement with control."], ["Activate · Control", "Control the shoulder blades as the arms move.", "Rhomboid major, rhomboid minor, middle trapezius and lower trapezius. Ball Combo 2 — see the video below.", "Connect targeted strengthening with a coordinated pulling movement."], ["Integrate · Coordinate", "Combine lower-body movement with control of the trunk, shoulder blades and arms.", "Squat to row — transverse plane.", "Coordinate the movement of the shoulder blades and arms as you pull."]] } },
      { heading: "Ball Combo 2", paragraphs: ["Watch the demonstration of Dumbbell Ball Combo II below."], video: { youtubeId: "Ok46ZtftfhU", title: "Dumbbell Ball Combo II" } },
      { heading: "Coordinate the shoulder blades and arms", paragraphs: ["During a row, the upper arms move backward and the shoulder blades retract. The latissimus dorsi contributes to the pull, while the rhomboids and trapezius help control the shoulder blades.", "The aim is to coordinate these movements—not simply to pull the elbows as far back as possible.", "Squat to row combines this pulling movement with movement of the legs and trunk."] },
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
    title: "Forward Head Posture",
    intro: [
      "You notice your head sitting forward. You pull it back, straighten up—and before long, you are back in the same position.",
      "There is plenty of advice about ideal neck posture. But knowing where the head “should” sit does not explain why keeping it there feels like work.",
      "The useful starting point is how the neck, shoulders and upper back share that work.",
    ],
    sections: [
      {
        heading: "How the muscles influence head position",
        paragraphs: [
          "The cervical spine contains seven vertebrae and normally has a gentle inward curve. A forward head position can combine movement of the lower neck with extension higher up, allowing the eyes to stay level.",
          "The suboccipital muscles help control movement near the base of the skull. The sternocleidomastoid, levator scapulae and upper trapezius also contribute to movement around the head, neck and shoulder girdle. The pectorals influence the shoulders and upper arms, connecting shoulder work with the position of the upper body.",
          "Janda’s upper-crossed model brings these regions together as a muscle-imbalance pattern. It provides a framework for considering tension, mobility and control—not just the outline of the neck.",
        ],
      },
      {
        heading: "Training harder is not always the missing piece",
        paragraphs: [
          "During a push-up, pull-up or sit-up, notice what happens as the movement gets difficult. Does the head reach forward? Does the neck tighten as you try to finish?",
          "The exercise changes, but the same strategy can keep showing up.",
          "The aim is not simply to strengthen more muscles. It is to develop control without repeatedly relying on unnecessary neck effort.",
        ],
      },
      {
        heading: "A practical sequence",
        paragraphs: [
          "Preparation and mobility come first. Targeted strengthening then develops control, before a coordinated exercise brings the regions together.",
        ],
        table: {
          caption: "Preparation → mobility → control → integration",
          columns: ["Phase", "Approach", "Muscles / Exercises"],
          rows: [
            ["Inhibit · Prepare", "Region-appropriate self-myofascial techniques.", "Cervical extensors (suboccipital muscles); levator scapulae; sternocleidomastoid; upper trapezius."],
            ["Lengthen · Mobilize", "Static stretching.", "Levator scapulae; sternocleidomastoid; upper trapezius."],
            ["Activate · Control", "Targeted strengthening.", "Incline dumbbell scaption; quadruped chin tucks with a stability ball."],
            ["Integrate · Coordinate", "Coordinated dynamic movement.", "Ball Combo 1; squat to row."],
          ],
        },
      },
      {
        heading: "Develop control through the neck and shoulders",
        paragraphs: [
          "The deep neck flexors—longus capitis and longus colli—contribute to control at the front of the cervical spine. Shoulder-blade control, including the contribution of the lower trapezius, belongs alongside that neck work.",
          "The purpose is not to hold everything rigidly in a “correct” position. It is to make the movement easier to control.",
        ],
      },
      {
        heading: "Ball Combo 1",
        paragraphs: ["Watch the Ball Combo I demonstration below."],
        video: { youtubeId: "xb3-dysLHpE", title: "Ball Combo I" },
      },
      {
        heading: "Simple on paper. More demanding in practice.",
        paragraphs: [
          "Reduce unnecessary tension. Develop control. Bring it into movement.",
          "Easy, right?",
          "I thought so too—until I started working through the details.",
          "Knowing the muscle names is one thing. Choosing an appropriate target, finding the right setup and progressing without adding more neck effort is another.",
          "Our guided program takes you through that process step by step.",
        ],
      },
    ],
    interpretation:
      "",
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
