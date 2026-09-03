# Branded magic-link email (option 1)

Status: prepared locally, not installed in the hosted Supabase project.

In the active production project's Authentication > Email Templates > Magic Link:

1. Back up the existing subject and body before replacing them.
2. Set Subject to the contents of `magic-link-subject.txt`.
3. Set HTML Body to the full contents of `magic-link.html`.
4. Save and request a new login email using your own account. Check desktop/mobile layout and one successful sign-in. Never paste the received live link into logs or chat.

This changes only the subject/body for magic-link emails. It does not change SMTP, sender name/address, redirect settings, token expiry, signup confirmation, or other email types. Supabase/transport-added footer content may remain. No email is sent merely by creating these files, and deploying the web app does not apply hosted Auth email templates.

All sign-in links use Supabase's unchanged `{{ .ConfirmationURL }}` variable, preserving both customer and administrator return destinations. No tracking, JavaScript, external fonts/images, recipient addresses, or fixed expiry promises are embedded. Table layout and inline CSS keep styling independent of site assets; actual email-client rendering still requires a received-message test.

Confirm the active project from deployment configuration before applying: the repository's `config.toml` project reference may differ from the project shown in the user's dashboard.

Official reference: https://supabase.com/docs/guides/auth/auth-email-templates
