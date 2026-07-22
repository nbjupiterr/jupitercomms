import Link from "next/link";
import type { Tables } from "@/lib/supabase/database.types";

const STATUS_LABELS: Record<string, string> = {
  waitlisted: "Waitlist",
  queued: "Queue",
  in_progress: "Active",
  completed: "Done",
};

type Commission = Tables<"commissions">;

export function ActivityStrip({ items }: { items: Commission[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mb-5 -mx-1">
      <div className="flex items-center justify-between px-1 mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Activity
        </h2>
        <span className="text-[10px] text-text-muted font-mono">{items.length} active</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 px-1 snap-x">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/commissions/${item.id}`}
            className="snap-start shrink-0 w-[200px] glass rounded-xl px-3 py-2.5 hover:border-navy/25 transition-colors"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-navy truncate tracking-tight">{item.title}</p>
              <span className="text-[10px] shrink-0 text-text-muted">
                {STATUS_LABELS[item.status] ?? item.status}
              </span>
            </div>
            <p className="text-xs text-text-muted truncate mb-2">{item.client_name}</p>
            <div className="h-1.5 rounded-full bg-navy-soft overflow-hidden">
              <div
                className="h-full rounded-full bg-navy/70"
                style={{ width: `${item.progress_percentage}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
