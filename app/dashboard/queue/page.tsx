import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "./KanbanBoard";

export default async function QueuePage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("commissions")
    .select("*")
    .order("queue_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  const commissions = items ?? [];

  return (
    <div>
      <header className="flex items-center justify-between gap-4 mb-6">
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

      {commissions.length === 0 ? (
        <div className="glass empty-state">
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
      ) : (
        <KanbanBoard initial={commissions} />
      )}
    </div>
  );
}
