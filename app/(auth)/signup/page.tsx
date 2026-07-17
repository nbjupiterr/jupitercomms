"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
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
        active="signup"
        title="Check your email"
        subtitle="One final step confirms your account."
      >
        <div className="text-center">
          <p className="text-text-secondary text-sm">
            We sent a confirmation link to <strong className="text-text-primary">{email}</strong>.
            Click it to activate your account.
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
      active="signup"
      title="Create your account"
      subtitle="Build a calmer commission workflow."
    >
      <form onSubmit={handleSignup} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-secondary">Display name</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="field-input py-2 text-sm"
            placeholder="Your artist name"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-secondary">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="field-input py-2 text-sm"
            placeholder="you@example.com"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-secondary">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="field-input py-2 text-sm"
            placeholder="At least 8 characters"
          />
        </label>

        {error && <p className="text-error text-xs">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-1 w-full text-sm">
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-dim hover:underline font-medium">
          Log in
        </Link>
      </div>
    </AuthShell>
  );
}
