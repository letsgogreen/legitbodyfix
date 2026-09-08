import test from "node:test";
import assert from "node:assert/strict";
import { conditionLoadError } from "../src/lib/condition-load-error.ts";

test("only missing-table errors suggest checking migrations", () => {
  for (const code of ["42P01", "PGRST205"]) {
    assert.match(conditionLoadError("drafts", code), /migration/);
  }
});
test("permission errors suggest sign-in without suggesting database changes", () => {
  for (const code of ["42501", "PGRST301", "PGRST303"]) {
    const message = conditionLoadError("publications", code);
    assert.match(message, /Sign in again/);
    assert.doesNotMatch(message, /migration/);
  }
});
test("network and unknown errors remain retryable and never echo untrusted details", () => {
  for (const code of [undefined, "", "private-server-detail"]) {
    const message = conditionLoadError("drafts", code);
    assert.match(message, /Retry/);
    assert.match(message, /drafts: LOAD_FAILED/);
    assert.doesNotMatch(message, /private-server-detail|migration/);
  }
});
