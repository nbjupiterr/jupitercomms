"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import {
  normalizeKanbanColumns,
  newKanbanColumn,
  type KanbanColumn,
} from "@/lib/kanban";
import { syncEstimatedDeadlines } from "@/lib/sync-deadlines";
import { syncAvailabilityStatus } from "@/lib/sync-availability";
import { syncEarningsFromCommission } from "@/lib/earnings";

type Commission = Tables<"commissions">;

export function KanbanBoard({
  initial,
  initialColumns,
  artistId,
}: {
  initial: Commission[];
  initialColumns: KanbanColumn[] | unknown;
  artistId: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [columns, setColumns] = useState(() => normalizeKanbanColumns(initialColumns));
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [dragColId, setDragColId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const persistColumns = async (next: KanbanColumn[]) => {
    const ordered = next.map((c, i) => ({ ...c, sort_order: i }));
    setColumns(ordered);
    const supabase = createClient();
    await supabase
      .from("artist_profiles")
      .update({ kanban_columns: ordered })
      .eq("user_id", artistId);
    router.refresh();
  };

  const moveTo = async (id: string, status: string) => {
    const current = items.find((c) => c.id === id);
    if (!current || current.status === status) return;
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    const supabase = createClient();
    await supabase.from("commissions").update({ status }).eq("id", id);
    await syncEarningsFromCommission(supabase, {
      ...current,
      status,
      updated_at: new Date().toISOString(),
    });
    await syncEstimatedDeadlines(supabase, artistId);
    await syncAvailabilityStatus(supabase, artistId);
    router.refresh();
  };

  const renameColumn = async (id: string, label: string) => {
    await persistColumns(columns.map((c) => (c.id === id ? { ...c, label } : c)));
  };

  const addColumn = async () => {
    await persistColumns([...columns, newKanbanColumn(`Board ${columns.length + 1}`)]);
  };

  const deleteColumn = async (col: KanbanColumn) => {
    setError(null);
    if (columns.length <= 1) {
      setError("Keep at least one board.");
      return;
    }
    const count = items.filter((i) => i.status === col.key).length;
    if (count > 0) {
      setError(`Move ${count} card${count === 1 ? "" : "s"} out of “${col.label}” before deleting.`);
      return;
    }
    await persistColumns(columns.filter((c) => c.id !== col.id));
  };

  const reorderColumns = async (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const from = columns.findIndex((c) => c.id === fromId);
    const to = columns.findIndex((c) => c.id === toId);
    if (from < 0 || to < 0) return;
    const next = [...columns];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    await persistColumns(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-text-muted">Drag boards to reorder. Add or delete empty boards anytime.</p>
        <button type="button" onClick={() => void addColumn()} className="btn-ghost text-sm">
          Add board
        </button>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const colItems = items.filter((c) => c.status === col.key);
          return (
            <div
              key={col.id}
              draggable
              onDragStart={() => setDragColId(col.id)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragId) setOverCol(col.key);
              }}
              onDrop={() => {
                if (dragId) {
                  void moveTo(dragId, col.key);
                } else if (dragColId) {
                  void reorderColumns(dragColId, col.id);
                }
                setDragId(null);
                setDragColId(null);
                setOverCol(null);
              }}
              onDragEnd={() => {
                setDragColId(null);
                setOverCol(null);
              }}
              className={`rounded-2xl p-3 transition-colors ${
                overCol === col.key ? "bg-navy-soft" : "bg-bg-secondary"
              } ${dragColId === col.id ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-2 px-1 mb-3">
                <span className="text-text-muted text-xs cursor-grab select-none" aria-hidden>
                  ⠿
                </span>
                <input
                  value={col.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    setColumns((prev) => prev.map((c) => (c.id === col.id ? { ...c, label } : c)));
                  }}
                  onBlur={(e) => void renameColumn(col.id, e.target.value.trim() || col.label)}
                  className="field-input text-sm font-semibold py-1 flex-1 min-w-0"
                  aria-label="Board name"
                />
                <span className="text-xs font-mono text-text-muted shrink-0">{colItems.length}</span>
                <button
                  type="button"
                  onClick={() => void deleteColumn(col)}
                  className="text-[11px] text-text-muted hover:text-error shrink-0"
                  title="Delete board"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-2 min-h-[80px]">
                {colItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/dashboard/commissions/${item.id}`}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDragId(item.id);
                      setDragColId(null);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverCol(null);
                    }}
                    className={`glass rounded-xl p-3 cursor-grab active:cursor-grabbing block transition-all ${
                      dragId === item.id ? "opacity-50" : ""
                    } ${item.status === "completed" ? "opacity-55 saturate-50" : ""}`}
                  >
                    <p className="text-sm font-semibold text-navy tracking-tight truncate">{item.title}</p>
                    <p className="text-xs text-text-secondary truncate">{item.client_name}</p>
                    <div className="mt-2 w-full h-1.5 bg-navy-soft rounded-full overflow-hidden">
                      <div
                        className="h-full bg-navy rounded-full"
                        style={{ width: `${item.progress_percentage}%` }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
