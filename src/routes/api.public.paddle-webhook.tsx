import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/paddle-webhook")({
  server: { handlers: { POST: async ({ request }) => {
    const secret = process.env["PADDLE_NOTIFICATION_WEBHOOK_SECRET"];
    if (!secret) return new Response("Webhook is not configured", { status: 503 });
    const rawBody = await request.text();
    const { verifyPaddleSignature, handlePaddleEvent } = await import("@/lib/paddle-fulfillment.server");
    if (!(await verifyPaddleSignature(request.headers.get("Paddle-Signature"), rawBody, secret))) return new Response("Invalid signature", { status: 401 });
    let event: unknown; try { event = JSON.parse(rawBody); } catch { return new Response("Invalid JSON", { status: 400 }); }
    try { await handlePaddleEvent(event as never); }
    catch (error) { console.error("Paddle webhook failed:", error); return new Response("Webhook processing failed", { status: 500 }); }
    return Response.json({ received: true });
  } } },
});
