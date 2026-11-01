import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  beginMemberEmail,
  pendingMemberEmail,
  clearMemberEmail,
  safeMemberNext,
  memberEmailChannel,
} from "../src/lib/member-email-auth.ts";
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
function storage() {
  const values = new Map();
  return {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, v),
    removeItem: (k) => values.delete(k),
  };
}
test("member request binds email, destination and persistence to one expiring tab request", () => {
  const s = storage();
  const r = beginMemberEmail(s, " TEST@example.com ", "/library/test", false, 1000);
  assert.equal(r.email, "test@example.com");
  assert.equal(pendingMemberEmail(s, 1001).id, r.id);
  assert.equal(pendingMemberEmail(storage(), 1001), null);
  assert.equal(pendingMemberEmail(s, 1000 + 3600000), null);
  assert.equal(pendingMemberEmail(s, 999), null);
  assert.ok(memberEmailChannel(r.id).startsWith("legitbodyfix-member-email:"));
  clearMemberEmail(s);
  assert.equal(pendingMemberEmail(s, 1001), null);
});
test("member navigation rejects external and backslash redirects", () => {
  for (const value of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\n/evil",
    null,
  ])
    assert.equal(safeMemberNext(value), "/library");
  assert.equal(safeMemberNext("/library?tab=owned"), "/library?tab=owned");
});
test("signup is passwordless, consent retained and existing login methods preserved", () => {
  const signup = read("src/routes/signup.tsx"),
    login = read("src/routes/login.tsx"),
    form = read("src/components/auth/EmailLinkForm.tsx");
  assert.match(signup, /<EmailLinkForm signup/);
  assert.doesNotMatch(signup, /signUp\(|type="password"|confirmPassword/);
  assert.match(form, /shouldCreateUser: signup/);
  assert.match(form, /signInWithOtp/);
  assert.match(form, /getUser\(tokens.access_token\)/);
  assert.match(form, /verified.data.user\?\.email\?\.toLowerCase\(\) !== request.email/);
  assert.match(form, /Terms & Conditions/);
  assert.match(form, /Privacy Policy/);
  assert.match(form, /authError/);
  assert.match(form, /Resend verification link/);
  assert.match(login, /signInWithPassword/);
  assert.match(login, /GoogleAuthButton/);
  assert.match(login, /EmailVerificationReturn/);
});
