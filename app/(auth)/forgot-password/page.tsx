"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <AuthShell
        active="forgot"
        title="Check your email"
        subtitle="Your recovery link is on its way."
      >
        <div className="text-center">
          <p className="text-text-secondary text-sm">
            If an account exists for <strong className="text-text-primary">{email}</strong>, you&apos;ll receive a password reset link.
          </p>
          <Link href="/login" className="inline-block mt-6 btn-ghost text-sm">
            Back to login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      active="forgot"
      title="Password recovery"
      subtitle="We will send a secure reset link."
    >
      <form onSubmit={handleReset} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-secondary">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="field-input"
            placeholder="you@example.com"
          />
        </label>

        {error && <p className="text-error text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary">
        Remember your password?{" "}
        <Link href="/login" className="text-accent-dim hover:underline font-medium">
          Log in
        </Link>
      </div>
    </AuthShell>
  );
}
