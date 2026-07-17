"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <AuthShell
      active="login"
      title="Sign in"
      subtitle="Continue managing your creative workspace."
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
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
            className="field-input py-2 text-sm"
            placeholder="••••••••"
          />
        </label>

        {error && <p className="text-error text-xs">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-1 w-full text-sm">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-center text-xs text-text-secondary">
        <Link href="/forgot-password" className="text-accent-dim hover:underline">
          Forgot password?
        </Link>
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent-dim hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
