import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({ component: TermsPage });

function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of service">
      <section><h2>1. About these terms</h2><p>These terms govern your use of LegitBodyFix, including our movement guides, programs, videos, and related digital content. By using the site or purchasing a program, you agree to these terms.</p></section>
      <section><h2>2. Educational content only</h2><p>LegitBodyFix provides general educational movement and exercise information. It does not provide medical diagnosis, treatment, physiotherapy, or emergency care. Stop an activity that causes pain, dizziness, numbness, or other concerning symptoms and seek advice from a qualified healthcare professional when appropriate.</p><p>You are responsible for deciding whether an activity is suitable for you and for using a safe environment and appropriate equipment.</p></section>
      <section><h2>3. Accounts and access</h2><p>You must provide accurate information and keep access links and account credentials secure. A purchase grants you a personal, limited, non-exclusive, non-transferable right to access the purchased content. You may not share, resell, reproduce, scrape, or redistribute it except where applicable law permits.</p></section>
      <section><h2>4. Purchases</h2><p>Prices and included content are shown before checkout. Purchases are processed by Paddle, our merchant of record and authorised reseller. Paddle may collect payment, calculate tax, issue receipts, and apply its <a href="https://www.paddle.com/legal/buyer-terms" target="_blank" rel="noreferrer">Buyer Terms</a>. Unless a checkout expressly states otherwise, LegitBodyFix programs are one-time purchases rather than recurring subscriptions.</p></section>
      <section><h2>5. Availability and changes</h2><p>We may maintain, improve, replace, or discontinue site features. We aim to keep purchased content available but cannot promise uninterrupted access. If a technical issue prevents delivery, contact us so we can restore access or help arrange an appropriate remedy.</p></section>
      <section><h2>6. Acceptable use</h2><p>Do not misuse the site, interfere with its security, attempt unauthorised access, upload malicious material, or use the content in a way that infringes another person’s rights or violates applicable law.</p></section>
      <section><h2>7. Liability and mandatory rights</h2><p>To the extent permitted by law, the site and content are provided without guarantees of a particular health, performance, or training outcome. Nothing in these terms excludes liability or consumer rights that cannot legally be excluded.</p></section>
      <section><h2>8. Contact</h2><p>Questions about LegitBodyFix content or access can be sent to <a href="mailto:thriveinside@protonmail.com">thriveinside@protonmail.com</a>. Payment and refund requests may also be handled through <a href="https://paddle.net" target="_blank" rel="noreferrer">Paddle Buyer Support</a>.</p></section>
    </LegalPage>
  );
}
