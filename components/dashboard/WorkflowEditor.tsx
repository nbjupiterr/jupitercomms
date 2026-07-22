"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

type WorkflowStage = Tables<"workflow_stages">;

const THRESHOLD_OPTIONS = [25, 50, 75, 100];

export function WorkflowEditor({ initialStages }: { initialStages: WorkflowStage[] }) {
  const router = useRouter();
  const [stages, setStages] = useState(initialStages);
  const [name, setName] = useState("");
  const [threshold, setThreshold] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const addStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return;
    setBusy(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      setBusy(false);
      return;
    }

    const nextOrder = stages.length > 0 ? Math.max(...stages.map((s) => s.sort_order)) + 1 : 1;

    const { data, error: insertError } = await supabase
      .from("workflow_stages")
      .insert({
        artist_id: user.id,
        name: name.trim(),
        threshold_percentage: threshold,
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setBusy(false);
      return;
    }

    setStages([...stages, data]);
    setName("");
    setThreshold(50);
    setBusy(false);
    router.refresh();
  };

  const updateThreshold = async (id: string, next: number) => {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, threshold_percentage: next } : s)));
    const supabase = createClient();
    await supabase.from("workflow_stages").update({ threshold_percentage: next }).eq("id", id);
    router.refresh();
  };

  const removeStage = async (id: string) => {
    setStages((prev) => prev.filter((s) => s.id !== id));
    const supabase = createClient();
    await supabase.from("workflow_stages").delete().eq("id", id);
    router.refresh();
  };

  const persistOrder = async (next: WorkflowStage[]) => {
    const supabase = createClient();
    await Promise.all(
      next.map((stage, i) =>
        supabase.from("workflow_stages").update({ sort_order: i + 1 }).eq("id", stage.id)
      )
    );
    router.refresh();
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...stages];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setStages(next);
    persistOrder(next);
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (index !== overIndex) setOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex !== null) reorder(dragIndex, index);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 items-start">
      <section className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-navy mb-4">Stages</h2>

        {stages.length === 0 ? (
          <p className="text-sm text-text-muted mb-4">
            No stages yet. Add your first one below, e.g. &quot;Sketch&quot; at 20%.
          </p>
        ) : (
          <ul className="flex flex-col gap-2 mb-2">
            {stages.map((stage, i) => (
              <li
                key={stage.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 cursor-grab active:cursor-grabbing transition-colors ${
                  overIndex === i && dragIndex !== null && dragIndex !== i
                    ? "border-accent bg-accent/5"
                    : "border-glass-border"
                } ${dragIndex === i ? "opacity-50" : ""}`}
              >
                <span
                  className="text-text-muted shrink-0 select-none leading-none text-sm"
                  aria-hidden="true"
                >
                  ⠿
                </span>

                <span className="text-sm font-medium text-navy flex-1 truncate">{stage.name}</span>

                <select
                  value={stage.threshold_percentage}
                  onChange={(e) => updateThreshold(stage.id, Number(e.target.value))}
                  className="field-input w-24 text-sm py-1.5"
                  aria-label={`${stage.name} threshold percentage`}
                >
                  {THRESHOLD_OPTIONS.map((v) => (
                    <option key={v} value={v}>{v}%</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => removeStage(stage.id)}
                  className="text-xs text-text-muted hover:text-error transition-colors"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={addStage} className="glass rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-navy">Add stage</h2>
        <div className="flex gap-3">
          <label className="flex flex-col gap-1.5 flex-1">
            <span className="text-sm text-text-secondary">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Linework"
              className="field-input"
            />
          </label>
          <label className="flex flex-col gap-1.5 w-28">
            <span className="text-sm text-text-secondary">Progress</span>
            <select
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="field-input"
            >
              {THRESHOLD_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}%</option>
              ))}
            </select>
          </label>
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary text-sm self-start">
          {busy ? "Adding…" : "Add stage"}
        </button>
      </form>
    </div>
  );
}
