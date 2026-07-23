"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { syncEstimatedDeadlines } from "@/lib/sync-deadlines";
import { syncAvailabilityStatus } from "@/lib/sync-availability";
import { archiveCommissionEarnings, syncEarningsFromCommission } from "@/lib/earnings";

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

export function StatusControl({
  commissionId,
  status,
}: {
  commissionId: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateStatus = async (next: string) => {
    setValue(next);
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("commissions").update({ status: next }).eq("id", commissionId);
    const { data: row } = await supabase
      .from("commissions")
      .select(
        "id, artist_id, title, client_name, price, currency, status, created_at, updated_at"
      )
      .eq("id", commissionId)
      .maybeSingle();
    if (row) await syncEarningsFromCommission(supabase, row);
    if (user) {
      await syncEstimatedDeadlines(supabase, user.id);
      await syncAvailabilityStatus(supabase, user.id);
    }
    setSaving(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await archiveCommissionEarnings(supabase, commissionId);
    await supabase.from("commissions").delete().eq("id", commissionId);
    if (user) {
      await syncEstimatedDeadlines(supabase, user.id);
      await syncAvailabilityStatus(supabase, user.id);
    }
    router.push("/dashboard/queue");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      <select
        value={value}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={saving}
        className="field-input text-sm py-1.5 pr-8 capitalize"
        aria-label="Commission status"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      {confirmDelete ? (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-medium text-white bg-error px-3 py-1.5 rounded-lg hover:bg-error/90 transition-colors"
          >
            {deleting ? "Deleting…" : "Confirm"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="text-xs text-text-muted hover:text-navy px-2 py-1.5"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleDelete}
          className="text-xs font-medium text-text-muted hover:text-error transition-colors px-2 py-1.5"
        >
          Delete
        </button>
      )}
    </div>
  );
}
