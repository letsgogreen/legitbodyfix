type EmailLinkRequest = { email: string; options: { emailRedirectTo: string } };
type EmailLinkSender = (request: EmailLinkRequest) => PromiseLike<{ error: unknown }>;

export function secondsUntilRetry(retryAt: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((retryAt - now) / 1000));
}

export async function requestEmailLink(email: string, origin: string, send: EmailLinkSender, keepSignedIn = false): Promise<string> {
  const address = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error("Enter a valid email address.");
  try {
    const { error } = await send({ email: address, options: { emailRedirectTo: `${origin}/library?remember=${keepSignedIn ? "1" : "0"}` } });
    if (error) throw error;
    return address;
  } catch {
    // Do not reveal account existence or raw authentication service errors.
    throw new Error("We could not send your link. Please wait a moment and try again.");
  }
}
