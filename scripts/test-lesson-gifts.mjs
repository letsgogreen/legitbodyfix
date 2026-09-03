// Run: node scripts/test-lesson-gifts.mjs <path-to-installed-pglite-dist/index.js>
// In-memory PostgreSQL only. Never connects to Supabase or sends email.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { PGlite } = await import(pathToFileURL(process.argv[2]).href);
const db = new PGlite();
const admin = '00000000-0000-0000-0000-000000000001';
const recipient = '00000000-0000-0000-0000-000000000002';
const stranger = '00000000-0000-0000-0000-000000000003';
const unverified = '00000000-0000-0000-0000-000000000004';
const video = '10000000-0000-0000-0000-000000000001';
const sibling = '10000000-0000-0000-0000-000000000002';
const draft = '10000000-0000-0000-0000-000000000003';
let passed = 0;
async function check(name, fn) { await fn(); passed++; console.log(`PASS ${name}`); }
async function rows(sql, params = []) { return (await db.query(sql, params)).rows; }
async function login(id, role = 'authenticated') {
  await db.exec('RESET ROLE');
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [id]);
  await db.exec(`SET ROLE ${role}`);
}
async function grant(email, lesson = video) {
  return rows('INSERT INTO public.lesson_gifts(recipient_email,lesson_id) VALUES ($1,$2) RETURNING id', [email, lesson]);
}
try {
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
    GRANT USAGE ON SCHEMA auth, public TO anon,authenticated;
    CREATE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql STABLE AS
      $$ SELECT auth.uid() = '${admin}'::uuid $$;
    CREATE TABLE public.lessons(id uuid PRIMARY KEY,title text,duration_seconds integer,stream_status text,stream_uid text,published boolean);
    CREATE TABLE public.entitlements(user_id uuid,lesson_id uuid,active boolean);
    ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
    GRANT SELECT ON public.lessons, public.entitlements TO authenticated;
    CREATE POLICY admin_lessons ON public.lessons FOR SELECT TO authenticated USING(public.is_admin());
    CREATE POLICY paid_lessons ON public.lessons FOR SELECT TO authenticated USING(published AND EXISTS(
      SELECT 1 FROM public.entitlements e WHERE e.user_id=auth.uid() AND e.lesson_id=lessons.id AND e.active));
    INSERT INTO auth.users VALUES
      ('${admin}','admin@example.test',now()),('${recipient}','recipient@example.test',now()),
      ('${stranger}','stranger@example.test',now()),('${unverified}','unverified@example.test',null);
    INSERT INTO public.lessons VALUES
      ('${video}','Gift video',600,'ready','uid-1',true),
      ('${sibling}','Sibling video',500,'ready','uid-2',true),
      ('${draft}','Draft video',500,'ready','uid-3',false);
  `);
  const migration = await readFile(new URL('../supabase/migrations/20260903120000_lesson_gifts.sql', import.meta.url), 'utf8');
  await check('migration executes in PostgreSQL', () => db.exec(migration));
  await login(admin);
  const [{ id: gift }] = await grant('recipient@example.test');
  await check('admin can grant and read history', async () => assert.equal((await rows('SELECT * FROM public.lesson_gifts')).length, 1));
  await check('active duplicate is rejected', () => assert.rejects(grant('recipient@example.test'), /duplicate key/));
  await check('draft video gift is rejected', () => assert.rejects(grant('recipient@example.test', draft), /row-level security/));
  await check('email must be normalized', () => assert.rejects(grant(' Recipient@example.test '), /check constraint/));
  await grant('unverified@example.test');
  await login(stranger);
  await check('ordinary user cannot create gifts', () => assert.rejects(grant('stranger@example.test'), /row-level security/));
  await check('ordinary user cannot see gift history', async () => assert.equal((await rows('SELECT * FROM public.lesson_gifts')).length, 0));
  await check('wrong email cannot claim', async () => assert.equal((await rows('SELECT * FROM public.my_gifted_lessons()')).length, 0));
  await check('ordinary user cannot assign themselves ownership', () => assert.rejects(rows('UPDATE public.lesson_gifts SET recipient_user_id=$1', [stranger]), /permission denied/));
  await check('ordinary user cannot revoke', async () => assert.equal((await rows('UPDATE public.lesson_gifts SET revoked_at=now() RETURNING id')).length, 0));
  await login(unverified);
  await check('unverified email cannot claim', async () => assert.equal((await rows('SELECT * FROM public.my_gifted_lessons()')).length, 0));
  await login(recipient);
  await check('verified email claims exactly its video', async () => assert.deepEqual((await rows('SELECT * FROM public.my_gifted_lessons()')).map(r => r.id), [video]));
  await check('repeated claim is idempotent', async () => assert.equal((await rows('SELECT * FROM public.my_gifted_lessons()')).length, 1));
  await check('playback lesson read allows gift but not sibling', async () => assert.deepEqual((await rows('SELECT id FROM public.lessons')).map(r => r.id), [video]));
  await db.exec('RESET ROLE');
  await db.query('UPDATE auth.users SET email=$1 WHERE id=$2', ['new-email@example.test', recipient]);
  await db.query('UPDATE auth.users SET email=$1 WHERE id=$2', ['recipient@example.test', stranger]);
  await login(stranger);
  await check('new owner of email cannot steal claimed gift', async () => assert.equal((await rows('SELECT * FROM public.my_gifted_lessons()')).length, 0));
  await login(recipient);
  await check('claimed access survives email change', async () => assert.equal((await rows('SELECT * FROM public.my_gifted_lessons()')).length, 1));
  await db.exec('RESET ROLE');
  await db.query('UPDATE public.lessons SET published=false WHERE id=$1', [video]);
  await login(recipient);
  await check('unpublishing blocks gifted playback', async () => assert.equal((await rows('SELECT id FROM public.lessons')).length, 0));
  await db.exec('RESET ROLE');
  await db.query('UPDATE public.lessons SET published=true WHERE id=$1', [video]);
  await login(admin);
  await rows('UPDATE public.lesson_gifts SET revoked_at=now() WHERE id=$1', [gift]);
  await check('revoked grant cannot be restored by direct update', async () => assert.equal((await rows('UPDATE public.lesson_gifts SET revoked_at=null WHERE id=$1 RETURNING id', [gift])).length, 0));
  await login(recipient);
  await check('revocation blocks new playback read', async () => assert.equal((await rows('SELECT id FROM public.lessons')).length, 0));
  await db.exec('RESET ROLE');
  await db.query('INSERT INTO public.entitlements VALUES ($1,$2,true)', [recipient, video]);
  await login(recipient);
  await check('paid access survives gift revocation', async () => assert.deepEqual((await rows('SELECT id FROM public.lessons')).map(r => r.id), [video]));
  await login(admin);
  await rows("UPDATE public.lesson_gifts SET revoked_at=now() WHERE recipient_email='unverified@example.test'");
  await db.exec('RESET ROLE');
  await db.query('UPDATE auth.users SET email_confirmed_at=now() WHERE id=$1', [unverified]);
  await login(unverified);
  await check('revoked pending gift is never claimed', async () => assert.equal((await rows('SELECT * FROM public.my_gifted_lessons()')).length, 0));
  await login('', 'anon');
  await check('anonymous user cannot claim', () => assert.rejects(rows('SELECT * FROM public.my_gifted_lessons()'), /permission denied/));
  await check('anonymous user cannot query gifts', () => assert.rejects(rows('SELECT * FROM public.lesson_gifts'), /permission denied/));
  console.log(`${passed} PostgreSQL permission tests passed. No live data used.`);
} finally { await db.close(); }
