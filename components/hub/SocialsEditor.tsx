"use client";

import { createClient } from "@/lib/supabase/client";
import {
  SOCIAL_PLATFORMS,
  getPlatform,
  normalizeSocialHref,
} from "@/lib/social-platforms";
import type { Tables } from "@/lib/supabase/database.types";
import { useState } from "react";

type SocialLink = Tables<"social_links">;

export function SocialsEditor({
  links,
  contactEmail,
  onLinksChange,
  onEmailChange,
}: {
  links: SocialLink[];
  contactEmail: string;
  onLinksChange: (links: SocialLink[]) => void;
  onEmailChange: (email: string) => void;
}) {
  const [platform, setPlatform] = useState("instagram");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const href = normalizeSocialHref(platform, url);
    if (!href) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      setBusy(false);
      return;
    }
    const nextOrder = links.length ? Math.max(...links.map((l) => l.sort_order)) + 1 : 0;
    const { data, error: insertError } = await supabase
      .from("social_links")
      .insert({
        artist_id: user.id,
        platform,
        url: href,
        sort_order: nextOrder,
      })
      .select()
      .single();
    if (insertError) {
      setError(insertError.message);
      setBusy(false);
      return;
    }
    onLinksChange([...links, data]);
    setUrl("");
    setBusy(false);
  };

  const remove = async (id: string) => {
    const supabase = createClient();
    await supabase.from("social_links").delete().eq("id", id);
    onLinksChange(links.filter((l) => l.id !== id));
  };

  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-text-secondary">Contact email (shown on client page)</span>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          className="field-input"
          placeholder="you@studio.com"
        />
      </label>

      <ul className="flex flex-col gap-2">
        {links.length === 0 && (
          <p className="text-sm text-text-muted">No social links yet.</p>
        )}
        {links.map((link) => {
          const meta = getPlatform(link.platform);
          const Icon = meta.Icon;
          return (
            <li
              key={link.id}
              className="flex items-center gap-3 rounded-xl border border-glass-border px-3 py-2.5"
            >
              <Icon className="w-4 h-4 text-navy shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-text-muted">{meta.label}</p>
                <p className="text-sm text-navy truncate">{link.url}</p>
              </div>
              <button
                type="button"
                onClick={() => void remove(link.id)}
                className="text-xs text-text-muted hover:text-error"
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>

      <form onSubmit={add} className="glass rounded-xl p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-navy">Add social</h3>
        <div className="grid sm:grid-cols-[140px_1fr] gap-2">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="field-input"
          >
            {SOCIAL_PLATFORMS.filter((p) => p.id !== "email").map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="field-input"
            placeholder={getPlatform(platform).placeholder}
          />
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary text-sm self-start">
          {busy ? "Adding…" : "Add link"}
        </button>
      </form>
    </div>
  );
}
