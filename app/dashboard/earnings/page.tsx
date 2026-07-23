import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EarningsView } from "@/components/dashboard/EarningsView";

export default async function EarningsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: commissions } = await supabase
    .from("commissions")
    .select("*")
    .eq("artist_id", user.id)
    .order("created_at", { ascending: false });

  return <EarningsView commissions={commissions ?? []} />;
}
