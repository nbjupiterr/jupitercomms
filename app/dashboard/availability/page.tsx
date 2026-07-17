"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STATUSES = [
  { value: "open", label: "Open", desc: "Accepting new commissions" },
  { value: "limited", label: "Limited Slots", desc: "Only a few spots left" },
  { value: "waitlist", label: "Waitlist Only", desc: "Queue is full, accepting waitlist" },
  { value: "closed", label: "Closed", desc: "Not accepting commissions" },
  { value: "unavailable", label: "Temporarily Unavailable", desc: "On break" },
] as const;

export default function AvailabilityPage() {
  const [status, setStatus] = useState<string>("open");
  const [slots, setSlots] = useState(5);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("artist_profiles")
        .select("availability_status, available_slots, availability_message")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setStatus(profile.availability_status);
        setSlots(profile.available_slots ?? 5);
        setMessage(profile.availability_message ?? "");
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("artist_profiles")
        .update({
          availability_status: status,
          available_slots: slots,
          availability_message: message || null,
        })
        .eq("user_id", user.id);
    }
    setSaving(false);
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Availability</h1>
        <p className="text-text-secondary text-sm mt-1">
          Control what potential clients see about your commission status.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
      <section className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-navy mb-4">Status</h2>
        <div className="grid gap-2">
          {STATUSES.map(({ value, label, desc }) => (
            <label
              key={value}
              className={`flex items-center gap-4 p-3.5 rounded-xl border cursor-pointer transition-colors ${
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
                onChange={(e) => setStatus(e.target.value)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  status === value ? "border-accent" : "border-text-muted"
                }`}
              >
                {status === value && <div className="w-2 h-2 rounded-full bg-accent" />}
              </div>
              <div>
                <p className="text-sm font-medium text-navy">{label}</p>
                <p className="text-xs text-text-muted">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-6">
        <section className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-navy mb-4">Custom Message</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="field-input w-full resize-y"
            placeholder="E.g. Currently accepting character illustrations only. New slots open in August."
          />
        </section>

        <button onClick={handleSave} disabled={loading || saving} className="btn-primary text-sm self-start">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      </div>
    </div>
  );
}
