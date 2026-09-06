import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/paypal/orders/create")({
  server: { handlers: { POST: async ({ request }) => {
    try {
      const body = await request.json() as { productId?: string };
      const { createLegacyPayPalOrder } = await import("@/lib/legacy-paypal-checkout.server");
      return Response.json({ orderId: await createLegacyPayPalOrder(body.productId || "") });
    } catch (error) {
      console.error("PayPal order creation failed:", error);
      return Response.json({ error: error instanceof Error ? error.message : "Order creation failed." }, { status: 400 });
    }
  } } },
});
