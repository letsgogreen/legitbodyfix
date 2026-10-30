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
  pelvicMotorStrategies: {
    title: "Ludwig et al. — Muscular strategies for correcting pelvic position",
    url: "https://pubmed.ncbi.nlm.nih.gov/38390925/",
    scope: "Exploratory surface-EMG study of 41 people performing voluntary pelvic retroversion. Four activation clusters, not four established causes of anterior pelvic tilt or a comparison of passive muscle stiffness.",
  },
  hipExtensionPosture: {
    title: "Heino et al. — Hip extension range and postural alignment",
    url: "https://pubmed.ncbi.nlm.nih.gov/18796868/",
    scope: "Correlational study of 25 healthy adults. Hip-extension range showed little association with standing pelvic tilt, lordosis or abdominal performance; not a test of every symptomatic subgroup.",
  },
  iliopsoasShortnessControl: {
    title: "Park et al. — Iliopsoas stretching and abdominal control during prone hip extension",
    url: "https://pubmed.ncbi.nlm.nih.gov/34250929/",
    scope: "Repeated-condition exercise study of 25 individuals with iliopsoas shortness. Immediate pelvic kinematics and muscle activity, not long-term standing-posture correction in a general population.",
  },
  activeLumbopelvicControl: {
    title: "De Ridder et al. — Active lumbopelvic control during extension exercises",
    url: "https://pubmed.ncbi.nlm.nih.gov/28371661/",
    scope: "13 healthy adults trained in a control strategy, then tested during high-load prone extension exercises. Task-specific kinematics and EMG, not proof of underlying muscle weakness or passive stiffness.",
  },
  runningPelvicTilt: {
    title: "Schache et al. — Pelvic tilt and clinical versus running hip extension",
    url: "https://pubmed.ncbi.nlm.nih.gov/10953901/",
    scope: "14 elite athletes running on a treadmill at 20 km/h. Static hip-extension flexibility was not significantly correlated with running pelvic tilt or peak hip extension; findings are task- and sample-specific.",
  },
  thomasPelvicControl: {
    title: "Vigotsky et al. — Pelvic control and modified Thomas test validity",
    url: "https://pubmed.ncbi.nlm.nih.gov/27602291/",
    scope: "29 healthy college students. Validity of hip-extension measurement depended on accounting for pelvic tilt; does not isolate the length or stiffness of one hip-flexor muscle.",
  },
  sahrmannLumbarExtension: {
    title: "Sahrmann — Diagnosis and Treatment of Movement Impairment Syndromes, Chapter 3",
    url: "https://elsevier-elibrary.com/contents/fullcontent/58610/epubcontent_v2/OEBPS/xhtml/B9780801672057500061B.htm",
    scope: "Textbook clinical framework: Lumbar Extension Syndrome, Flexibility and Stiffness Impairments. Quoted for the relationship between hip-flexor and abdominal stiffness in that syndrome, not a universal finding in every anteriorly tilted pelvis. Print page number not verified.",
  },
  squatTiltOnset: {
    title: "Mata et al. — Hip flexion angles during supine range of motion and bodyweight squats",
    url: "https://pubmed.ncbi.nlm.nih.gov/34567352/",
    scope: "28 participants; hip flexion at posterior-tilt onset compared across standard and heel-raised bodyweight squats and passive hip flexion. Task kinematics, not a loaded-squat injury threshold.",
  },
  hamstringPelvicRotation: {
    title: "Congdon et al. — Hamstring length and posterior pelvic rotation during hip flexion",
    url: "https://pubmed.ncbi.nlm.nih.gov/15975697/",
    scope: "Bilateral active hip flexion with the knees held at three angles. Examines hamstring-length and knee-position influences on pelvic rotation, not a diagnosis of the cause of a deep-squat tuck.",
  },
  pelvicStandingVariation: {
    title: "Herrington — Pelvic tilt in an asymptomatic population",
    url: "https://pubmed.ncbi.nlm.nih.gov/21658988/",
    scope: "Landmark-based standing measurements in 120 healthy young adults. Anterior tilt was common; the study did not establish a pathological cutoff or assess movement control.",
  },
  abdominalPelvicAngle: {
    title: "Walker et al. — Pelvic tilt, lumbar lordosis and abdominal performance",
    url: "https://pubmed.ncbi.nlm.nih.gov/2951745/",
    scope: "1987 study of 31 healthy adults using specific standing-angle and abdominal-performance measures. Weak correlations do not rule out all task-specific roles of the abdominal muscles.",
  },
  pelvicHamstringLength: {
    title: "Mendiguchia et al. — Anterior pelvic tilt and hamstring tissue elongation",
    url: "https://pubmed.ncbi.nlm.nih.gov/38391038/",
    scope: "Seven fresh-frozen specimens with controlled pelvic movement and fixed leg positions. Tissue elongation was measured, not living muscle strength, symptoms or prospective injury risk.",
  },
  pelvicHipOrientation: {
    title: "Effect of pelvic tilt on hip motion to bony impingement",
    url: "https://pubmed.ncbi.nlm.nih.gov/25060073/",
    scope: "CT-based computer modelling in a hip-impingement cohort. Describes changes in bony clearance, not a universal squat limit or a treatment result in healthy people.",
  },
  lateralShiftThesis: {
    title: "Peterson — Lateral hip shift, muscle activation and range of motion",
    url: "https://uncexss.wordpress.com/2015/09/21/presence-of-a-lateral-hip-shift-during-squatting-is-associated-with-altered-mobility-and-neuromuscular-control/",
    scope: "University department summary of a 2015 master's thesis involving 40 participants. Preliminary group associations, not a treatment trial or a validated muscle-by-muscle correction map.",
  },
  squatLoadAsymmetry: {
    title: "Medial–lateral hip position and squat loading after ACL reconstruction",
    url: "https://pubmed.ncbi.nlm.nih.gov/34628200/",
    scope: "17 collegiate athletes after ACL reconstruction; hip position correlated with force and knee-moment asymmetry. Findings do not give a universal loading estimate for an uninjured person.",
  },
  healthyHipAsymmetry: {
    title: "Johnson et al. — Bilateral hip kinematics in healthy adults during walking and squatting",
    url: "https://pubmed.ncbi.nlm.nih.gov/36067648/",
    scope: "Biplane-radiography study of 24 asymptomatic young adults. Side-to-side hip differences were present; this is not a severity threshold for visible pelvic shift.",
  },
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
