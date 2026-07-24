import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { KanbanBoard } from "./KanbanBoard";
import { QueueOverview } from "@/components/dashboard/QueueOverview";
import { getAuthUser } from "@/lib/supabase/auth";

export default async function QueuePage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const [{ data: items }, { data: active }, { data: profile }] =
    await Promise.all([
      supabase
        .from("commissions")
        .select("*")
        .order("queue_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true }),
      supabase
        .from("commissions")
        .select("*")
        .neq("status", "completed")
        .order("queue_order", { ascending: true, nullsFirst: false })
        .limit(8),
      supabase
        .from("artist_profiles")
        .select("display_name, kanban_columns")
        .eq("user_id", user.id)
        .single(),
    ]);

  const commissions = items ?? [];
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

      <QueueOverview
        active={active ?? []}
        deadlines={deadlines}
        displayName={displayName}
      />

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
