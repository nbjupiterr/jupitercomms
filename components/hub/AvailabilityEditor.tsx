"use client";

const STATUSES = [
  { value: "open", label: "Open", desc: "Accepting new commissions" },
  { value: "limited", label: "Limited Slots", desc: "Only a few spots left" },
  { value: "waitlist", label: "Waitlist Only", desc: "Queue is full, accepting waitlist" },
  { value: "closed", label: "Closed", desc: "Not accepting commissions" },
  { value: "unavailable", label: "Temporarily Unavailable", desc: "On break" },
] as const;

export function AvailabilityEditor({
  status,
  message,
  onStatusChange,
  onMessageChange,
}: {
  status: string;
  message: string;
  onStatusChange: (value: string) => void;
  onMessageChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-2">
        {STATUSES.map(({ value, label, desc }) => (
          <label
            key={value}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              status === value
                ? "border-accent bg-accent/10"
                : "border-glass-border hover:bg-bg-secondary"
            }`}
          >
            <input
              type="radio"
              name="availability"
              value={value}
              checked={status === value}
              onChange={(e) => onStatusChange(e.target.value)}
              className="sr-only"
            />
            <div
              className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                status === value ? "border-accent" : "border-text-muted"
              }`}
            >
              {status === value && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
            </div>
            <div>
              <p className="text-sm font-medium text-navy">{label}</p>
              <p className="text-[11px] text-text-muted">{desc}</p>
            </div>
          </label>
        ))}
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-text-secondary">Custom message</span>
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={6}
          className="field-input w-full resize-y min-h-[140px]"
          placeholder="E.g. Currently accepting character illustrations only."
        />
      </label>
    </div>
  );
}
