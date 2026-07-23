import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EarningsView } from "@/components/dashboard/EarningsView";
import { getAuthUser } from "@/lib/supabase/auth";

export default async function EarningsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("earnings_entries")
    .select("*")
    .eq("artist_id", user.id)
    .order("occurred_at", { ascending: false });

  return <EarningsView initialEntries={entries ?? []} />;
}
