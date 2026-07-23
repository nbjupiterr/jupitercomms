import { createClient } from "@/lib/supabase/client";
import {
  estimatesById,
  isWorkStatus,
  parseTat,
  type TatSettings,
} from "@/lib/tat";

type Supabase = ReturnType<typeof createClient>;

/** Persist FCFS TAT estimates into commissions.deadline (uses max of range). */
export async function syncEstimatedDeadlines(
  supabase: Supabase,
  artistId: string,
  tatOverride?: TatSettings | null
): Promise<void> {
  const [{ data: profile }, { data: rows }] = await Promise.all([
    supabase
      .from("artist_profiles")
      .select("tat_min_days, tat_max_days")
      .eq("user_id", artistId)
      .single(),
    supabase
      .from("commissions")
      .select("id, status, queue_order, created_at")
      .eq("artist_id", artistId),
  ]);

  const tat = tatOverride !== undefined ? tatOverride : parseTat(profile);
  const items = rows ?? [];
  const estimates = estimatesById(items, tat);

  const updates = items
    .map((item) => {
      if (!isWorkStatus(item.status)) {
        if (item.status === "waitlisted") {
          return { id: item.id, deadline: null as string | null };
        }
        return null;
      }
      const est = estimates.get(item.id);
      return { id: item.id, deadline: est?.max ?? null };
    })
    .filter((row): row is { id: string; deadline: string | null } => row != null);

  if (updates.length === 0) return;

  const { error } = await supabase.rpc("sync_commission_deadlines", {
    p_updates: updates,
  });

  // Fallback if migration not applied yet.
  if (error) {
    await Promise.all(
      updates.map((row) =>
        supabase.from("commissions").update({ deadline: row.deadline }).eq("id", row.id)
      )
    );
  }
}
