"use client";

import Image from "next/image";
import { useRef, useState } from "react";
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-text-muted">
          {items.length}/{GALLERY_MAX_ITEMS} samples · auto-compressed for mobile
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
      {items.length === 0 ? (
        <p className="text-sm text-text-muted py-6 text-center">No samples yet.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item) => (
            <li key={item.id} className="relative group rounded-xl overflow-hidden border border-glass-border bg-bg-secondary aspect-square">
              <Image
                src={galleryPublicUrl(item.storage_path)}
                alt={item.caption || "Sample"}
                fill
                sizes="(max-width:640px) 45vw, 180px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => void remove(item)}
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
