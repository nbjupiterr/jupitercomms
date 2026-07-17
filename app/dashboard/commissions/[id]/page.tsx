import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StageControl } from "./StageControl";
import { StatusControl } from "./StatusControl";
import { EditableClientName } from "./EditableClientName";
import { CommissionEditor } from "./CommissionEditor";

export default async function CommissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: commission } = await supabase
    .from("commissions")
    .select("*")
    .eq("id", id)
    .single();

  if (!commission) {
    notFound();
  }

  const { data: stages } = await supabase
    .from("workflow_stages")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <Link href="/dashboard/queue" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-navy mb-6 tracking-tight">
        <span aria-hidden="true">←</span> Back to queue
      </Link>

      <header className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy">{commission.title}</h1>
          <EditableClientName commissionId={commission.id} clientName={commission.client_name} />
        </div>
        <StatusControl commissionId={commission.id} status={commission.status} />
      </header>

      <div className="mb-6">
        <StageControl
          commissionId={commission.id}
          progress={commission.progress_percentage}
          workflowStageId={commission.workflow_stage_id}
          stages={stages ?? []}
        />
      </div>

      <CommissionEditor commission={commission} />
    </div>
  );
}
