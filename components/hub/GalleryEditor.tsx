"use client";

import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  GALLERY_MAX_ITEMS,
  galleryPublicUrl,
  prepareGalleryImage,
} from "@/lib/gallery";
import { usePointerReorder } from "@/components/hub/usePointerReorder";
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

  const ordered = useMemo(
    () => [...items].sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at)),
    [items]
  );

  const persistOrder = useCallback(
    async (next: GalleryItem[]) => {
      const withOrder = next.map((item, i) => ({ ...item, sort_order: i }));
      onChange(withOrder);
      const supabase = createClient();
      await Promise.all(
        withOrder.map((item) =>
          supabase.from("gallery_items").update({ sort_order: item.sort_order }).eq("id", item.id)
        )
      );
    },
    [onChange]
  );

  const reorder = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      const next = [...ordered];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      void persistOrder(next);
    },
    [ordered, persistOrder]
  );

  const { activeIndex, overIndex, bindHandle } = usePointerReorder(reorder);

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
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: storageError } = await supabase.storage
        .from("gallery")
        .remove([item.storage_path]);
      if (storageError) throw storageError;
      const { error: deleteError } = await supabase
        .from("gallery_items")
        .delete()
        .eq("id", item.id);
      if (deleteError) throw deleteError;
      onChange(items.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove photo.");
    } finally {
      setBusy(false);
    }
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
              data-reorder-index={i}
              className={`relative group rounded-xl overflow-hidden border bg-bg-secondary aspect-square transition-colors ${
                overIndex === i && activeIndex !== null && activeIndex !== i
                  ? "border-accent ring-2 ring-accent/30"
                  : "border-glass-border"
              } ${activeIndex === i ? "opacity-50" : ""}`}
            >
              <Image
                src={galleryPublicUrl(item.storage_path)}
                alt={item.caption || "Sample"}
                fill
                sizes="(max-width:640px) 45vw, 180px"
                className="object-cover pointer-events-none"
                draggable={false}
              />
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                {ordered.length > 1 && (
                  <button
                    type="button"
                    aria-label="Drag to reorder"
                    className="text-[11px] px-1.5 py-1 rounded-lg bg-navy/80 text-white/90 select-none leading-none touch-none cursor-grab active:cursor-grabbing"
                    style={{ touchAction: "none" }}
                    {...bindHandle(i)}
                  >
                    ⋮⋮
                  </button>
                )}
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-navy/70 text-white tabular-nums pointer-events-none">
                  {i + 1}
                </span>
              </div>
              <button
                type="button"
                disabled={busy}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => void remove(item)}
                className="absolute top-2 right-2 z-10 text-[11px] px-2 py-1 rounded-lg bg-navy/80 text-white opacity-100"
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
