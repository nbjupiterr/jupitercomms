import { createClient } from "@/lib/supabase/client";
import {
  countUsedSlots,
  countWaitlisted,
  parseSlotSettings,
  resolveAvailability,
} from "@/lib/availability";

type Supabase = ReturnType<typeof createClient>;

/** Recompute and persist availability_status from slot settings + live commissions. */
export async function syncAvailabilityStatus(
  supabase: Supabase,
  artistId: string
): Promise<void> {
  const [{ data: profile }, { data: rows }] = await Promise.all([
    supabase
      .from("artist_profiles")
      .select(
        "available_slots, limited_threshold, waitlist_capacity, availability_override, availability_status"
      )
      .eq("user_id", artistId)
      .single(),
    supabase.from("commissions").select("status").eq("artist_id", artistId),
  ]);

  if (!profile) return;

  const settings = parseSlotSettings(profile);
  if (!settings.capacity && !settings.override) return;

  const statuses = (rows ?? []).map((r) => r.status);
  const snap = resolveAvailability(
    settings,
    countUsedSlots(statuses),
    countWaitlisted(statuses),
    profile.availability_status
  );

  if (snap.status !== profile.availability_status) {
    await supabase
      .from("artist_profiles")
      .update({ availability_status: snap.status })
      .eq("user_id", artistId);
  }
}
