import { createHmac, timingSafeEqual } from "node:crypto";
import { redirect } from "@tanstack/react-router";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";

const cookieName = "lbf_recipe_access";
const maxAge = 30 * 24 * 60 * 60;

function signature(expires: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("Recipe library signing key is missing");
  return createHmac("sha256", key).update(`recipe-library-access:v1:${expires}`).digest("hex");
}

export function recipeLibraryCookie() {
  const expires = String(Math.floor(Date.now() / 1000) + maxAge);
  return `${cookieName}=${expires}.${signature(expires)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

export async function requireRecipeLibraryAccess() {
  setResponseHeader("Cache-Control", "private, no-store");
  const { headers } = getRequest();
  const cookie = headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)lbf_recipe_access=(\d+)\.([a-f0-9]{64})(?:;|$)/);
  if (
    match &&
    Number(match[1]) > Math.floor(Date.now() / 1000) &&
    timingSafeEqual(Buffer.from(match[2], "hex"), Buffer.from(signature(match[1]), "hex"))
  ) {
    return;
  }

  const token = headers.get("authorization")?.match(/^Bearer (\S+)$/i)?.[1];
  if (token) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && data.user?.email && data.user.email_confirmed_at) return;
  }

  throw redirect({ to: "/library-access", search: {} });
}
