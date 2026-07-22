import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HubEditor } from "@/components/hub/HubEditor";
import type { PriceTable } from "@/lib/supabase/database.types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: gallery }, { data: socials }, { count }] = await Promise.all([
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
    supabase
      .from("commissions")
      .select("*", { count: "exact", head: true })
      .in("status", ["waitlisted", "queued", "in_progress"]),
  ]);

  if (!profile) {
    return (
      <div className="glass rounded-2xl p-6">
        <p className="text-sm text-text-secondary">Profile not found. Try signing out and back in.</p>
      </div>
    );
  }

  return (
    <HubEditor
      profile={{
        ...profile,
        price_table: (profile.price_table ?? { columns: ["Type", "Price"], rows: [] }) as PriceTable,
      }}
      initialGallery={gallery ?? []}
      initialSocials={socials ?? []}
      queuePreviewCount={count ?? 0}
    />
  );
}
