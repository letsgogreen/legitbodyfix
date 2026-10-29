export type PatternSection = {
  heading: string;
  paragraphs: string[];
  evidence?: string[];
};

export type PatternArticle = {
  title: string;
  intro: string[];
  sections: PatternSection[];
  interpretation: string;
  connections: Array<{ slug: string; reason: string }>;
};

export const patternSources: Record<string, { title: string; url: string; scope: string }> = {
  pelvicLandmarks: {
    title: "Preece et al. — Pelvic morphology and measures of anterior tilt",
    url: "https://pubmed.ncbi.nlm.nih.gov/19119397/",
    scope:
      "Anatomical measurement study; landmark angles are influenced by bone shape, not just orientation.",
  },
  hipPelvis: {
    title: "Kinematic analysis of healthy hips during weight-bearing activities",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4258366/",
    scope:
      "Healthy-participant motion study; describes hip and pelvic coordination, not a treatment threshold.",
  },
  hipTask: {
    title: "Diamond et al. — Squatting in symptomatic hip impingement",
    url: "https://pubmed.ncbi.nlm.nih.gov/28709152/",
    scope:
      "Task-dependent findings in a symptomatic population; not a diagnosis of the reader's hip.",
  },
  unilateralFoot: {
    title: "Resende et al. — Experimentally increased unilateral foot pronation during walking",
    url: "https://pubmed.ncbi.nlm.nih.gov/25468683/",
    scope:
      "Induced foot-position experiment in walking; not proof of the cause of a habitual squat shift.",
  },
  footPelvis: {
    title: "Hornestam et al. — Foot pronation and pelvic motion during gait",
    url: "https://pubmed.ncbi.nlm.nih.gov/34020879/",
    scope:
      "Insole-induced pronation in 20 participants; findings cannot be applied to every naturally low arch.",
  },
  breathing: {
    title: "Mendes et al. — Posture and chest-wall motion during quiet breathing",
    url: "https://pubmed.ncbi.nlm.nih.gov/30967355/",
    scope:
      "83 healthy participants in different body positions; not a test or treatment study of rib flare.",
  },
  thoraxShoulder: {
    title: "Kebaetse et al. — Thoracic position and shoulder motion",
    url: "https://pubmed.ncbi.nlm.nih.gov/10453773/",
    scope:
      "Experimentally adopted thoracic postures; does not establish that a resting posture causes pain.",
  },
  slouchReach: {
    title: "Slouched posture, arm mobility and neck–shoulder recruitment",
    url: "https://pubmed.ncbi.nlm.nih.gov/26429723/",
    scope:
      "Task-specific changes in an adopted posture; not evidence that slouching damages the shoulder.",
  },
  headShoulder: {
    title: "Thigpen et al. — Head and shoulder posture during overhead tasks",
    url: "https://pubmed.ncbi.nlm.nih.gov/20097090/",
    scope:
      "Group differences during overhead tasks; head and shoulder position were considered together.",
  },
  headPain: {
    title: "Forward head posture and non-specific neck pain: a cross-sectional study",
    url: "https://pubmed.ncbi.nlm.nih.gov/35196950/",
    scope:
      "43 volunteers; no significant between-group difference in forward head posture in this sample.",
  },
  headPainComparison: {
    title: "Head posture in chronic non-traumatic neck pain and pain-free participants",
    url: "https://pubmed.ncbi.nlm.nih.gov/19345785/",
    scope:
      "Group comparison reporting a posture difference; association does not establish which came first.",
  },
  shoulder3d: {
    title: "Ludewig et al. — Three-dimensional motion of the shoulder complex",
    url: "https://pubmed.ncbi.nlm.nih.gov/19181982/",
    scope:
      "Bone-pin measurements in 12 participants without shoulder abnormality; describes coordinated motion.",
  },
  pecMinor: {
    title: "Borstad & Ludewig — Pectoralis minor resting length and scapular kinematics",
    url: "https://pubmed.ncbi.nlm.nih.gov/15901124/",
    scope:
      "Association in pain-free volunteers; not proof that stretching one muscle changes a person's symptoms.",
  },
  stance: {
    title: "Lorenzetti et al. — Stance width, foot angle and squat mechanics",
    url: "https://pubmed.ncbi.nlm.nih.gov/30026952/",
    scope:
      "Squat-setup experiment; foot and stance changes affect mechanics but do not identify one ideal setup.",
  },
  kneeAnkle: {
    title: "Range of motion and alignment in people with medial knee displacement",
    url: "https://pubmed.ncbi.nlm.nih.gov/24926910/",
    scope:
      "Group comparison; an association with ankle range is not an individual diagnosis or causal sequence.",
  },
  kneeActivation: {
    title: "Neuromuscular characteristics of medial knee displacement",
    url: "https://pubmed.ncbi.nlm.nih.gov/23068590/",
    scope:
      "Muscle activity during a double-leg squat; electrical activity is not a direct measure of strength.",
  },
  ankleLean: {
    title: "Zawadka et al. — Limited ankle dorsiflexion and squat kinematics",
    url: "https://pubmed.ncbi.nlm.nih.gov/41196246/",
    scope:
      "Observational comparison of 44 participants; not a test of which calf muscle requires treatment.",
  },
  heelResponse: {
    title: "Heel-raised foot posture during the barbell back squat",
    url: "https://pubmed.ncbi.nlm.nih.gov/30789547/",
    scope:
      "Recreational lifters; heel-raised conditions did not significantly change measured trunk angles in this sample.",
  },
  jointDemand: {
    title: "Graber et al. — Trunk/shin position and the hip-to-knee moment ratio",
    url: "https://pubmed.ncbi.nlm.nih.gov/37001335/",
    scope:
      "Observational study of 100 people; joint moments describe mechanical demand, not muscle weakness.",
  },
};
