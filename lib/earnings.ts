import { createClient } from "@/lib/supabase/client";
import { DEFAULT_CURRENCY } from "@/lib/currencies";
import type { Tables } from "@/lib/supabase/database.types";

type Supabase = ReturnType<typeof createClient>;
type Commission = Tables<"commissions">;

const TRACKED = new Set(["completed", "queued", "in_progress"]);

export type EarningsKind = "pending" | "completed";

/** Sync a priced commission into the earnings ledger (or remove if no longer tracked). */
export async function syncEarningsFromCommission(
  supabase: Supabase,
  commission: Pick<
    Commission,
    | "id"
    | "artist_id"
    | "title"
    | "client_name"
    | "price"
    | "currency"
    | "status"
    | "created_at"
    | "updated_at"
  >
): Promise<void> {
  if (commission.price == null || !TRACKED.has(commission.status)) {
    await supabase.from("earnings_entries").delete().eq("commission_id", commission.id);
    return;
  }

  const kind: EarningsKind = commission.status === "completed" ? "completed" : "pending";
  const occurredAt =
    kind === "completed"
      ? commission.updated_at || commission.created_at
      : commission.created_at;

  const { data: existing } = await supabase
    .from("earnings_entries")
    .select("id")
    .eq("commission_id", commission.id)
    .maybeSingle();

  const payload = {
    artist_id: commission.artist_id,
    commission_id: commission.id,
    title: commission.title,
    client_name: commission.client_name,
    amount: commission.price,
    currency: commission.currency || DEFAULT_CURRENCY,
    kind,
    occurred_at: occurredAt,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase.from("earnings_entries").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("earnings_entries").insert(payload);
  }
}

/** Snapshot before hard-deleting a commission so the ledger keeps the amount. */
export async function archiveCommissionEarnings(
  supabase: Supabase,
  commissionId: string
): Promise<void> {
  const { data } = await supabase
    .from("commissions")
    .select(
      "id, artist_id, title, client_name, price, currency, status, created_at, updated_at"
    )
    .eq("id", commissionId)
    .maybeSingle();

  if (!data || data.price == null) return;

  // Force completed kind when archiving off the board if it was finished work;
  // otherwise keep pending so totals still reflect unpaid/in-flight deletions.
  const kind: EarningsKind =
    data.status === "completed" ? "completed" : "pending";

  await syncEarningsFromCommission(supabase, {
    ...data,
    status: kind === "completed" ? "completed" : "queued",
  });
}
