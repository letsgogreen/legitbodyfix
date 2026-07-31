"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var access = require("../lib/supabase-access");

function environment() {
  return {
    SUPABASE_URL: "https://example-project.supabase.co",
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_abcdefghijklmnopqrstuvwx",
    SUPABASE_SECRET_KEY: "sb_secret_abcdefghijklmnopqrstuvwx"
  };
}

test("returns browser-safe Supabase configuration without leaking the secret key", function () {
  var config = access.getPublicConfig(environment());
  assert.deepEqual(config, {
    url: "https://example-project.supabase.co",
    publishableKey: "sb_publishable_abcdefghijklmnopqrstuvwx"
  });
  assert.equal(JSON.stringify(config).includes("sb_secret_"), false);
});

test("reports only the missing or invalid Supabase variable names", function () {
  var invalid = environment();
  invalid.SUPABASE_URL = "http://not-secure.example.com";
  invalid.SUPABASE_PUBLISHABLE_KEY = "";
  invalid.SUPABASE_SECRET_KEY = "not-a-secret";

  assert.deepEqual(access.getServerConfigIssues(invalid), [
    "SUPABASE_URL",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY"
  ]);
  assert.equal(access.getServerConfig(invalid), null);
});

test("checks the authenticated buyer and reads only active programs server-side", async function () {
  var config = access.getServerConfig(environment());
  var requests = [];
  var fetcher = async function (url, options) {
    requests.push({ url: url, options: options });
    if (url.includes("/auth/v1/user")) {
      return { ok: true, status: 200, json: async function () { return { id: "buyer-1", email: "Buyer@Example.com", email_confirmed_at: "2026-07-28T00:00:00Z" }; } };
    }
    return {
      ok: true,
      status: 200,
      json: async function () {
        return [{
          created_at: "2026-07-28T00:00:00Z",
          programs: { id: "neck-shoulder-reset", title: "Neck & Shoulder Reset", price: 49, currency: "USD", active: true }
        }];
      }
    };
  };

  var user = await access.getUser(config, "buyer-session-token", fetcher);
  var programs = await access.listEntitlements(config, user.email, fetcher);

  assert.equal(user.email, "buyer@example.com");
  assert.equal(user.emailConfirmed, true);
  assert.deepEqual(programs, [{
    id: "neck-shoulder-reset",
    title: "Neck & Shoulder Reset",
    price: 49,
    currency: "USD",
    purchasedAt: "2026-07-28T00:00:00Z"
  }]);
  assert.match(requests[1].url, /buyer_email=eq.buyer%40example.com/);
  assert.equal(requests[1].options.headers.apikey, environment().SUPABASE_SECRET_KEY);
});
