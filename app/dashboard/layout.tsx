import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="h-full min-h-[100dvh] flex bg-transparent">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto p-5 pt-16 lg:pt-6 lg:p-6 xl:p-8">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
