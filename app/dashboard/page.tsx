import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  waitlisted: "Waitlist",
  queued: "In Queue",
  in_progress: "In Progress",
  completed: "Complete",
};
const TONES = ["bg-honey-soft", "bg-coral-soft", "bg-mint-soft", "bg-navy-soft"];
const CARD_ICONS = [
  "/assets/outer-space-amico.svg",
  "/assets/outer-space-bro.svg",
  "/assets/outer-space-pana.svg",
  "/assets/solar-system-pana.svg",
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const displayName = user?.user_metadata?.display_name || "Jupiter";

  const { data: commissions } = await supabase
    .from("commissions")
    .select("*")
    .in("status", ["waitlisted", "queued", "in_progress"])
    .order("queue_order", { ascending: true, nullsFirst: false })
    .limit(4);

  const active = commissions ?? [];

  const { data: deadlineRows } = await supabase
    .from("commissions")
    .select("title, deadline")
    .in("status", ["waitlisted", "queued", "in_progress"])
    .not("deadline", "is", null)
    .order("deadline", { ascending: true });

  const deadlines = (deadlineRows ?? []).map((d) => ({ title: d.title, deadline: d.deadline as string }));

  return (
    <div className="grid xl:grid-cols-[1fr_320px] gap-6">
      {/* Center column */}
      <div>
        <header className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-navy">
              Commission Activity
            </h1>
            <p className="text-text-secondary mt-1 text-sm leading-relaxed">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Link
            href="/dashboard/commissions/new"
            className="btn-accent h-11 w-11 rounded-full flex items-center justify-center text-xl font-semibold shrink-0"
            aria-label="New commission"
          >
            +
          </Link>
        </header>

        {active.length === 0 ? (
          <div className="glass empty-state">
            <Image
              src="/assets/outer-space-cuate.svg"
              alt=""
              width={150}
              height={150}
              className="w-28 h-28 mb-3"
            />
            <p className="text-text-secondary mb-1 font-medium tracking-tight">No active commissions.</p>
            <Link href="/dashboard/commissions/new" className="btn-primary inline-flex text-sm mt-3">
              Create your first commission
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {active.map((item, i) => (
              <Link
                key={item.id}
                href={`/dashboard/commissions/${item.id}`}
                className={`rounded-[1.5rem] ${TONES[i % TONES.length]} p-5 sm:p-6 flex gap-4 sm:gap-6 items-center`}
              >
                <div className="hidden sm:block shrink-0 w-20 h-20">
                  <Image
                    src={CARD_ICONS[i % CARD_ICONS.length]}
                    alt=""
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h2 className="text-lg font-semibold tracking-tight text-navy truncate">
                      {item.title}
                    </h2>
                    <span className="status-badge shrink-0 bg-white/80 text-navy">
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-3 truncate">
                    {item.client_name}
                  </p>
                  <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-navy/70 rounded-full"
                      style={{ width: `${item.progress_percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-text-muted font-mono">{item.progress_percentage}%</p>
                    {item.deadline && (
                      <p className="text-xs font-medium text-navy">{daysRemaining(item.deadline)}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right column */}
      <aside className="flex flex-col gap-5">
        <section className="glass-strong rounded-[1.5rem] p-5">
          <div className="flex items-center gap-3 mb-1">
            <Image
              src="/assets/icon.svg"
              alt=""
              width={44}
              height={44}
              className="w-11 h-11 rounded-full object-contain"
            />
            <div>
              <p className="font-semibold tracking-tight text-navy">{displayName}</p>
              <p className="text-xs text-text-muted">Artist</p>
            </div>
          </div>
        </section>

        <section className="glass-strong rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-tight text-navy">My Work</h2>
            <Link href="/dashboard/queue" className="text-xs text-accent-dim hover:underline">
              Open queue
            </Link>
          </div>
          {active.length === 0 ? (
            <p className="text-xs text-text-muted">Nothing active yet.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {active.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <ProgressRing value={item.progress_percentage} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy truncate tracking-tight">{item.title}</p>
                    <p className="text-xs text-text-muted">{item.progress_percentage}% complete</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <DeadlineCalendar deadlines={deadlines} />
      </aside>
    </div>
  );
}

function daysRemaining(deadline: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(deadline);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  return `${diff}d left`;
}

function DeadlineCalendar({ deadlines }: { deadlines: { title: string; deadline: string }[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days (this month) that have a deadline.
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

  const upcoming = deadlines
    .filter((d) => new Date(d.deadline) >= new Date(today.toDateString()))
    .slice(0, 3);

  return (
    <section className="glass-strong rounded-[1.5rem] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-navy">Deadlines</h2>
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
            // Deadline outline (same box as other outlined days) + inset fill.
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
          if (isToday) {
            cls = "bg-navy text-white font-semibold";
          } else if (hasDeadline) {
            cls = "border-2 border-navy text-navy font-semibold";
          }
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

      <div className="mt-4 border-t border-glass-border pt-3">
        {upcoming.length === 0 ? (
          <p className="text-xs text-text-muted">No upcoming deadlines.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((d, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span className="text-xs text-navy truncate">{d.title}</span>
                <span className="text-[10px] font-mono text-text-muted shrink-0">
                  {new Date(d.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
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
