import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/refund-policy")({ component: RefundPolicyPage });

function RefundPolicyPage() {
  return (
    <LegalPage eyebrow="Purchases" title="Refund policy">
      <section><h2>1. How purchases are sold</h2><p>LegitBodyFix digital programs are sold through Paddle, our merchant of record and authorised reseller. Paddle receives the payment and processes eligible refunds to the original payment method.</p></section>
      <section><h2>2. Refund eligibility</h2><p>Refunds and statutory withdrawal rights are governed by applicable consumer law and <a href="https://www.paddle.com/legal/refund-policy" target="_blank" rel="noreferrer">Paddle’s Refund Policy</a>. That policy currently provides a seven-day cancellation period for eligible consumers in South Korea, Brazil, China, and Canada, and a fourteen-day withdrawal period for eligible consumers in specified jurisdictions. Mandatory local consumer rights always apply.</p><p>A refund or replacement may also be appropriate when a material technical defect prevents access or the purchased product is not delivered as described. Evidence of fraud or refund abuse may make a request ineligible.</p></section>
      <section><h2>3. Digital content already used</h2><p>In jurisdictions where the law permits, a statutory withdrawal right may end after you expressly consent to immediate access and begin downloading, streaming, or otherwise using the digital content. This does not remove rights that apply to faulty, misdescribed, or inaccessible content.</p></section>
      <section><h2>4. Requesting a refund</h2><p>Use the receipt or transaction email sent by Paddle, or visit <a href="https://paddle.net" target="_blank" rel="noreferrer">Paddle Buyer Support</a> and choose the refund option. Submit the request promptly and include the purchase email and transaction details. You can also email <a href="mailto:thriveinside@protonmail.com">thriveinside@protonmail.com</a> if you need help identifying or accessing your purchase.</p></section>
      <section><h2>5. Processing</h2><p>If approved, Paddle returns the payment using the original payment method where possible. Processing time depends on the payment provider and applicable law.</p></section>
    </LegalPage>
  );
}
