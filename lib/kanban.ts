export type KanbanColumn = {
  id: string;
  key: string;
  label: string;
  sort_order: number;
};

export const DEFAULT_KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "waitlisted", key: "waitlisted", label: "Waitlist", sort_order: 0 },
  { id: "queued", key: "queued", label: "In Queue", sort_order: 1 },
  { id: "in_progress", key: "in_progress", label: "In Progress", sort_order: 2 },
  { id: "completed", key: "completed", label: "Completed", sort_order: 3 },
];

export function normalizeKanbanColumns(value: unknown): KanbanColumn[] {
  if (!Array.isArray(value) || value.length === 0) {
    return DEFAULT_KANBAN_COLUMNS.map((c) => ({ ...c }));
  }
  return value
    .map((raw, i) => {
      const col = (raw ?? {}) as Partial<KanbanColumn>;
      const key = String(col.key || col.id || `board_${i}`);
      return {
        id: String(col.id || key),
        key,
        label: String(col.label || key),
        sort_order: typeof col.sort_order === "number" ? col.sort_order : i,
      };
    })
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c, i) => ({ ...c, sort_order: i }));
}

export function newKanbanColumn(label = "New board"): KanbanColumn {
  const key = `board_${typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : Date.now().toString(36)}`;
  return { id: key, key, label, sort_order: 999 };
}
