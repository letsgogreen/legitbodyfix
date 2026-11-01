import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthCard, authButtonClass } from "@/components/auth/AuthCard";

export const Route = createFileRoute("/reset-password")({
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
      body="You can access your existing account with a secure email link. Use the email associated with your purchases."
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
