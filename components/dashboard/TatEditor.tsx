"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { syncEstimatedDeadlines } from "@/lib/sync-deadlines";
import { parseTat } from "@/lib/tat";

export function TatEditor({
  artistId,
  initialMin,
  initialMax,
}: {
  artistId: string;
  initialMin: number | null;
  initialMax: number | null;
}) {
  const existing = parseTat({ tat_min_days: initialMin, tat_max_days: initialMax });
  const [enabled, setEnabled] = useState(Boolean(existing));
  const [isRange, setIsRange] = useState(
    Boolean(existing && existing.minDays !== existing.maxDays)
  );
  const [minDays, setMinDays] = useState(String(existing?.minDays ?? 3));
  const [maxDays, setMaxDays] = useState(String(existing?.maxDays ?? 7));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    let min: number | null = null;
    let max: number | null = null;

    if (enabled) {
      const a = Number(minDays);
      const b = isRange ? Number(maxDays) : a;
      if (!Number.isFinite(a) || a < 1 || !Number.isFinite(b) || b < a) {
        setError(isRange ? "Enter a valid day range (min ≤ max)." : "Enter a valid number of days.");
        setSaving(false);
        return;
      }
      min = Math.round(a);
      max = Math.round(b);
    }

    const { error: updateError } = await supabase
      .from("artist_profiles")
      .update({ tat_min_days: min, tat_max_days: max })
      .eq("user_id", artistId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    await syncEstimatedDeadlines(
      supabase,
      artistId,
      min != null && max != null ? { minDays: min, maxDays: max } : null
    );

    setSavedAt(new Date().toLocaleTimeString());
    setSaving(false);
  };

  return (
    <section className="glass rounded-2xl p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-navy">Turnaround time</h3>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          Days per commission, first-come first-serve. Used for estimated delivery dates
          on your queue and client page.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="rounded border-glass-border"
        />
        Enable turnaround estimates
      </label>

      {enabled && (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsRange(false)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                !isRange
                  ? "bg-navy text-white border-navy"
                  : "bg-bg-card text-text-secondary border-glass-border"
              }`}
            >
              Fixed days
            </button>
            <button
              type="button"
              onClick={() => setIsRange(true)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                isRange
                  ? "bg-navy text-white border-navy"
                  : "bg-bg-card text-text-secondary border-glass-border"
              }`}
            >
              Range
            </button>
          </div>

          {isRange ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-text-secondary">Min days</span>
                <input
                  type="number"
                  min={1}
                  value={minDays}
                  onChange={(e) => setMinDays(e.target.value)}
                  className="field-input"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-text-secondary">Max days</span>
                <input
                  type="number"
                  min={1}
                  value={maxDays}
                  onChange={(e) => setMaxDays(e.target.value)}
                  className="field-input"
                />
              </label>
            </div>
          ) : (
            <label className="flex flex-col gap-1.5 max-w-[160px]">
              <span className="text-sm text-text-secondary">Days per piece</span>
              <input
                type="number"
                min={1}
                value={minDays}
                onChange={(e) => {
                  setMinDays(e.target.value);
                  setMaxDays(e.target.value);
                }}
                className="field-input"
              />
            </label>
          )}
        </>
      )}

      {error && <p className="text-sm text-error">{error}</p>}
      {savedAt && !error && (
        <p className="text-xs text-text-muted">Saved · deadlines updated {savedAt}</p>
      )}

      <button type="button" onClick={() => void save()} disabled={saving} className="btn-primary text-sm self-start">
        {saving ? "Saving…" : "Save turnaround"}
      </button>
    </section>
  );
}
