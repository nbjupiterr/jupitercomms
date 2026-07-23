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

  await Promise.all(
    items.map((item) => {
      if (!isWorkStatus(item.status)) {
        if (item.status === "waitlisted") {
          return supabase.from("commissions").update({ deadline: null }).eq("id", item.id);
        }
        return Promise.resolve();
      }
      const est = estimates.get(item.id);
      return supabase
        .from("commissions")
        .update({ deadline: est?.max ?? null })
        .eq("id", item.id);
    })
  );
}
