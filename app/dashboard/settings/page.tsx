"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { WorkflowEditor } from "@/components/dashboard/WorkflowEditor";
import { TatEditor } from "@/components/dashboard/TatEditor";
import type { Tables } from "@/lib/supabase/database.types";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [queueToken, setQueueToken] = useState<string | null>(null);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [tatMin, setTatMin] = useState<number | null>(null);
  const [tatMax, setTatMax] = useState<number | null>(null);
  const [stages, setStages] = useState<Tables<"workflow_stages">[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setDisplayName(user.user_metadata?.display_name || "");
      setArtistId(user.id);

      const [{ data: profile }, { data: workflowStages }] = await Promise.all([
        supabase
          .from("artist_profiles")
          .select("public_queue_token, tat_min_days, tat_max_days")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("workflow_stages")
          .select("*")
          .order("sort_order", { ascending: true }),
      ]);

      setQueueToken(profile?.public_queue_token ?? null);
      setTatMin(profile?.tat_min_days ?? null);
      setTatMax(profile?.tat_max_days ?? null);
      setStages(workflowStages ?? []);
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
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">
          Profile, public link, and workflow stages.
        </p>
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
          <h2 className="text-sm font-semibold text-navy mb-2">Public client link</h2>
          <p className="text-xs text-text-muted mb-3 leading-relaxed">
            One link for gallery, prices, TOS, queue, and contact — no email addresses shown in the queue.
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

      <section className="flex flex-col gap-6">
        <header>
          <h2 className="text-lg font-semibold tracking-tight text-navy">Workflow</h2>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">
            Stages set progress percentage. Turnaround time drives estimated delivery dates.
          </p>
        </header>
        {loading || !artistId ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : (
          <div className="flex flex-col gap-6">
            <WorkflowEditor initialStages={stages} />
            <TatEditor artistId={artistId} initialMin={tatMin} initialMax={tatMax} />
          </div>
        )}
      </section>
    </div>
  );
}
