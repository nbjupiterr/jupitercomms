"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

type WorkflowStage = Tables<"workflow_stages">;

export function StageControl({
  commissionId,
  progress,
  workflowStageId,
  stages,
}: {
  commissionId: string;
  progress: number;
  workflowStageId: string | null;
  stages: WorkflowStage[];
}) {
  const router = useRouter();
  const [stageId, setStageId] = useState(workflowStageId);
  const [saving, setSaving] = useState(false);

  const activeStage = stages.find((s) => s.id === stageId);
  const displayProgress = activeStage?.threshold_percentage ?? progress;

  const selectStage = async (nextId: string) => {
    setStageId(nextId);
    setSaving(true);
    const supabase = createClient();
    await supabase.from("commissions").update({ workflow_stage_id: nextId }).eq("id", commissionId);
    setSaving(false);
    router.refresh();
  };

  if (stages.length === 0) {
    return (
      <section className="glass rounded-2xl p-5 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-text-secondary">Progress</span>
          <span className="font-medium font-mono">{progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-navy-soft rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-text-muted">
          No workflow stages set up yet.{" "}
          <Link href="/dashboard/workflow" className="text-accent-dim hover:underline">
            Define your workflow
          </Link>{" "}
          to track progress by stage.
        </p>
      </section>
    );
  }

  return (
    <section className="glass rounded-2xl p-5 mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-text-secondary">Progress</span>
        <span className="font-medium font-mono">{displayProgress}%{saving ? " · saving…" : ""}</span>
      </div>
      <div className="w-full h-2.5 bg-navy-soft rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-300"
          style={{ width: `${displayProgress}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {stages.map((stage) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => selectStage(stage.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors tracking-tight ${
              stageId === stage.id
                ? "border-navy bg-navy text-white font-medium"
                : "border-glass-border text-text-secondary hover:text-navy hover:bg-navy-soft"
            }`}
          >
            {stage.name} · {stage.threshold_percentage}%
          </button>
        ))}
      </div>
    </section>
  );
}
