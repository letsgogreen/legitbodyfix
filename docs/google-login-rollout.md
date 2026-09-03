# Google login activation

The customer entry point is `/library`. Email magic-link signup/login remains available. Google uses the existing Supabase browser session; no admin metadata or purchase permissions are granted by this UI.

Before production rollout:

1. In Google Auth Platform create a Web application OAuth client for the site. Configure branding/audience and only basic profile, email, and openid scopes.
2. Copy the exact callback URL from the active Supabase project's Google provider settings to Google's authorized redirect URIs. Do not use `/library` as Google's callback.
3. Save the Google Client ID and Client Secret in Supabase Authentication > Providers > Google and enable it. Never put the client secret in frontend code or chat.
4. Add `https://www.legitbodyfix.com/library` to Supabase's allowed redirect URLs. Configure any preview origin explicitly for testing.
5. Verify first signup, returning login, denied consent, email link, sign-out, purchase access with the same email, and rejection of ordinary users from admin. Do not charge a real purchase for testing.

Reference: https://supabase.com/docs/guides/auth/social-login/auth-google

Admin email privacy: the sign-in and forbidden screens no longer render an email address. The existing client-side admin allowlist remains in JavaScript; this is display privacy, not secrecy of the bundled address. Server/database authorization must remain enforced separately.
