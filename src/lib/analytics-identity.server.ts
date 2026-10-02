const VISITOR_COOKIE = "lbf_analytics_visitor_v2";
const SESSION_COOKIE = "lbf_analytics_session_v2";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

function stableUuid(request: Request, cookieName: string, submitted: string) {
  const stored = readCookie(request, cookieName);
  return stored && UUID_PATTERN.test(stored) ? stored : submitted;
}

function cookie(name: string, value: string, maxAge: number) {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

export function resolveAnalyticsIdentity(
  request: Request,
  submitted: { session_id: string; visitor_id: string },
) {
  const sessionId = stableUuid(request, SESSION_COOKIE, submitted.session_id);
  const visitorId = stableUuid(request, VISITOR_COOKIE, submitted.visitor_id);
  const responseHeaders = new Headers();
  responseHeaders.append(
    "set-cookie",
    cookie(VISITOR_COOKIE, visitorId, 365 * 24 * 60 * 60),
  );
  responseHeaders.append("set-cookie", cookie(SESSION_COOKIE, sessionId, 30 * 60));
  return {
    sessionId,
    visitorId,
    responseHeaders,
  };
}
