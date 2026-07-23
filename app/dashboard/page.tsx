import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HubEditor } from "@/components/hub/HubEditor";
import type { PublicQueueItem } from "@/components/client/types";
import { getAuthUser } from "@/lib/supabase/auth";

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const displayName =
    (user.user_metadata?.display_name as string | undefined) ||
    "Artist";

  const [{ data: profile }, { data: gallery }, { data: socials }] = await Promise.all([
    supabase.from("artist_profiles").select("*").eq("user_id", user.id).single(),
    supabase
      .from("gallery_items")
      .select("*")
      .eq("artist_id", user.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("social_links")
      .select("*")
      .eq("artist_id", user.id)
      .order("sort_order", { ascending: true }),
  ]);

  if (!profile) {
    return (
      <div className="glass rounded-2xl p-6">
        <p className="text-sm text-text-secondary">Profile not found. Try signing out and back in.</p>
      </div>
    );
  }

  const { data: queue } = await supabase.rpc("get_public_queue", {
    p_token: profile.public_queue_token,
  });

  return (
    <HubEditor
      profile={profile}
      displayName={profile.display_name || displayName}
      initialGallery={gallery ?? []}
      initialSocials={socials ?? []}
      queuePreview={(queue ?? []) as PublicQueueItem[]}
    />
  );
}
