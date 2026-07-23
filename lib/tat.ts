export const WORK_STATUSES = new Set(["queued", "in_progress"]);

export type TatSettings = {
  minDays: number;
  maxDays: number;
};

export type DateEstimate = {
  min: string; // YYYY-MM-DD
  max: string;
};

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

export function parseTat(input: {
  tat_min_days?: number | null;
  tat_max_days?: number | null;
} | null | undefined): TatSettings | null {
  const min = input?.tat_min_days;
  const max = input?.tat_max_days;
  if (min == null || max == null || min < 1 || max < min) return null;
  return { minDays: min, maxDays: max };
}

/** 1-based FCFS position → estimated completion window from today. */
export function estimateForPosition(
  position: number,
  tat: TatSettings,
  from: Date = new Date()
): DateEstimate {
  const start = new Date(from);
  start.setHours(12, 0, 0, 0);
  return {
    min: toISODate(addDays(start, position * tat.minDays)),
    max: toISODate(addDays(start, position * tat.maxDays)),
  };
}

export function formatEstimate(est: DateEstimate | null | undefined): string {
  if (!est) return "—";
  const fmt = (iso: string) =>
    new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  if (est.min === est.max) return fmt(est.min);
  return `${fmt(est.min)} – ${fmt(est.max)}`;
}

export function isWorkStatus(status: string): boolean {
  return WORK_STATUSES.has(status);
}

type Queueable = {
  id: string;
  status: string;
  queue_order: number | null;
  created_at: string;
  title?: string;
};

export function sortWorkQueue<T extends Queueable>(items: T[]): T[] {
  return [...items]
    .filter((c) => isWorkStatus(c.status))
    .sort((a, b) => {
      const qo = (a.queue_order ?? 0) - (b.queue_order ?? 0);
      if (qo !== 0) return qo;
      return a.created_at.localeCompare(b.created_at);
    });
}

/** Build id → estimate map for queued / in_progress commissions. */
export function estimatesById<T extends Queueable>(
  items: T[],
  tat: TatSettings | null,
  from: Date = new Date()
): Map<string, DateEstimate> {
  const map = new Map<string, DateEstimate>();
  if (!tat) return map;
  sortWorkQueue(items).forEach((item, index) => {
    map.set(item.id, estimateForPosition(index + 1, tat, from));
  });
  return map;
}

export function deadlinesFromEstimates<T extends Queueable>(
  items: T[],
  tat: TatSettings | null
): { title: string; deadline: string }[] {
  const map = estimatesById(items, tat);
  return sortWorkQueue(items)
    .map((item) => {
      const est = map.get(item.id);
      if (!est) return null;
      return { title: item.title || "Commission", deadline: est.max };
    })
    .filter((d): d is { title: string; deadline: string } => d != null);
}
