import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthCard, authButtonClass } from "@/components/auth/AuthCard";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Email sign-in — LegitBodyFix" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EmailAccessPage,
});

function EmailAccessPage() {
  return (
    <AuthCard
      eyebrow="Member access"
      title="Sign in with your email"
      body="Request a secure sign-in link using the email associated with your account."
    >
      <Link
        to="/login"
        search={{ next: "/library" }}
        className={authButtonClass + " inline-flex items-center justify-center"}
      >
        Continue to email sign-in
      </Link>
    </AuthCard>
  );
}
