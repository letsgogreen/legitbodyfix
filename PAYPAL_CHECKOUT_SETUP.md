# PayPal Checkout setup

The built-in checkout creates and captures a PayPal order on the server. It does not trust a browser success page to grant program access.

## Environment variables

Add these Vercel variables separately for Preview and Production:

```text
PAYPAL_ENV=sandbox or live
PAYPAL_CLIENT_ID=PayPal Developer app client ID
PAYPAL_CLIENT_SECRET=PayPal Developer app client secret
PAYPAL_WEBHOOK_ID=PayPal webhook ID
```

The client ID is intentionally sent to the checkout page. The client secret and webhook ID are used only by Vercel functions.

## Webhook

In the PayPal Developer Dashboard for the same app, create a webhook using the production URL:

```text
https://legitbodyfix.vercel.app/api/paypal/webhook
```

Subscribe to:

```text
PAYMENT.CAPTURE.COMPLETED
```

For sandbox testing, use the preview deployment URL instead. The webhook handler verifies PayPal's signature before writing a payment or entitlement.

## Supabase service role privileges

Run this in the Supabase SQL editor once:

```sql
grant usage on schema public to service_role;

grant select, insert, update on table
  public.programs,
  public.payment_orders,
  public.entitlements,
  public.payment_webhook_events
to service_role;
```

## Test order

1. Set Preview to `PAYPAL_ENV=sandbox` and add sandbox app values.
2. Redeploy the preview.
3. Complete a sandbox payment.
4. Confirm the checkout redirects to `library.html` and grants access to the PayPal payer email.
5. Only after that, add the live app values to Production and use the production webhook URL.
