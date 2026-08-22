"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var access = require("../lib/supabase-access");
var fs = require("node:fs");
var path = require("node:path");

test("customer profile migration preserves email reconciliation while adding stable user identity", function () {
  var migration = fs.readFileSync(path.join(__dirname, "../supabase-customer-profiles.sql"), "utf8");
  assert.match(migration, /create table if not exists public\.profiles/);
  assert.match(migration, /user_id uuid primary key references auth\.users\(id\)/);
  assert.match(migration, /alter table public\.payment_orders[\s\S]*add column if not exists user_id/);
  assert.match(migration, /alter table public\.entitlements[\s\S]*add column if not exists user_id/);
  assert.match(migration, /lower\(trim\(orders\.buyer_email\)\) = lower\(trim\(users\.email\)\)/);
  assert.match(migration, /lower\(trim\(access\.buyer_email\)\) = lower\(trim\(users\.email\)\)/);
  assert.match(migration, /auth\.uid\(\) = user_id/);
  assert.match(migration, /grant update \(display_name\) on public\.profiles to authenticated/);
  assert.doesNotMatch(migration, /grant select, update on public\.profiles/);
});

test("buyer profile UI reads and updates only the authenticated user's display name", function () {
  var html = fs.readFileSync(path.join(__dirname, "../library.html"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/library.js"), "utf8");
  assert.match(html, /id="profileForm"/);
  assert.match(html, /id="profileDisplayName"/);
  assert.match(javascript, /client\.from\("profiles"\)\.select\("display_name"\)\.eq\("user_id", session\.user\.id\)/);
  assert.match(javascript, /update\(\{ display_name: displayName \|\| null \}\)\.eq\("user_id", activeSession\.user\.id\)/);
  assert.doesNotMatch(javascript, /update\(\{[^}]*email/);
});

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

test("reads only the authenticated buyer's completed payment history server-side", async function () {
  var config = access.getServerConfig(environment());
  var request;
  var purchases = await access.listPurchases(config, "buyer@example.com", async function (url, options) {
    request = { url: url, options: options };
    return { ok: true, status: 200, json: async function () { return [{
      id: "payment-1", provider_order_id: "ORDER-1", program_id: "neck-shoulder-reset",
      amount: 45, currency: "USD", status: "completed", paid_at: "2026-08-19T00:00:00Z"
    }]; } };
  });

  assert.match(request.url, /payment_orders/);
  assert.match(request.url, /buyer_email=eq.buyer%40example.com/);
  assert.match(request.url, /status=eq.completed/);
  assert.equal(request.options.headers.apikey, environment().SUPABASE_SECRET_KEY);
  assert.deepEqual(purchases[0], {
    id: "payment-1", orderId: "ORDER-1", programId: "neck-shoulder-reset",
    amount: 45, currency: "USD", status: "completed", paidAt: "2026-08-19T00:00:00Z"
  });
});
