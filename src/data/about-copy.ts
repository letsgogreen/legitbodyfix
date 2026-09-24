export const aboutCopyDefaults = {
  about_eyebrow: "About us",
  about_title: "Movement education with a clear progression.",
  about_intro: "LegitBodyFix turns anatomy, movement patterns, and practical exercise progressions into focused resources you can revisit at your own pace.",
  about_method_title: "How the material is built",
  about_method_body: "Resources connect a movement goal with relevant anatomy, a practical starting point, and a progression back to daily activity or training.",
  about_scope_title: "Scope",
  about_scope_body: "LegitBodyFix provides educational movement content, not medical diagnosis or treatment.",
  about_operator_title: "Operator",
  about_operator_body: "LegitBodyFix is operated by Song J.",
  about_credentials_title: "Credentials",
  about_credentials_body: "NASM Corrective Exercise Specialization (CES)\nNational Academy of Sports Medicine (NASM)\n\nNASM Corrective Exercise Specialists focus on movement using their skills to assess and correct muscle imbalances and movement compensations. They develop customized plans that enhance mobility and performance, as well as proactive and preventive programs that reduce the risk of future injuries.",
} as const;

export type AboutCopyKey = keyof typeof aboutCopyDefaults;
export type AboutCopy = Record<AboutCopyKey, string>;

