const REQUEST_KEY = 'legitbodyfix-admin-login-request';
const MAX_AGE = 15 * 60 * 1000;
export const ADMIN_EMAIL = 'thriveinside@protonmail.com';

export function isApprovedAdminEmail(email?: string | null) {
  return email?.trim().toLowerCase() === ADMIN_EMAIL;
}

export function beginAdminLogin(storage: Storage, now = Date.now()) {
  const id = crypto.randomUUID();
  storage.setItem(REQUEST_KEY, JSON.stringify({ id, created: now }));
  return id;
}

export function pendingAdminLogin(storage: Storage, now = Date.now()): string | null {
  try {
    const request = JSON.parse(storage.getItem(REQUEST_KEY) ?? 'null');
    if (typeof request?.id === 'string' && typeof request.created === 'number' &&
        now >= request.created && now - request.created < MAX_AGE) return request.id;
  } catch { /* An invalid request never authorizes a transfer. */ }
  return null;
}

export function clearAdminLogin(storage: Storage) { storage.removeItem(REQUEST_KEY); }

type Tokens = { access_token: string; refresh_token: string };
type Channel = Pick<BroadcastChannel, 'postMessage' | 'close' | 'onmessage'>;
export const adminLoginChannel = (id: string) => `legitbodyfix-admin-login:${id}`;

// Only the requesting tab listens; credentials are never put in localStorage or a URL.
export function receiveAdminLogin(channel: Channel, accept: (tokens: Tokens) => Promise<boolean>) {
  let busy = false;
  let disposed = false;
  channel.onmessage = async ({ data }) => {
    if (disposed || busy || data?.type !== 'session' ||
        typeof data.access_token !== 'string' || !data.access_token ||
        typeof data.refresh_token !== 'string' || !data.refresh_token) return;
    busy = true;
    try {
      if (await accept({ access_token: data.access_token, refresh_token: data.refresh_token })) {
        channel.postMessage({ type: 'accepted' });
      } else busy = false;
    } catch { busy = false; }
    finally { if (disposed) channel.close(); }
  };
  return () => { disposed = true; if (!busy) channel.close(); };
}

export function sendAdminLogin(channel: Channel, tokens: Tokens, onAccepted: () => void) {
  let stopped = false;
  const send = () => channel.postMessage({ type: 'session', ...tokens });
  const interval = setInterval(send, 500);
  const timeout = setTimeout(stop, 15_000);
  function stop() {
    if (stopped) return;
    stopped = true;
    clearInterval(interval);
    clearTimeout(timeout);
    channel.close();
  }
  channel.onmessage = ({ data }) => {
    if (!stopped && data?.type === 'accepted') { stop(); onAccepted(); }
  };
  send();
  return stop;
}
