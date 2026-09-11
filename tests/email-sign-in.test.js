const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/email-sign-in.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, context);
const { requestEmailLink, secondsUntilRetry } = context.exports;

test('trims email and returns to the library on the current origin', async () => {
  let request;
  const address = await requestEmailLink('  member@example.com  ', 'https://www.legitbodyfix.com', async (input) => { request = input; return { error: null }; });
  assert.equal(address, 'member@example.com');
  assert.equal(request.email, address);
  assert.equal(request.options.emailRedirectTo, 'https://www.legitbodyfix.com/library?remember=0');
});
test('remembered sign-in is explicit in the redirect', async () => {
  let request;
  await requestEmailLink('member@example.com', 'https://www.legitbodyfix.com', async (input) => { request = input; return { error: null }; }, true);
  assert.equal(request.options.emailRedirectTo, 'https://www.legitbodyfix.com/library?remember=1');
});
test('invalid email never sends a request', async () => {
  let calls = 0;
  await assert.rejects(requestEmailLink('not-an-email', 'https://example.com', async () => { calls++; }), /valid email/);
  assert.equal(calls, 0);
});
test('service and network errors use a safe retry message', async () => {
  for (const send of [async () => ({ error: new Error('private account info') }), async () => { throw new Error('network failed'); }]) {
    await assert.rejects(requestEmailLink('member@example.com', 'https://example.com', send), /Please wait a moment and try again/);
  }
});
test('resend cooldown uses elapsed time and never goes negative', () => {
  assert.equal(secondsUntilRetry(60_000, 0), 60);
  assert.equal(secondsUntilRetry(60_000, 59_001), 1);
  assert.equal(secondsUntilRetry(60_000, 60_000), 0);
  assert.equal(secondsUntilRetry(60_000, 70_000), 0);
});
test('sign-in screen has resend, email correction and no social sign-in', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/routes/library.tsx'), 'utf8');
  assert.match(source, /Use a different email/);
  assert.match(source, /Resend sign-in link/);
  assert.match(source, /busy.current \|\| secondsUntilRetry/);
  assert.match(source, /role="status" aria-live="polite"/);
  assert.doesNotMatch(source, /signInWithOAuth|Continue with Google/);
});
