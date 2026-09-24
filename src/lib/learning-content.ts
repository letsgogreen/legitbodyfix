export type LearningContent = {
  eyebrow: string;
  title: string;
  introduction: string;
  principles: Array<{ title: string; body: string }>;
  checks: string[];
  routine: Array<{ step: string; title: string; body: string }>;
  habits: string[];
  safety: string;
};

export const neckLearningContent: LearningContent = {
  eyebrow: "Before you begin",
  title: "Build capacity, not a perfect posture.",
  introduction:
    "Forward-head posture can change the demand on the neck, but posture alone does not explain pain. Use this session to improve movement options, strength, endurance, and tolerance for the tasks you actually do.",
  principles: [
    {
      title: "The neck works as a system",
      body: "The cervical spine, upper back, shoulder blades, eyes, and balance system work together. A useful plan looks beyond one isolated muscle.",
    },
    {
      title: "Posture is one observation",
      body: "A forward head or rounded shoulders may be relevant, but they do not prove that a muscle is tight, weak, or causing pain. Your response to movement matters more.",
    },
    {
      title: "Load changes with position",
      body: "Looking down increases the work required from the neck. This does not make flexion dangerous; duration, recovery, variation, and current capacity determine how well it is tolerated.",
    },
  ],
  checks: [
    "Turn your head left and right and note the easier side.",
    "Look up and down within a comfortable range.",
    "Notice whether symptoms travel into the arm or hand.",
    "Estimate how long you can work at a screen before symptoms rise.",
  ],
  routine: [
    {
      step: "01",
      title: "Settle",
      body: "Reduce unnecessary effort and find a comfortable starting range.",
    },
    {
      step: "02",
      title: "Control",
      body: "Practice slow cervical and scapular movement without forcing an ideal position.",
    },
    {
      step: "03",
      title: "Build",
      body: "Develop neck and shoulder-girdle strength and endurance progressively.",
    },
    {
      step: "04",
      title: "Integrate",
      body: "Bring the new capacity back to reaching, lifting, training, and desk work.",
    },
  ],
  habits: [
    "Change position before discomfort becomes intense.",
    "Bring the screen closer when reading small text instead of holding one deep angle.",
    "Use brief movement breaks; no single posture needs to be held perfectly.",
    "Increase exercise range or load only when the current level remains well tolerated.",
  ],
  safety:
    "Seek appropriate care after significant trauma, or if you develop progressive weakness, persistent numbness, loss of balance, severe unusual headache, fever, or rapidly worsening symptoms. This program provides movement education and does not replace medical diagnosis or treatment.",
};

export const defaultLearningContent: LearningContent = {
  eyebrow: "Session guide",
  title: "Turn the lesson into a repeatable practice.",
  introduction:
    "Watch the lesson, use the checks to choose an appropriate starting level, and progress only when the current version feels controlled and repeatable.",
  principles: [
    {
      title: "Start with context",
      body: "Symptoms, movement, strength, and daily demands all help determine the right starting point.",
    },
    {
      title: "Use a workable range",
      body: "Begin where you can move with control. Range and resistance can grow over time.",
    },
    {
      title: "Reassess the task",
      body: "The goal is not just to complete an exercise, but to improve the movement that brought you here.",
    },
  ],
  checks: [
    "Note the movement that currently feels most limited.",
    "Choose a comfortable starting range.",
    "Record any symptoms that spread away from the working area.",
    "Recheck the original movement after the session.",
  ],
  routine: [
    {
      step: "01",
      title: "Prepare",
      body: "Find a comfortable starting position and review the lesson cues.",
    },
    { step: "02", title: "Practice", body: "Use a controlled range and the suggested dosage." },
    {
      step: "03",
      title: "Progress",
      body: "Add range, resistance, or complexity one variable at a time.",
    },
    { step: "04", title: "Reassess", body: "Repeat the original movement and note what changed." },
  ],
  habits: [
    "Keep practice short enough to repeat consistently.",
    "Adjust range before abandoning an exercise.",
    "Avoid treating normal effort as damage.",
    "Use the next-day response to guide progression.",
  ],
  safety:
    "Pause and seek appropriate care if symptoms are severe, rapidly worsening, or accompanied by progressive weakness, persistent numbness, loss of balance, fever, or significant trauma. This program does not replace medical diagnosis or treatment.",
};

export function learningContentFor(
  programSlug: string,
  programName: string,
  stored: unknown,
): LearningContent {
  const fallback = /neck|cervical|shoulder reset/.test(
    `${programSlug} ${programName}`.toLowerCase(),
  )
    ? neckLearningContent
    : defaultLearningContent;
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return fallback;
  const value = stored as Partial<LearningContent>;
  return {
    eyebrow: typeof value.eyebrow === "string" ? value.eyebrow : fallback.eyebrow,
    title: typeof value.title === "string" ? value.title : fallback.title,
    introduction:
      typeof value.introduction === "string" ? value.introduction : fallback.introduction,
    principles: Array.isArray(value.principles) ? value.principles : fallback.principles,
    checks: Array.isArray(value.checks)
      ? value.checks.filter((item): item is string => typeof item === "string")
      : fallback.checks,
    routine: Array.isArray(value.routine) ? value.routine : fallback.routine,
    habits: Array.isArray(value.habits)
      ? value.habits.filter((item): item is string => typeof item === "string")
      : fallback.habits,
    safety: typeof value.safety === "string" ? value.safety : fallback.safety,
  };
}
