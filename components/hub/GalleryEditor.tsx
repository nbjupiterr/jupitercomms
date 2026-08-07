"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  GALLERY_MAX_ITEMS,
  galleryPublicUrl,
  prepareGalleryImage,
} from "@/lib/gallery";
import type { Tables } from "@/lib/supabase/database.types";

type GalleryItem = Tables<"gallery_items">;

export function GalleryEditor({
  items,
  onChange,
}: {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const ordered = useMemo(
    () => [...items].sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at)),
    [items]
  );

  const upload = async (file: File) => {
    setError(null);
    if (items.length >= GALLERY_MAX_ITEMS) {
      setError(`Up to ${GALLERY_MAX_ITEMS} images keep the page fast.`);
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      const blob = await prepareGalleryImage(file);
      const path = `${user.id}/${crypto.randomUUID()}.webp`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(path, blob, { contentType: "image/webp", upsert: false });
      if (uploadError) throw uploadError;

      const nextOrder = items.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 0;
      const { data, error: insertError } = await supabase
        .from("gallery_items")
        .insert({
          artist_id: user.id,
          storage_path: path,
          sort_order: nextOrder,
        })
        .select()
        .single();
      if (insertError) throw insertError;

      onChange([...items, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (item: GalleryItem) => {
    setError(null);
    const supabase = createClient();
    await supabase.storage.from("gallery").remove([item.storage_path]);
    await supabase.from("gallery_items").delete().eq("id", item.id);
    onChange(items.filter((i) => i.id !== item.id));
  };

  const persistOrder = async (next: GalleryItem[]) => {
    const withOrder = next.map((item, i) => ({ ...item, sort_order: i }));
    onChange(withOrder);
    const supabase = createClient();
    await Promise.all(
      withOrder.map((item) =>
        supabase.from("gallery_items").update({ sort_order: item.sort_order }).eq("id", item.id)
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-text-muted">
          {items.length}/{GALLERY_MAX_ITEMS} samples · auto-compressed
          {items.length > 1 ? " · drag to reorder" : ""}
        </p>
        <button
          type="button"
          disabled={busy || items.length >= GALLERY_MAX_ITEMS}
          onClick={() => inputRef.current?.click()}
          className="btn-primary text-sm"
        >
          {busy ? "Uploading…" : "Add photo"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      {ordered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Image
            src="/assets/outer-space-pana.svg"
            alt=""
            width={140}
            height={140}
            className="w-28 h-28 mb-3 opacity-90"
          />
          <p className="text-sm text-text-muted">No samples yet.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ordered.map((item, i) => (
            <li
              key={item.id}
              draggable
              onDragStart={() => setDragIndex(i)}
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
              className={`relative group rounded-xl overflow-hidden border bg-bg-secondary aspect-square cursor-grab active:cursor-grabbing transition-colors ${
                overIndex === i && dragIndex !== null && dragIndex !== i
                  ? "border-accent ring-2 ring-accent/30"
                  : "border-glass-border"
              } ${dragIndex === i ? "opacity-50" : ""}`}
            >
              <Image
                src={galleryPublicUrl(item.storage_path)}
                alt={item.caption || "Sample"}
                fill
                sizes="(max-width:640px) 45vw, 180px"
                className="object-cover pointer-events-none"
                draggable={false}
              />
              <span className="absolute top-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-navy/70 text-white tabular-nums">
                {i + 1}
              </span>
              <button
                type="button"
                onClick={() => void remove(item)}
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded-lg bg-navy/80 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
