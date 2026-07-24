"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      setHasSession(Boolean(user));
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don’t match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  };

  if (checking) {
    return (
      <AuthShell active="forgot" title="Reset password" subtitle="Checking your recovery link…">
        <p className="text-sm text-text-muted text-center">One moment…</p>
      </AuthShell>
    );
  }

  if (!hasSession) {
    return (
      <AuthShell active="forgot" title="Link expired" subtitle="Request a new recovery email.">
        <div className="text-center">
          <p className="text-sm text-text-secondary leading-relaxed">
            This reset link is invalid or has expired. Request a new one and open it from the same
            device.
          </p>
          <Link href="/forgot-password" className="inline-block mt-6 btn-primary text-sm">
            Request new link
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell active="forgot" title="Password updated" subtitle="You’re signed in.">
        <p className="text-sm text-text-secondary text-center">Redirecting to your dashboard…</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      active="forgot"
      title="Choose a new password"
      subtitle="This completes your password recovery."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-secondary">New password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="field-input"
            placeholder="At least 8 characters"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-secondary">Confirm password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="field-input"
            placeholder="Repeat password"
          />
        </label>
        {error ? <p className="text-error text-sm">{error}</p> : null}
        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
          {loading ? "Saving…" : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
