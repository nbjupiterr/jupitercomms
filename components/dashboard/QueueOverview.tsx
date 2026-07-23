import Image from "next/image";
import Link from "next/link";
import { ArtistChip } from "@/components/dashboard/ArtistChip";
import { LocalNow } from "@/components/dashboard/LocalNow";
import type { Tables } from "@/lib/supabase/database.types";

type Commission = Tables<"commissions">;

export function QueueOverview({
  active,
  deadlines,
  displayName,
}: {
  active: Commission[];
  deadlines: { title: string; deadline: string }[];
  displayName: string;
}) {
  return (
    <div className="flex flex-col gap-4 mb-5">
      <section className="glass-strong rounded-[1.5rem] px-5 py-4 flex items-center justify-between gap-3">
        <ArtistChip name={displayName} />
        <LocalNow />
      </section>

      {/* My Work ≈ 2× calendar; middle column lists deadline dates */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
        <section className="glass-strong rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold tracking-tight text-navy">My Work</h2>
          </div>
          {active.length === 0 ? (
            <div className="flex flex-col items-center text-center py-2">
              <Image
                src="/assets/outer-space-cuate.svg"
                alt=""
                width={120}
                height={120}
                className="w-24 h-24 mb-2 opacity-90"
              />
              <p className="text-xs text-text-muted">Nothing active yet.</p>
              <Link href="/dashboard/commissions/new" className="text-xs text-accent-dim underline underline-offset-2 mt-1">
                Create a commission
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {active.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/dashboard/commissions/${item.id}`}
                    className="flex items-center gap-3 rounded-xl hover:bg-bg-secondary/60 transition-colors p-1 -m-1"
                  >
                    <ProgressRing value={item.progress_percentage} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy truncate tracking-tight">{item.title}</p>
                      <p className="text-xs text-text-muted">{item.progress_percentage}% complete</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <DeadlineList deadlines={deadlines} />

        <DeadlineCalendar deadlines={deadlines} />
      </div>
    </div>
  );
}

function DeadlineList({ deadlines }: { deadlines: { title: string; deadline: string }[] }) {
  const today = new Date();
  const upcoming = deadlines
    .filter((d) => new Date(d.deadline) >= new Date(today.toDateString()))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <section className="glass-strong rounded-[1.5rem] p-5 flex flex-col min-h-0">
      <h2 className="text-sm font-semibold tracking-tight text-navy mb-3">Upcoming dates</h2>
      {upcoming.length === 0 ? (
        <p className="text-xs text-text-muted">No upcoming deadlines.</p>
      ) : (
        <ul className="flex flex-col gap-2.5 overflow-y-auto">
          {upcoming.map((d, i) => {
            const date = new Date(d.deadline);
            return (
              <li
                key={`${d.title}-${d.deadline}-${i}`}
                className="flex items-start gap-3 rounded-xl border border-glass-border px-3 py-2.5"
              >
                <div className="shrink-0 w-11 text-center leading-tight">
                  <p className="text-[10px] uppercase tracking-wide text-text-muted">
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </p>
                  <p className="text-lg font-semibold text-navy tabular-nums">
                    {date.getDate()}
                  </p>
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-navy truncate tracking-tight">{d.title}</p>
                  <p className="text-[10px] font-mono text-text-muted mt-0.5">
                    {date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0 -rotate-90">
      <circle cx="20" cy="20" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-navy-soft" />
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-accent"
      />
    </svg>
  );
}

function DeadlineCalendar({ deadlines }: { deadlines: { title: string; deadline: string }[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const deadlineDays = new Set(
    deadlines
      .map((d) => new Date(d.deadline))
      .filter((d) => d.getFullYear() === year && d.getMonth() === month)
      .map((d) => d.getDate())
  );

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <section className="glass-strong rounded-[1.5rem] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-navy">Calendar</h2>
        <span className="text-xs text-text-muted">{monthLabel}</span>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-[10px] text-center text-text-muted font-medium">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />;
          const isToday = day === today.getDate();
          const hasDeadline = deadlineDays.has(day);

          if (isToday && hasDeadline) {
            return (
              <span
                key={i}
                className="relative aspect-square flex items-center justify-center rounded-lg border-2 border-navy"
              >
                <span className="absolute inset-[2px] bg-navy rounded-md" />
                <span className="relative text-[11px] font-semibold text-white">{day}</span>
              </span>
            );
          }

          let cls = "text-text-secondary";
          if (isToday) cls = "bg-navy text-white font-semibold";
          else if (hasDeadline) cls = "border-2 border-navy text-navy font-semibold";

          return (
            <span
              key={i}
              className={`aspect-square flex items-center justify-center text-[11px] rounded-lg ${cls}`}
            >
              {day}
            </span>
          );
        })}
      </div>
    </section>
  );
}
