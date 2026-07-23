"use client";

const STATUSES = [
  { value: "open", label: "Open", desc: "Accepting new commissions", auto: true },
  { value: "limited", label: "Limited slots", desc: "Only a few spots left", auto: true },
  { value: "waitlist", label: "Waitlist only", desc: "Queue is full, accepting waitlist", auto: true },
  { value: "closed", label: "Closed", desc: "Not accepting commissions", auto: false },
  { value: "unavailable", label: "Temporarily unavailable", desc: "On break", auto: false },
] as const;

export type SlotForm = {
  capacity: string;
  limitedThreshold: string;
  waitlistCapacity: string;
};

export function AvailabilityEditor({
  status,
  message,
  slotsEnabled,
  slotForm,
  derivedHint,
  onStatusChange,
  onMessageChange,
  onSlotFormChange,
}: {
  status: string;
  message: string;
  slotsEnabled: boolean;
  slotForm: SlotForm;
  derivedHint: string | null;
  onStatusChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onSlotFormChange: (next: SlotForm) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-glass-border p-4 flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-navy">Slot capacity</h3>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Queued and in-progress commissions fill slots. Leave capacity empty to manage status
            manually. Raise capacity anytime to open more spots.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-text-secondary">Total slots</span>
            <input
              type="number"
              min={1}
              value={slotForm.capacity}
              onChange={(e) => onSlotFormChange({ ...slotForm, capacity: e.target.value })}
              className="field-input"
              placeholder="e.g. 5"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-text-secondary">Limited when ≤</span>
            <input
              type="number"
              min={0}
              value={slotForm.limitedThreshold}
              onChange={(e) =>
                onSlotFormChange({ ...slotForm, limitedThreshold: e.target.value })
              }
              className="field-input"
              placeholder="2"
              disabled={!slotsEnabled && !slotForm.capacity}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-text-secondary">Waitlist max</span>
            <input
              type="number"
              min={0}
              value={slotForm.waitlistCapacity}
              onChange={(e) =>
                onSlotFormChange({ ...slotForm, waitlistCapacity: e.target.value })
              }
              className="field-input"
              placeholder="10"
              disabled={!slotsEnabled && !slotForm.capacity}
            />
          </label>
        </div>
        {derivedHint && (
          <p className="text-xs text-accent-dim leading-relaxed">{derivedHint}</p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          {STATUSES.map(({ value, label, desc, auto }) => {
            const locked = slotsEnabled && auto;
            return (
              <label
                key={value}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  locked ? "cursor-default opacity-90" : "cursor-pointer"
                } ${
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
                  disabled={locked}
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
                  <p className="text-sm font-medium text-navy">
                    {label}
                    {locked && (
                      <span className="ml-1.5 text-[10px] font-normal text-text-muted">auto</span>
                    )}
                  </p>
                  <p className="text-[11px] text-text-muted">{desc}</p>
                </div>
              </label>
            );
          })}
          {slotsEnabled && (status === "closed" || status === "unavailable") && (
            <button
              type="button"
              onClick={() => onStatusChange("open")}
              className="text-xs text-accent-dim underline underline-offset-2 text-left px-1"
            >
              Clear override and return to automatic status
            </button>
          )}
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
    </div>
  );
}
