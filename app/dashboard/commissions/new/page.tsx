"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { syncAvailabilityStatus } from "@/lib/sync-availability";
import { syncEarningsFromCommission } from "@/lib/earnings";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currencies";

const STATUSES = [
  "waitlisted",
  "queued",
  "in_progress",
  "completed",
] as const;

const STATUS_LABELS: Record<string, string> = {
  waitlisted: "Waitlist",
  queued: "In Queue",
  in_progress: "In Progress",
  completed: "Complete",
};

const COMMISSION_TYPES = [
  "Character Illustration",
  "Concept Art",
  "Portrait",
  "Full Scene",
  "Chibi/Emote",
  "Reference Sheet",
  "Other",
];

export default function NewCommissionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("queued");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const form = new FormData(e.currentTarget);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    const priceRaw = form.get("price") as string;
    const nextStatus = (form.get("status") as string) || status;

    const { count } = await supabase
      .from("commissions")
      .select("*", { count: "exact", head: true })
      .eq("artist_id", user.id);

    const { data: created, error: insertError } = await supabase
      .from("commissions")
      .insert({
        artist_id: user.id,
        client_name: form.get("clientName") as string,
        client_contact: (form.get("clientContact") as string) || null,
        title: form.get("title") as string,
        commission_type: (form.get("commissionType") as string) || null,
        status: nextStatus,
        description: (form.get("description") as string) || null,
        price: priceRaw ? Number(priceRaw) : null,
        currency: form.get("currency") as string,
        deadline: deadline.trim() || null,
        queue_order: (count ?? 0) + 1,
      })
      .select(
        "id, artist_id, title, client_name, price, currency, status, created_at, updated_at"
      )
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    if (created) await syncEarningsFromCommission(supabase, created);
    await syncAvailabilityStatus(supabase, user.id);

    router.push("/dashboard/queue");
    router.refresh();
  };

  return (
    <div>
      <Link
        href="/dashboard/queue"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-navy mb-6 tracking-tight"
      >
        <span aria-hidden="true">←</span> Back to queue
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight text-navy mb-2">New Commission</h1>
      <p className="text-sm text-text-secondary mb-8">
        Capture client details and pricing. Est. finish is optional — leave blank if tentative.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <fieldset className="glass rounded-2xl p-6 flex flex-col gap-4">
            <p className="text-sm font-semibold text-navy">Client</p>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-text-secondary">Client name</span>
              <input
                name="clientName"
                type="text"
                required
                className="field-input"
                placeholder="Display name"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-text-secondary">Contact</span>
              <input
                name="clientContact"
                type="text"
                className="field-input"
                placeholder="Email, Discord, Twitter, etc."
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-text-secondary">Status</span>
              <select
                name="status"
                className="field-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-text-secondary">Title</span>
              <input
                name="title"
                type="text"
                required
                className="field-input"
                placeholder="Commission title"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-text-secondary">Type</span>
              <select name="commissionType" className="field-input">
                {COMMISSION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-text-secondary">Description</span>
              <textarea
                name="description"
                rows={3}
                className="field-input resize-y"
                placeholder="Requirements, references, style notes…"
              />
            </label>
          </fieldset>

          <fieldset className="glass rounded-2xl p-6 flex flex-col gap-4">
            <p className="text-sm font-semibold text-navy">Pricing & timing</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-text-secondary">Price</span>
                <input
                  name="price"
                  type="number"
                  min={0}
                  step={0.01}
                  className="field-input"
                  placeholder="0.00"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-text-secondary">Currency</span>
                <select name="currency" defaultValue={DEFAULT_CURRENCY} className="field-input">
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-text-secondary">Est. finish</span>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="field-input"
              />
              <span className="text-[11px] text-text-muted leading-relaxed">
                Optional. Leave blank if you’re not sure yet — shows as — on the client page.
              </span>
              {deadline ? (
                <button
                  type="button"
                  onClick={() => setDeadline("")}
                  className="text-xs text-text-muted hover:text-navy self-start underline underline-offset-2"
                >
                  Clear date
                </button>
              ) : null}
            </label>
          </fieldset>
        </div>

        {error && <p className="text-sm text-error -mt-2">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()} className="btn-ghost text-sm">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary text-sm">
            {loading ? "Creating…" : "Create commission"}
          </button>
        </div>
      </form>
    </div>
  );
}
