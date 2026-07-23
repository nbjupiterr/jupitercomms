"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  SOCIAL_PLATFORMS,
  getPlatform,
  normalizeSocialHref,
} from "@/lib/social-platforms";
import type { Tables } from "@/lib/supabase/database.types";

type SocialLink = Tables<"social_links">;

function sortedLinks(links: SocialLink[]) {
  return [...links].sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));
}

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
  const ordered = useMemo(() => sortedLinks(links), [links]);
  const [platform, setPlatform] = useState("instagram");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlatform, setEditPlatform] = useState("instagram");
  const [editUrl, setEditUrl] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const platformOptions = SOCIAL_PLATFORMS.filter((p) => p.id !== "email");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const href = normalizeSocialHref(platform, url);
    if (!href) {
      setError("Enter a valid http(s) URL.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      setBusy(false);
      return;
    }
    const nextOrder = ordered.length ? Math.max(...ordered.map((l) => l.sort_order)) + 1 : 0;
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

  const startEdit = (link: SocialLink) => {
    setEditingId(link.id);
    setEditPlatform(link.platform);
    setEditUrl(link.url);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPlatform("instagram");
    setEditUrl("");
  };

  const saveEdit = async (id: string) => {
    setError(null);
    const href = normalizeSocialHref(editPlatform, editUrl);
    if (!href) {
      setError("Enter a valid http(s) URL.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { data, error: updateError } = await supabase
      .from("social_links")
      .update({ platform: editPlatform, url: href })
      .eq("id", id)
      .select()
      .single();
    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }
    onLinksChange(links.map((l) => (l.id === id ? data : l)));
    cancelEdit();
    setBusy(false);
  };

  const remove = async (id: string) => {
    if (editingId === id) cancelEdit();
    const supabase = createClient();
    await supabase.from("social_links").delete().eq("id", id);
    onLinksChange(links.filter((l) => l.id !== id));
  };

  const persistOrder = async (next: SocialLink[]) => {
    const withOrder = next.map((link, i) => ({ ...link, sort_order: i }));
    onLinksChange(withOrder);
    const supabase = createClient();
    await Promise.all(
      withOrder.map((link) =>
        supabase.from("social_links").update({ sort_order: link.sort_order }).eq("id", link.id)
      )
    );
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...ordered];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    void persistOrder(next);
  };

  const moveBy = (index: number, delta: number) => {
    const to = index + delta;
    if (to < 0 || to >= ordered.length) return;
    reorder(index, to);
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

      <div className="flex flex-col gap-2">
        <p className="text-xs text-text-muted">
          Drag to reorder, or use the arrows. Order matches the client page.
        </p>
        {ordered.length === 0 && (
          <p className="text-sm text-text-muted">No social links yet.</p>
        )}
        <ul className="flex flex-col gap-2">
          {ordered.map((link, i) => {
            const meta = getPlatform(link.platform);
            const Icon = meta.Icon;
            const isEditing = editingId === link.id;

            return (
              <li
                key={link.id}
                draggable={!isEditing}
                onDragStart={() => !isEditing && setDragIndex(i)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (i !== overIndex) setOverIndex(i);
                }}
                onDrop={() => {
                  if (dragIndex !== null) reorder(dragIndex, i);
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className={`rounded-xl border px-3 py-2.5 transition-colors ${
                  overIndex === i && dragIndex !== null && dragIndex !== i
                    ? "border-accent bg-accent/5"
                    : "border-glass-border"
                } ${dragIndex === i ? "opacity-50" : ""} ${
                  isEditing ? "" : "cursor-grab active:cursor-grabbing"
                }`}
              >
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <div className="grid sm:grid-cols-[140px_1fr] gap-2">
                      <select
                        value={editPlatform}
                        onChange={(e) => setEditPlatform(e.target.value)}
                        className="field-input"
                      >
                        {platformOptions.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <input
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="field-input"
                        placeholder={getPlatform(editPlatform).placeholder}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void saveEdit(link.id)}
                        className="btn-primary text-xs"
                      >
                        {busy ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="btn-ghost text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span
                      className="text-text-muted shrink-0 select-none leading-none text-sm"
                      aria-hidden
                    >
                      ⋮⋮
                    </span>
                    <Icon className="w-4 h-4 text-navy shrink-0" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text-muted">{meta.label}</p>
                      <p className="text-sm text-navy truncate">{link.url}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        aria-label="Move up"
                        disabled={i === 0}
                        onClick={() => moveBy(i, -1)}
                        className="w-7 h-7 rounded-lg text-text-muted hover:text-navy hover:bg-bg-secondary disabled:opacity-30 text-xs"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label="Move down"
                        disabled={i === ordered.length - 1}
                        onClick={() => moveBy(i, 1)}
                        className="w-7 h-7 rounded-lg text-text-muted hover:text-navy hover:bg-bg-secondary disabled:opacity-30 text-xs"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(link)}
                        className="text-xs text-text-muted hover:text-navy px-1.5"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(link.id)}
                        className="text-xs text-text-muted hover:text-error px-1.5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <form onSubmit={add} className="glass rounded-xl p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-navy">Add social</h3>
        <div className="grid sm:grid-cols-[140px_1fr] gap-2">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="field-input"
          >
            {platformOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
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
