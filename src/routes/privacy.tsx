import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy notice">
      <section><h2>1. Information we process</h2><p>We may process your email address and authentication information, records of programs you can access, support messages you send, and basic technical information needed to operate and secure the site. Payment card details are collected and processed by Paddle rather than stored by LegitBodyFix.</p></section>
      <section><h2>2. Why we use it</h2><ul><li>To sign you in and provide purchased content.</li><li>To connect a completed purchase to your library.</li><li>To answer support requests and restore access.</li><li>To operate, secure, troubleshoot, and improve the service.</li><li>To comply with legal, tax, fraud-prevention, and accounting obligations.</li></ul></section>
      <section><h2>3. Service providers</h2><p>We use service providers to operate LegitBodyFix, including Supabase for authentication, database, and file storage; Paddle for checkout, payments, tax, receipts, and transaction support; Cloudflare for video delivery and infrastructure; and Vercel for application hosting and deployment. These providers process data under their own terms and privacy notices.</p></section>
      <section><h2>4. Retention and security</h2><p>We keep information only as long as reasonably needed for the purposes described above, including providing ongoing purchased access and meeting legal obligations. We use reasonable technical and organisational safeguards, but no online system can be guaranteed completely secure.</p></section>
      <section><h2>5. Your choices and rights</h2><p>Depending on where you live, you may have rights to request access, correction, deletion, restriction, objection, or a copy of personal information. Some records may need to be retained where required by law or to document a transaction. You may also contact Paddle directly about payment information it controls.</p></section>
      <section><h2>6. International processing</h2><p>Our service providers may process information in countries other than your own. Where required, they use recognised safeguards for international data transfers.</p></section>
      <section><h2>7. Contact</h2><p>For a privacy question or request, email <a href="mailto:thriveinside@protonmail.com">thriveinside@protonmail.com</a>. For information Paddle processes as merchant of record, see <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noreferrer">Paddle’s Privacy Notice</a>.</p></section>
    </LegalPage>
  );
}
