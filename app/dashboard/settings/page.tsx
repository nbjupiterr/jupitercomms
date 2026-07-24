"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { WorkflowEditor } from "@/components/dashboard/WorkflowEditor";
import { publicClientUrl, validatePublicSlug } from "@/lib/public-slug";
import type { Tables } from "@/lib/supabase/database.types";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [queueToken, setQueueToken] = useState<string | null>(null);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [stages, setStages] = useState<Tables<"workflow_stages">[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const slugLocked = Boolean(savedSlug);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setDisplayName(user.user_metadata?.display_name || "");
      setArtistId(user.id);

      const [{ data: profile }, { data: workflowStages }] = await Promise.all([
        supabase
          .from("artist_profiles")
          .select("public_queue_token, public_slug")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("workflow_stages")
          .select("*")
          .order("sort_order", { ascending: true }),
      ]);

      setQueueToken(profile?.public_queue_token ?? null);
      setSavedSlug(profile?.public_slug ?? null);
      setSlugInput(profile?.public_slug ?? "");
      setStages(workflowStages ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const previewSlug = useMemo(() => {
    if (savedSlug) return savedSlug;
    return slugInput.trim().toLowerCase() || null;
  }, [slugInput, savedSlug]);

  const clientUrl =
    queueToken != null
      ? publicClientUrl({
          slug: savedSlug,
          token: queueToken,
          origin,
        })
      : "";

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const updates: { display_name: string; public_slug?: string } = {
      display_name: displayName,
    };

    // Username is claim-once: only send when not yet set.
    if (!slugLocked) {
      const slugRaw = slugInput.trim();
      if (slugRaw) {
        const validated = validatePublicSlug(slugRaw);
        if (!validated.ok) {
          setError(validated.error);
          setSaving(false);
          return;
        }
        updates.public_slug = validated.slug;
      }
    }

    await supabase.auth.updateUser({ data: { display_name: displayName } });

    const { error: updateError } = await supabase
      .from("artist_profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (updateError) {
      const msg = updateError.message.toLowerCase();
      if (
        updateError.code === "23505" ||
        msg.includes("duplicate") ||
        msg.includes("unique")
      ) {
        setError("That username is already taken.");
      } else if (msg.includes("only be set once")) {
        setError("Username is already set and can’t be changed.");
      } else if (msg.includes("public_slug") || msg.includes("check")) {
        setError("Username must be 3–30 characters: lowercase letters, numbers, hyphens.");
      } else {
        setError(updateError.message);
      }
      setSaving(false);
      return;
    }

    if (updates.public_slug) {
      setSavedSlug(updates.public_slug);
      setSlugInput(updates.public_slug);
    }
    setSavedAt(new Date().toLocaleTimeString());
    setSaving(false);
  };

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

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-text-secondary">Username</span>
            <div
              className={`flex items-center gap-0 field-input !p-0 overflow-hidden ${
                slugLocked ? "bg-bg-secondary/60" : ""
              }`}
            >
              <span className="text-xs text-text-muted pl-3 pr-1 shrink-0 select-none">/u/</span>
              <input
                type="text"
                value={slugInput}
                onChange={(e) => {
                  if (slugLocked) return;
                  setSlugInput(e.target.value.toLowerCase());
                }}
                readOnly={slugLocked}
                disabled={slugLocked}
                className="flex-1 bg-transparent border-0 outline-none text-sm text-navy py-2.5 pr-3 min-w-0 disabled:text-text-secondary disabled:cursor-not-allowed"
                placeholder="yourname"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <span className="text-[11px] text-text-muted leading-relaxed">
              {slugLocked
                ? "Username is permanent once claimed — choose carefully."
                : "Claim once · 3–30 characters · lowercase letters, numbers, hyphens. Can’t be changed later."}
            </span>
            {previewSlug ? (
              <span className="text-[11px] text-text-secondary font-mono truncate">
                {origin || ""}/u/{previewSlug}
              </span>
            ) : null}
          </label>

          {error ? <p className="text-sm text-error">{error}</p> : null}
          {savedAt ? (
            <p className="text-xs text-text-muted">Saved at {savedAt}</p>
          ) : null}

          <button type="submit" disabled={saving} className="btn-primary text-sm self-start">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>

        <section className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-navy mb-2">Public client link</h2>
          <p className="text-xs text-text-muted mb-3 leading-relaxed">
            {savedSlug
              ? "Share this username link — gallery, prices, TOS, queue, and contact."
              : "Claim a username above for a short link. Until then, the token link still works."}
          </p>
          {loading ? (
            <p className="text-sm text-text-muted">Loading…</p>
          ) : (
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-bg-secondary border border-glass-border rounded-xl px-3 py-2.5 text-accent-dim truncate font-mono">
                {clientUrl ||
                  (queueToken
                    ? publicClientUrl({ slug: savedSlug, token: queueToken })
                    : "—")}
              </code>
              <button
                type="button"
                onClick={() => clientUrl && navigator.clipboard.writeText(clientUrl)}
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
            Stages set progress percentage on commissions.
          </p>
        </header>
        {loading || !artistId ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : (
          <WorkflowEditor initialStages={stages} />
        )}
      </section>
    </div>
  );
}
