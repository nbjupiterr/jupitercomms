import { createClient } from "@/lib/supabase/server";
import { WorkflowEditor } from "./WorkflowEditor";

export default async function WorkflowPage() {
  const supabase = await createClient();
  const { data: stages } = await supabase
    .from("workflow_stages")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-navy">Workflow</h1>
        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
          Define the stages you move a commission through. Each stage sets the progress
          percentage shown to you and your clients.
        </p>
      </header>

      <WorkflowEditor initialStages={stages ?? []} />
    </div>
  );
}
