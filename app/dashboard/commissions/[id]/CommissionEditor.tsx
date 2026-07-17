"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

type Commission = Tables<"commissions">;

const COMMISSION_TYPES = [
  "Character Illustration",
  "Concept Art",
  "Portrait",
  "Full Scene",
  "Chibi/Emote",
  "Reference Sheet",
  "Other",
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];

export function CommissionEditor({ commission }: { commission: Commission }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: commission.title,
    commission_type: commission.commission_type ?? "",
    description: commission.description ?? "",
    client_contact: commission.client_contact ?? "",
    price: commission.price?.toString() ?? "",
    currency: commission.currency,
    deadline: commission.deadline ?? "",
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const reset = () => {
    setForm({
      title: commission.title,
      commission_type: commission.commission_type ?? "",
      description: commission.description ?? "",
      client_contact: commission.client_contact ?? "",
      price: commission.price?.toString() ?? "",
      currency: commission.currency,
      deadline: commission.deadline ?? "",
    });
    setEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("commissions")
      .update({
        title: form.title.trim(),
        commission_type: form.commission_type || null,
        description: form.description || null,
        client_contact: form.client_contact || null,
        price: form.price ? Number(form.price) : null,
        currency: form.currency,
        deadline: form.deadline || null,
      })
      .eq("id", commission.id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  };

  const money =
    commission.price != null
      ? `${commission.currency} ${commission.price.toFixed(2)}`
      : "—";
  const deadlineText = commission.deadline
    ? new Date(commission.deadline).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  if (!editing) {
    return (
      <section className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-navy">Details</h2>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            Edit
          </button>
        </div>

        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          <Info label="Type" value={commission.commission_type || "—"} />
          <Info label="Price" value={money} />
          <Info label="Deadline" value={deadlineText} />
          <Info label="Client contact" value={commission.client_contact || "—"} />
          <div className="sm:col-span-2">
            <Info label="Description" value={commission.description || "—"} />
          </div>
        </dl>
      </section>
    );
  }

  return (
    <form onSubmit={handleSave} className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-navy">Edit details</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={reset} className="btn-ghost text-xs px-3 py-1.5">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary text-xs px-3 py-1.5">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm text-text-secondary">Title</span>
          <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className="field-input" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-text-secondary">Type</span>
          <select value={form.commission_type} onChange={(e) => set("commission_type", e.target.value)} className="field-input">
            <option value="">Unspecified</option>
            {COMMISSION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-text-secondary">Client contact</span>
          <input type="text" value={form.client_contact} onChange={(e) => set("client_contact", e.target.value)} className="field-input" placeholder="Email, Discord, etc." />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-text-secondary">Price</span>
          <input type="number" min={0} step={0.01} value={form.price} onChange={(e) => set("price", e.target.value)} className="field-input" placeholder="0.00" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-text-secondary">Currency</span>
          <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className="field-input">
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-text-secondary">Deadline</span>
          <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className="field-input" />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm text-text-secondary">Description</span>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="field-input resize-y" placeholder="Requirements, references, style notes…" />
        </label>
      </div>
    </form>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-text-muted mb-0.5">{label}</dt>
      <dd className="text-sm text-navy whitespace-pre-wrap break-words">{value}</dd>
    </div>
  );
}
