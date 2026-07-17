"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

type Commission = Tables<"commissions">;

const COLUMNS: { status: string; label: string }[] = [
  { status: "waitlisted", label: "Waitlist" },
  { status: "queued", label: "In Queue" },
  { status: "in_progress", label: "In Progress" },
  { status: "completed", label: "Complete" },
];

export function KanbanBoard({ initial }: { initial: Commission[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  const moveTo = async (id: string, status: string) => {
    const current = items.find((c) => c.id === id);
    if (!current || current.status === status) return;
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    const supabase = createClient();
    await supabase.from("commissions").update({ status }).eq("id", id);
    router.refresh();
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((col) => {
        const colItems = items.filter((c) => c.status === col.status);
        return (
          <div
            key={col.status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(col.status);
            }}
            onDrop={() => {
              if (dragId) moveTo(dragId, col.status);
              setDragId(null);
              setOverCol(null);
            }}
            className={`rounded-2xl p-3 transition-colors ${
              overCol === col.status ? "bg-navy-soft" : "bg-bg-secondary"
            }`}
          >
            <div className="flex items-center justify-between px-1 mb-3">
              <h2 className="text-sm font-semibold tracking-tight text-navy">{col.label}</h2>
              <span className="text-xs font-mono text-text-muted">{colItems.length}</span>
            </div>

            <div className="flex flex-col gap-2 min-h-[80px]">
              {colItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/commissions/${item.id}`}
                  draggable
                  onDragStart={() => setDragId(item.id)}
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
                    <div className="h-full bg-navy rounded-full" style={{ width: `${item.progress_percentage}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
