# Stripe card checkout setup

LegitBodyFix uses Stripe-hosted Checkout, so card data is entered on Stripe and never passes through this site. The server owns every product price, re-fetches the completed Checkout Session, and grants Supabase library access only after the amount, currency, product, payment status, payment intent, and buyer email all match.

## 1. Start in test mode

In Stripe, enable **Test mode** and copy the test secret key. In Vercel Project Settings > Environment Variables, add this to **Preview** first:

```text
STRIPE_SECRET_KEY=sk_test_...
```

Do not add a live key until the preview purchase and entitlement flow have been verified.

## 2. Add the signed webhook

In Stripe Workbench > Webhooks, add:

```text
https://YOUR-PREVIEW-DEPLOYMENT.vercel.app/api/stripe/webhook
```

Subscribe to `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Copy the endpoint signing secret into Vercel Preview:

```text
STRIPE_WEBHOOK_SECRET=whsec_...
```

Never copy either secret into source files, HTML, screenshots, or browser code.

## 3. Redeploy and test

Redeploy the Preview, open `checkout.html`, and choose **Pay securely by card**. Use Stripe test card `4242 4242 4242 4242`, any future expiry, and any three-digit CVC. Confirm that:

1. Stripe labels the payment as test data and no real money is taken.
2. Checkout returns to LegitBodyFix and opens the buyer library flow.
3. The exact checkout email receives access to the purchased program or session.
4. The purchase appears once in the admin Sales view with provider `stripe`.

## 4. Go live only after verification

Create a production webhook with the production URL, then add the live `sk_live_...` key and its own `whsec_...` signing secret to **Production**. Test mode and live mode have different webhook secrets.
