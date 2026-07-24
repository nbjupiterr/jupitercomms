import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/auth";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const [{ data: profile }, { data: stages }] = await Promise.all([
    supabase
      .from("artist_profiles")
      .select("public_queue_token, public_slug")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("workflow_stages")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <SettingsClient
      artistId={user.id}
      initialDisplayName={
        (user.user_metadata?.display_name as string | undefined) || ""
      }
      initialSlug={profile?.public_slug ?? null}
      queueToken={profile?.public_queue_token ?? null}
      initialStages={stages ?? []}
    />
  );
}
