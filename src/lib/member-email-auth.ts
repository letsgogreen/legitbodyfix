const KEY = "legitbodyfix-member-email-request";
export type MemberEmailRequest = {
  id: string;
  email: string;
  next: string;
  remember: boolean;
  created: number;
};
export function safeMemberNext(value: unknown) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\\\r\n]/.test(value)
    ? value
    : "/library";
}
export function beginMemberEmail(
  storage: Storage,
  email: string,
  next: string,
  remember: boolean,
  now = Date.now(),
): MemberEmailRequest {
  const request = {
    id: crypto.randomUUID(),
    email: email.trim().toLowerCase(),
    next: safeMemberNext(next),
    remember,
    created: now,
  };
  storage.setItem(KEY, JSON.stringify(request));
  return request;
}
export function pendingMemberEmail(storage: Storage, now = Date.now()): MemberEmailRequest | null {
  try {
    const value = JSON.parse(storage.getItem(KEY) ?? "null");
    if (
      typeof value?.id === "string" &&
      typeof value.email === "string" &&
      typeof value.remember === "boolean" &&
      typeof value.created === "number" &&
      now >= value.created &&
      now - value.created < 60 * 60 * 1000
    )
      return { ...value, next: safeMemberNext(value.next) };
  } catch {
    /* Invalid requests cannot receive a session. */
  }
  return null;
}
export function clearMemberEmail(storage: Storage) {
  storage.removeItem(KEY);
}
export const memberEmailChannel = (id: string) => `legitbodyfix-member-email:${id}`;
