export type SlotSettings = {
  capacity: number | null;
  limitedThreshold: number;
  waitlistCapacity: number;
  override: "closed" | "unavailable" | null;
};

export type AvailabilitySnapshot = {
  status: string;
  usedSlots: number;
  waitlisted: number;
  remainingSlots: number;
  waitlistRemaining: number;
  slotsEnabled: boolean;
};

export function parseSlotSettings(input: {
  available_slots?: number | null;
  limited_threshold?: number | null;
  waitlist_capacity?: number | null;
  availability_override?: string | null;
}): SlotSettings {
  const override =
    input.availability_override === "closed" || input.availability_override === "unavailable"
      ? input.availability_override
      : null;
  return {
    capacity: input.available_slots != null && input.available_slots > 0 ? input.available_slots : null,
    limitedThreshold: input.limited_threshold ?? 2,
    waitlistCapacity: input.waitlist_capacity ?? 10,
    override,
  };
}

/** Count commissions that fill open slots. */
export function countUsedSlots(statuses: string[]): number {
  return statuses.filter((s) => s === "queued" || s === "in_progress").length;
}

export function countWaitlisted(statuses: string[]): number {
  return statuses.filter((s) => s === "waitlisted").length;
}

export function resolveAvailability(
  settings: SlotSettings,
  usedSlots: number,
  waitlisted: number,
  fallbackStatus = "open"
): AvailabilitySnapshot {
  const slotsEnabled = settings.capacity != null;

  if (settings.override) {
    return {
      status: settings.override,
      usedSlots,
      waitlisted,
      remainingSlots: slotsEnabled ? Math.max(0, settings.capacity! - usedSlots) : 0,
      waitlistRemaining: Math.max(0, settings.waitlistCapacity - waitlisted),
      slotsEnabled,
    };
  }

  if (!slotsEnabled) {
    return {
      status: fallbackStatus,
      usedSlots,
      waitlisted,
      remainingSlots: 0,
      waitlistRemaining: 0,
      slotsEnabled: false,
    };
  }

  const capacity = settings.capacity!;
  const remainingSlots = Math.max(0, capacity - usedSlots);
  const waitlistRemaining = Math.max(0, settings.waitlistCapacity - waitlisted);
  const limitedAt = Math.max(0, settings.limitedThreshold);

  let status: string;
  if (remainingSlots > limitedAt) status = "open";
  else if (remainingSlots > 0) status = "limited";
  else if (waitlistRemaining > 0) status = "waitlist";
  else status = "closed";

  return {
    status,
    usedSlots,
    waitlisted,
    remainingSlots,
    waitlistRemaining,
    slotsEnabled: true,
  };
}

/** Line shown under the status badge on the client page. */
export function availabilityDetailLine(snap: AvailabilitySnapshot): string | null {
  if (!snap.slotsEnabled) return null;
  if (snap.status === "open" || snap.status === "limited") {
    const n = snap.remainingSlots;
    return n === 1 ? "1 slot left" : `${n} slots left`;
  }
  if (snap.status === "waitlist") {
    const n = snap.waitlistRemaining;
    return n === 1 ? "Waitlist: 1 spot left" : `Waitlist: ${n} spots left`;
  }
  return null;
}
