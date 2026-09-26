type FeedbackEmail = {
  id: string;
  sentiment: "helpful" | "needs_improvement";
  message: string;
  pagePath: string;
  deviceType: "desktop" | "tablet" | "mobile";
  createdAt: string;
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ||
      character,
  );
}

export async function sendFeedbackEmail(feedback: FeedbackEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("Feedback email skipped: RESEND_API_KEY is not configured.");
    return;
  }

  const recipient = process.env.FEEDBACK_EMAIL_TO || "thriveinside@protonmail.com";
  const sender = process.env.FEEDBACK_EMAIL_FROM || "LegitBodyFix Feedback <onboarding@resend.dev>";
  const label = feedback.sentiment === "helpful" ? "Helpful" : "Needs improvement";
  const comment = feedback.message || "No written comment";
  const adminUrl = "https://www.legitbodyfix.com/admin/feedback";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `site-feedback-${feedback.id}`,
    },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      subject: `[LegitBodyFix] New website feedback: ${label}`,
      text: `${label}\n\n${comment}\n\nPage: ${feedback.pagePath}\nDevice: ${feedback.deviceType}\nSubmitted: ${feedback.createdAt}\n\nAdmin: ${adminUrl}`,
      html: `<h2>New website feedback</h2><p><strong>${escapeHtml(label)}</strong></p><p style="white-space:pre-wrap">${escapeHtml(comment)}</p><hr><p>Page: ${escapeHtml(feedback.pagePath)}<br>Device: ${escapeHtml(feedback.deviceType)}<br>Submitted: ${escapeHtml(feedback.createdAt)}</p><p><a href="${adminUrl}">Open the feedback inbox</a></p>`,
    }),
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Resend rejected feedback email (${response.status}): ${detail}`);
  }
}
