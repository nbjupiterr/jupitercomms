import type { PublicQueueItem } from "@/components/client/types";
import { DEFAULT_KANBAN_COLUMNS, normalizeKanbanColumns, type KanbanColumn } from "@/lib/kanban";

function itemKey(item: PublicQueueItem) {
  return `${item.status}:${item.queue_position ?? "x"}:${item.client_name}:${item.deadline ?? ""}`;
}

function formatDeadline(deadline: string | null | undefined): string {
  if (!deadline) return "—";
  return new Date(deadline + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function PublicQueueKanban({
  queue,
  columns,
}: {
  queue: PublicQueueItem[];
  columns?: KanbanColumn[] | unknown;
}) {
  const cols = normalizeKanbanColumns(columns ?? DEFAULT_KANBAN_COLUMNS);
  const hasAny = queue.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {!hasAny && (
        <p className="text-sm text-text-secondary text-center py-6">Queue is empty right now.</p>
      )}
      <div className="grid grid-cols-2 gap-2.5">
        {cols.map((col) => {
          const items = queue.filter((q) => q.status === col.key);
          return (
            <div
              key={col.id}
              className="rounded-xl bg-bg-secondary/70 border border-glass-border p-2.5"
            >
              <div className="flex items-center justify-between px-1 mb-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-text-muted truncate">
                  {col.label}
                </h3>
                <span className="text-[10px] font-mono text-text-muted shrink-0">{items.length}</span>
              </div>
              <ul className="flex flex-col gap-1.5 min-h-[48px]">
                {items.length === 0 ? (
                  <li className="text-[11px] text-text-muted px-1 py-2">—</li>
                ) : (
                  items.map((item) => (
                    <li
                      key={itemKey(item)}
                      className={`rounded-lg px-2.5 py-2 ${
                        item.is_current
                          ? "bg-[#3a3d3a] text-white"
                          : col.key === "completed"
                            ? "glass opacity-70"
                            : "glass"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-medium truncate ${
                            item.is_current ? "text-white" : "text-navy"
                          }`}
                        >
                          {item.client_name}
                        </span>
                        <span
                          className={`text-[10px] font-mono shrink-0 ${
                            item.is_current ? "text-white/70" : "text-text-muted"
                          }`}
                        >
                          {item.queue_position != null ? `#${item.queue_position}` : "—"}
                        </span>
                      </div>
                      <p
                        className={`text-[10px] mt-1 ${
                          item.is_current ? "text-white/75" : "text-text-muted"
                        }`}
                      >
                        Est. {formatDeadline(item.deadline)}
                      </p>
                      {col.key !== "completed" && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div
                            className={`flex-1 h-1 rounded-full overflow-hidden ${
                              item.is_current ? "bg-white/25" : "bg-navy-soft"
                            }`}
                          >
                            <div
                              className={`h-full rounded-full ${item.is_current ? "bg-white" : "bg-navy"}`}
                              style={{ width: `${item.progress_percentage}%` }}
                            />
                          </div>
                          <span
                            className={`text-[9px] font-mono ${
                              item.is_current ? "text-white/80" : "text-text-muted"
                            }`}
                          >
                            {item.progress_percentage}%
                          </span>
                        </div>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
