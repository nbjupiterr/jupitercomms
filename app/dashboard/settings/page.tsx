"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [queueToken, setQueueToken] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setDisplayName(user.user_metadata?.display_name || "");

      const { data: profile } = await supabase
        .from("artist_profiles")
        .select("public_queue_token")
        .eq("user_id", user.id)
        .single();

      setQueueToken(profile?.public_queue_token ?? null);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.auth.updateUser({ data: { display_name: displayName } });
    if (user) {
      await supabase
        .from("artist_profiles")
        .update({ display_name: displayName })
        .eq("user_id", user.id);
    }
    setSaving(false);
  };

  const queueUrl = queueToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/queue/${queueToken}`
    : "";

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage how your artist profile appears.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
      <form onSubmit={handleSave} className="glass rounded-2xl p-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-text-secondary">Display name</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="field-input"
            placeholder="Your artist name"
          />
        </label>

        <button type="submit" disabled={saving} className="btn-primary text-sm self-start">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <section className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-navy mb-2">Public queue link</h2>
        <p className="text-xs text-text-muted mb-3 leading-relaxed">
          One link for all clients. They can see who is in the queue and where you are
          currently working — no email addresses, no per-commission links.
        </p>
        {loading ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : (
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-bg-secondary border border-glass-border rounded-xl px-3 py-2.5 text-accent-dim truncate font-mono">
              {queueUrl || `/queue/${queueToken}`}
            </code>
            <button
              onClick={() => queueUrl && navigator.clipboard.writeText(queueUrl)}
              className="btn-ghost text-sm px-3"
            >
              Copy
            </button>
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
