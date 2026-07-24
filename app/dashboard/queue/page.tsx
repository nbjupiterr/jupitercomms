import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { KanbanBoard } from "./KanbanBoard";
import { QueueOverview } from "@/components/dashboard/QueueOverview";
import { getAuthUser } from "@/lib/supabase/auth";
import type { Tables } from "@/lib/supabase/database.types";

const QUEUE_SELECT =
  "id, artist_id, title, client_name, status, progress_percentage, deadline, queue_order, created_at, updated_at, price, currency, commission_type, description, client_contact, workflow_stage_id";

export default async function QueuePage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const [{ data: items }, { data: profile }] = await Promise.all([
    supabase
      .from("commissions")
      .select(QUEUE_SELECT)
      .order("queue_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("artist_profiles")
      .select("display_name, kanban_columns")
      .eq("user_id", user.id)
      .single(),
  ]);

  const commissions = (items ?? []) as Tables<"commissions">[];
  const active = commissions.filter((c) => c.status !== "completed").slice(0, 8);
  const deadlines = commissions
    .filter((c) => c.deadline && (c.status === "queued" || c.status === "in_progress"))
    .map((c) => ({ title: c.title || "Commission", deadline: c.deadline as string }));
  const displayName =
    profile?.display_name ||
    (user.user_metadata?.display_name as string | undefined) ||
    "Artist";

  return (
    <div>
      <header className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy">Queue</h1>
          <p className="text-text-secondary text-sm mt-1 leading-relaxed max-w-xl">
            Drag commissions between columns to update their status.
          </p>
        </div>
        <Link href="/dashboard/commissions/new" className="btn-primary text-sm">
          New
        </Link>
      </header>

      <QueueOverview active={active} deadlines={deadlines} displayName={displayName} />

      {commissions.length === 0 && (
        <div className="glass empty-state mb-5">
          <Image
            src="/assets/solar-system-amico.svg"
            alt=""
            width={150}
            height={150}
            className="w-28 h-28 mb-3"
          />
          <p className="text-text-secondary font-medium mb-1 tracking-tight">No commissions yet.</p>
          <Link href="/dashboard/commissions/new" className="btn-primary inline-flex text-sm mt-3">
            Create your first commission
          </Link>
        </div>
      )}

      <KanbanBoard
        initial={commissions}
        initialColumns={profile?.kanban_columns}
        artistId={user.id}
      />
    </div>
  );
}
