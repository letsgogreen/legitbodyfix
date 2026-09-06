import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/paypal/orders/capture")({
  server: { handlers: { POST: async ({ request }) => {
    try {
      const body = await request.json() as { orderId?: string };
      if (!body.orderId || !/^[A-Z0-9]{10,40}$/.test(body.orderId)) return Response.json({ error: "Invalid order ID." }, { status: 400 });
      const { captureLegacyPayPalOrder } = await import("@/lib/legacy-paypal-checkout.server");
      return Response.json(await captureLegacyPayPalOrder(body.orderId));
    } catch (error) {
      console.error("PayPal order capture failed:", error);
      return Response.json({ error: error instanceof Error ? error.message : "Order capture failed." }, { status: 400 });
    }
  } } },
});
