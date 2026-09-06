type PayPalConfig = { clientId: string; clientSecret: string; environment: "sandbox" | "live" };
type PayPalOrder = {
  id?: string;
  status?: string;
  payer?: { email_address?: string };
  purchase_units?: Array<{
    custom_id?: string;
    amount?: { currency_code?: string; value?: string };
    payments?: { captures?: Array<{ id?: string; status?: string; create_time?: string }> };
  }>;
};

export function paypalConfig(): PayPalConfig {
  const clientId = process.env["PAYPAL_CLIENT_ID"]?.trim();
  const clientSecret = process.env["PAYPAL_CLIENT_SECRET"]?.trim();
  const environment = process.env["PAYPAL_ENV"]?.trim().toLowerCase() === "live" ? "live" : "sandbox";
  if (!clientId || !clientSecret) throw new Error("PayPal checkout is not configured.");
  return { clientId, clientSecret, environment };
}

function apiBase(config: PayPalConfig) {
  return config.environment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

async function accessToken(config: PayPalConfig) {
  const response = await fetch(`${apiBase(config)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const payload = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description || "PayPal authentication failed.");
  return payload.access_token;
}

async function paypalRequest(config: PayPalConfig, path: string, init: RequestInit = {}) {
  const token = await accessToken(config);
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  const response = await fetch(`${apiBase(config)}${path}`, { ...init, headers });
  const payload = await response.json().catch(() => ({})) as PayPalOrder & { message?: string };
  if (!response.ok) throw new Error(payload.message || `PayPal request failed (${response.status}).`);
  return payload;
}

export async function createPayPalOrder(programId: string, amountMinor: number, currency: string) {
  const config = paypalConfig();
  const order = await paypalRequest(config, "/v2/checkout/orders", {
    method: "POST",
    headers: { "PayPal-Request-Id": `lbf-${programId}-${crypto.randomUUID()}` },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        custom_id: programId,
        amount: { currency_code: currency, value: (amountMinor / 100).toFixed(2) },
      }],
    }),
  });
  if (!order.id) throw new Error("PayPal did not return an order ID.");
  return order.id;
}

export async function captureAndVerifyPayPalOrder(orderId: string) {
  const config = paypalConfig();
  let order: PayPalOrder;
  try {
    order = await paypalRequest(config, `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: "POST",
      headers: { "PayPal-Request-Id": `lbf-capture-${orderId}` },
    });
  } catch {
    order = await paypalRequest(config, `/v2/checkout/orders/${encodeURIComponent(orderId)}`);
  }
  const unit = order.purchase_units?.[0];
  const capture = unit?.payments?.captures?.find((item) => item.status === "COMPLETED");
  const email = order.payer?.email_address?.trim().toLowerCase();
  if (order.status !== "COMPLETED" || !order.id || !unit?.custom_id || !unit.amount?.value || !unit.amount.currency_code || !capture?.id || !email) {
    throw new Error("The completed PayPal payment could not be verified.");
  }
  return {
    orderId: order.id,
    captureId: capture.id,
    programId: unit.custom_id,
    amountMinor: Math.round(Number(unit.amount.value) * 100),
    currency: unit.amount.currency_code.toLowerCase(),
    email,
    purchasedAt: capture.create_time || new Date().toISOString(),
  };
}
