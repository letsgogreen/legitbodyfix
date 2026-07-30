"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var grants = require("../lib/admin-access-grants");

var config = {
  url: "https://example-project.supabase.co",
  secretKey: "sb_secret_abcdefghijklmnopqrstuvwx"
};

test("normalizes the buyer email before granting access", async function () {
  var request;
  var result = await grants.grantAccess(config, {
    email: " Buyer@Example.com ",
    programId: "neck-shoulder-reset"
  }, async function (url, options) {
    request = { url: url, options: options };
    return { ok: true, status: 200, json: async function () { return [{ id: "entitlement-1" }]; } };
  });

  assert.equal(result.email, "buyer@example.com");
  assert.equal(result.programId, "neck-shoulder-reset");
  assert.equal(result.created, true);
  assert.match(request.url, /on_conflict=buyer_email%2Cprogram_id/);
  assert.equal(request.options.headers.Authorization, "Bearer " + config.secretKey);
  assert.deepEqual(JSON.parse(request.options.body), {
    buyer_email: "buyer@example.com",
    program_id: "neck-shoulder-reset",
    status: "active"
  });
});

test("rejects invalid manual access inputs before contacting Supabase", async function () {
  await assert.rejects(function () {
    return grants.grantAccess(config, { email: "not-an-email", programId: "neck-shoulder-reset" });
  }, function (error) {
    return error instanceof grants.AccessGrantError && error.code === "invalid_access_grant" && error.statusCode === 422;
  });
});
