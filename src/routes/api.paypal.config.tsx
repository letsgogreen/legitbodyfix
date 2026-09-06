import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/paypal/config")({
  server: { handlers: { GET: async () => {
    try {
      const { legacyCheckoutConfig } = await import("@/lib/legacy-paypal-checkout.server");
      return Response.json(legacyCheckoutConfig(), { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      console.error("PayPal checkout config failed:", error);
      return Response.json({ error: "Checkout is not configured." }, { status: 503 });
    }
  } } },
});
